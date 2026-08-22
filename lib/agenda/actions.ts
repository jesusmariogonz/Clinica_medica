"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, getSesionActual } from "@/lib/auth/rbac";
import { calcularSlotsDisponibles } from "@/lib/agenda/slots";
import { enviarConfirmacionCita } from "@/lib/resend/emails";

export interface SlotsResult {
  slots: string[];
  error?: string;
}

// Calcula los horarios disponibles para un servicio en una fecha dada.
// Requiere sesión (paciente/asistente/médico) porque lee disponibilidad y
// citas, ambas protegidas por RLS a usuarios autenticados.
export async function obtenerSlotsDisponiblesAction(
  fechaISO: string, // "YYYY-MM-DD"
  servicioId: string
): Promise<SlotsResult> {
  const sesion = await getSesionActual();
  if (!sesion) return { slots: [], error: "No autenticado." };

  const supabase = await createClient();

  const { data: servicio } = await supabase
    .from("servicios")
    .select("duracion_minutos")
    .eq("id", servicioId)
    .single();

  if (!servicio) return { slots: [], error: "Servicio no encontrado." };

  const fecha = new Date(`${fechaISO}T00:00:00`);
  const diaSemana = fecha.getDay();

  const [{ data: disponibilidad }, { data: bloqueosDia }, { data: citasDia }] =
    await Promise.all([
      supabase
        .from("disponibilidad_semanal")
        .select("hora_inicio, hora_fin")
        .eq("dia_semana", diaSemana)
        .eq("activo", true),
      supabase
        .from("bloqueos_disponibilidad")
        .select("hora_inicio, hora_fin")
        .eq("fecha", fechaISO),
      supabase
        .from("citas")
        .select("fecha_hora, servicios(duracion_minutos)")
        .gte("fecha_hora", `${fechaISO}T00:00:00`)
        .lt("fecha_hora", `${fechaISO}T23:59:59`)
        .not("estado", "eq", "cancelada"),
    ]);

  const diaCompletoBloqueado = (bloqueosDia ?? []).some((b) => !b.hora_inicio);

  const bloqueosParciales = (bloqueosDia ?? [])
    .filter((b) => b.hora_inicio && b.hora_fin)
    .map((b) => ({ horaInicio: b.hora_inicio as string, horaFin: b.hora_fin as string }));

  const citasOcupadas = (citasDia ?? []).map((c) => {
    const hora = new Date(c.fecha_hora).toTimeString().slice(0, 5);
    const duracion = (c.servicios as unknown as { duracion_minutos: number } | null)
      ?.duracion_minutos ?? 30;
    return { horaInicio: hora, duracionMinutos: duracion };
  });

  const esHoy = fechaISO === new Date().toISOString().slice(0, 10);
  const ahoraMinutos = esHoy ? new Date().getHours() * 60 + new Date().getMinutes() : undefined;

  const slots = calcularSlotsDisponibles({
    rangosTrabajo: (disponibilidad ?? []).map((d) => ({
      horaInicio: d.hora_inicio,
      horaFin: d.hora_fin,
    })),
    duracionMinutos: servicio.duracion_minutos,
    citasOcupadas,
    bloqueos: bloqueosParciales,
    diaCompletoBloqueado,
    ahoraMinutos,
  });

  return { slots };
}

export interface CrearCitaState {
  error: string | null;
  ok: boolean;
}

// Crea la cita del paciente autenticado. Si el paciente aún no tiene fila
// en `pacientes` (primera reserva), la crea con los datos mínimos del
// formulario, vinculada a su user_id (policy pacientes_insert_self).
export async function crearCitaAction(
  _prevState: CrearCitaState,
  formData: FormData
): Promise<CrearCitaState> {
  const sesion = await requireRole("paciente");
  const supabase = await createClient();

  const servicioId = String(formData.get("servicio_id") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  const apellidoPaterno = String(formData.get("apellido_paterno") ?? "");
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "");
  const telefono = String(formData.get("telefono") ?? "");

  if (!servicioId || !fecha || !hora) {
    return { error: "Faltan datos de la cita.", ok: false };
  }

  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, anticipo_requerido")
    .eq("id", servicioId)
    .single();

  if (!servicio) {
    return { error: "Servicio no válido.", ok: false };
  }

  let { data: paciente } = await supabase
    .from("pacientes")
    .select("id, nombre")
    .eq("user_id", sesion.userId)
    .maybeSingle();

  if (!paciente) {
    if (!nombre || !apellidoPaterno || !fechaNacimiento) {
      return { error: "Completa tus datos de identificación para reservar.", ok: false };
    }

    const { data: nuevoPaciente, error: pacienteError } = await supabase
      .from("pacientes")
      .insert({
        user_id: sesion.userId,
        nombre,
        apellido_paterno: apellidoPaterno,
        fecha_nacimiento: fechaNacimiento,
        telefono: telefono || null,
        email: sesion.email,
      })
      .select("id, nombre")
      .single();

    if (pacienteError || !nuevoPaciente) {
      return { error: "No se pudo registrar tu información. Intenta de nuevo.", ok: false };
    }
    paciente = nuevoPaciente;
  }

  const fechaHoraISO = `${fecha}T${hora}:00`;

  const { error: citaError } = await supabase.from("citas").insert({
    paciente_id: paciente.id,
    servicio_id: servicioId,
    fecha_hora: fechaHoraISO,
    requiere_anticipo: servicio.anticipo_requerido > 0,
    estado: "pendiente",
  });

  if (citaError) {
    return { error: "Ese horario ya no está disponible. Elige otro.", ok: false };
  }

  await enviarConfirmacionCita(sesion.email, {
    nombrePaciente: paciente.nombre,
    nombreServicio: servicio.nombre,
    fechaHora: new Date(fechaHoraISO),
    requiereAnticipo: servicio.anticipo_requerido > 0,
  });

  revalidatePath("/portal");
  return { error: null, ok: true };
}

// --- Gestión de disponibilidad (solo médico) ---

export interface DisponibilidadState {
  error: string | null;
}

export async function agregarRangoDisponibilidadAction(
  _prevState: DisponibilidadState,
  formData: FormData
): Promise<DisponibilidadState> {
  await requireRole("medico");
  const supabase = await createClient();

  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const horaFin = String(formData.get("hora_fin") ?? "");

  if (Number.isNaN(diaSemana) || !horaInicio || !horaFin || horaFin <= horaInicio) {
    return { error: "Rango de horario inválido." };
  }

  const { error } = await supabase.from("disponibilidad_semanal").insert({
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
  });

  if (error) return { error: "No se pudo guardar el horario." };

  revalidatePath("/admin/agenda");
  return { error: null };
}

export async function eliminarRangoDisponibilidadAction(id: string) {
  await requireRole("medico");
  const supabase = await createClient();
  await supabase.from("disponibilidad_semanal").delete().eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function agregarBloqueoAction(
  _prevState: DisponibilidadState,
  formData: FormData
): Promise<DisponibilidadState> {
  const sesion = await requireRole("medico");
  const supabase = await createClient();

  const fecha = String(formData.get("fecha") ?? "");
  const motivo = String(formData.get("motivo") ?? "") || null;

  if (!fecha) return { error: "Selecciona una fecha." };

  const { error } = await supabase.from("bloqueos_disponibilidad").insert({
    fecha,
    motivo,
    creado_por: sesion.userId,
  });

  if (error) return { error: "No se pudo guardar el bloqueo." };

  revalidatePath("/admin/agenda");
  return { error: null };
}

export async function eliminarBloqueoAction(id: string) {
  await requireRole("medico");
  const supabase = await createClient();
  await supabase.from("bloqueos_disponibilidad").delete().eq("id", id);
  revalidatePath("/admin/agenda");
}
