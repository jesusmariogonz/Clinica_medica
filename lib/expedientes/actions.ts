"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { textoConsentimiento, VERSION_TEXTOS_LEGALES } from "@/lib/legal/textos";
import type { ConsentimientoTipo } from "@/types/database.types";

export interface FormState {
  error: string | null;
}

// --- Pacientes (solo médico: el expediente identifica al paciente, y el
// rol asistente está limitado a agenda y pagos) ---

export async function crearPacienteAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("medico");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "");
  const apellidoPaterno = String(formData.get("apellido_paterno") ?? "");
  const apellidoMaterno = String(formData.get("apellido_materno") ?? "") || null;
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "");
  const telefono = String(formData.get("telefono") ?? "") || null;
  const email = String(formData.get("email") ?? "") || null;

  if (!nombre || !apellidoPaterno || !fechaNacimiento) {
    return { error: "Nombre, apellido paterno y fecha de nacimiento son obligatorios." };
  }

  const { data: paciente, error } = await supabase
    .from("pacientes")
    .insert({
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      fecha_nacimiento: fechaNacimiento,
      telefono,
      email,
    })
    .select("id")
    .single();

  if (error || !paciente) {
    return { error: "No se pudo crear el paciente." };
  }

  revalidatePath("/admin/pacientes");
  return { error: null };
}

// --- Expediente clínico (solo médico) ---

// Garantiza que el paciente tenga expediente (se crea vacío en su primera
// visita al detalle del paciente). Devuelve el id del expediente.
export async function obtenerOCrearExpedienteAction(pacienteId: string): Promise<string | null> {
  await requireRole("medico");
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("expedientes_clinicos")
    .select("id")
    .eq("paciente_id", pacienteId)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: nuevo, error } = await supabase
    .from("expedientes_clinicos")
    .insert({ paciente_id: pacienteId })
    .select("id")
    .single();

  if (error || !nuevo) return null;
  return nuevo.id;
}

export async function actualizarAntecedentesAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("medico");
  const supabase = await createClient();

  const expedienteId = String(formData.get("expediente_id") ?? "");
  const pacienteId = String(formData.get("paciente_id") ?? "");

  const { error } = await supabase
    .from("expedientes_clinicos")
    .update({
      antecedentes_heredofamiliares: String(formData.get("antecedentes_heredofamiliares") ?? "") || null,
      antecedentes_patologicos: String(formData.get("antecedentes_patologicos") ?? "") || null,
      antecedentes_no_patologicos: String(formData.get("antecedentes_no_patologicos") ?? "") || null,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", expedienteId);

  if (error) return { error: "No se pudieron guardar los antecedentes." };

  revalidatePath(`/admin/pacientes/${pacienteId}`);
  return { error: null };
}

// --- Notas clínicas (append-only, solo médico) ---

export async function crearNotaClinicaAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const sesion = await requireRole("medico");
  const supabase = await createClient();

  const expedienteId = String(formData.get("expediente_id") ?? "");
  const pacienteId = String(formData.get("paciente_id") ?? "");
  const contenido = String(formData.get("contenido") ?? "");
  const padecimientoActual = String(formData.get("padecimiento_actual") ?? "") || null;
  const exploracionFisica = String(formData.get("exploracion_fisica") ?? "") || null;

  if (!contenido.trim()) {
    return { error: "El contenido de la nota no puede estar vacío." };
  }

  const { error } = await supabase.from("notas_clinicas").insert({
    expediente_id: expedienteId,
    autor_id: sesion.userId,
    contenido,
    padecimiento_actual: padecimientoActual,
    exploracion_fisica: exploracionFisica,
  });

  if (error) return { error: "No se pudo guardar la nota clínica." };

  revalidatePath(`/admin/pacientes/${pacienteId}`);
  return { error: null };
}

// Firmar una nota la vuelve inmutable de forma permanente (el trigger de
// BD ya rechaza cualquier UPDATE posterior sobre una nota firmada). Solo
// el autor puede firmar su propia nota — restricción de código adicional
// a la policy RLS (que permite a cualquier médico, pensando en más de
// un profesional en el consultorio a futuro).
export async function firmarNotaAction(notaId: string, pacienteId: string) {
  const sesion = await requireRole("medico");
  const supabase = await createClient();

  const { data: nota } = await supabase
    .from("notas_clinicas")
    .select("autor_id, firmada")
    .eq("id", notaId)
    .single();

  if (!nota || nota.autor_id !== sesion.userId || nota.firmada) {
    return;
  }

  await supabase.from("notas_clinicas").update({ firmada: true }).eq("id", notaId);
  revalidatePath(`/admin/pacientes/${pacienteId}`);
}

// --- Documentos ---

export async function subirDocumentoAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const sesion = await requireRole("medico");
  const supabase = await createClient();

  const pacienteId = String(formData.get("paciente_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "otro");
  const descripcion = String(formData.get("descripcion") ?? "") || null;
  const archivo = formData.get("archivo") as File | null;

  if (!archivo || archivo.size === 0) {
    return { error: "Selecciona un archivo." };
  }

  const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${pacienteId}/${Date.now()}-${nombreLimpio}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos-clinicos")
    .upload(storagePath, archivo, { contentType: archivo.type });

  if (uploadError) {
    return { error: "No se pudo subir el archivo." };
  }

  const { error: dbError } = await supabase.from("documentos").insert({
    paciente_id: pacienteId,
    tipo: tipo as
      | "identificacion"
      | "estudio"
      | "consentimiento_firmado"
      | "receta"
      | "otro",
    storage_path: storagePath,
    subido_por: sesion.userId,
    descripcion,
  });

  if (dbError) {
    return { error: "El archivo se subió pero no se pudo registrar. Contacta soporte." };
  }

  revalidatePath(`/admin/pacientes/${pacienteId}`);
  return { error: null };
}

// Genera una URL firmada de corta duración (5 min) para ver/descargar un
// documento. Nunca se exponen URLs públicas permanentes del bucket.
export async function obtenerUrlFirmadaAction(storagePath: string): Promise<string | null> {
  await requireRole("medico");
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("documentos-clinicos")
    .createSignedUrl(storagePath, 300);

  if (error || !data) return null;
  return data.signedUrl;
}

// --- Consentimientos (el médico solicita, el paciente firma en su portal) ---

export async function crearConsentimientoPendienteAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole("medico");
  const supabase = await createClient();

  const pacienteId = String(formData.get("paciente_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as ConsentimientoTipo;
  const textoPersonalizado = String(formData.get("texto_personalizado") ?? "") || null;

  if (tipo === "procedimiento_especifico" && !textoPersonalizado?.trim()) {
    return { error: "Describe el procedimiento para este consentimiento." };
  }

  const { error } = await supabase.from("consentimientos").insert({
    paciente_id: pacienteId,
    tipo,
    texto_version:
      tipo === "procedimiento_especifico"
        ? `${VERSION_TEXTOS_LEGALES}: ${textoPersonalizado}`
        : textoConsentimiento(tipo),
  });

  if (error) return { error: "No se pudo crear el consentimiento." };

  revalidatePath(`/admin/pacientes/${pacienteId}`);
  return { error: null };
}
