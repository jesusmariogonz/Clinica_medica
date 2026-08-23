import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { AgendaCalendario } from "@/components/admin/AgendaCalendario";

export const metadata: Metadata = {
  title: "Agenda | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  await requireRole("medico");

  const supabase = await createClient();

  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  const hasta = new Date();
  hasta.setDate(hasta.getDate() + 90);

  const { data: citasRaw } = await supabase
    .from("citas")
    .select(
      "id, fecha_hora, estado, requiere_anticipo, anticipo_pagado, paciente_id, pacientes(nombre, apellido_paterno, telefono, email), servicios(nombre)"
    )
    .gte("fecha_hora", desde.toISOString())
    .lte("fecha_hora", hasta.toISOString())
    .order("fecha_hora");

  const pacienteIds = [...new Set((citasRaw ?? []).map((c) => c.paciente_id))];

  // Para distinguir "paciente nuevo" vs con historial: existe al menos una
  // nota clínica asociada a su expediente.
  const { data: expedientesConNotas } =
    pacienteIds.length > 0
      ? await supabase
          .from("expedientes_clinicos")
          .select("paciente_id, notas_clinicas(id)")
          .in("paciente_id", pacienteIds)
      : { data: [] };

  const pacientesConHistorial = new Set(
    (expedientesConNotas ?? [])
      .filter((e) => (e.notas_clinicas as unknown as { id: string }[] | null)?.length)
      .map((e) => e.paciente_id)
  );

  const citas = (citasRaw ?? []).map((c) => {
    const paciente = c.pacientes as unknown as {
      nombre: string;
      apellido_paterno: string;
      telefono: string | null;
      email: string | null;
    } | null;
    const servicio = c.servicios as unknown as { nombre: string } | null;

    return {
      id: c.id,
      fechaHora: c.fecha_hora,
      estado: c.estado,
      requiereAnticipo: c.requiere_anticipo,
      anticipoPagado: c.anticipo_pagado,
      pacienteId: c.paciente_id,
      pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido_paterno}` : "Paciente",
      pacienteTelefono: paciente?.telefono ?? null,
      pacienteEmail: paciente?.email ?? null,
      servicioNombre: servicio?.nombre ?? "",
      esPacienteNuevo: !pacientesConHistorial.has(c.paciente_id),
    };
  });

  const proximas = citas.filter((c) => new Date(c.fechaHora) >= new Date()).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
            Panel médico
          </span>
          <h1 className="mt-3 font-serif text-3xl text-carbon">Agenda</h1>
        </div>
        <Link
          href="/admin/agenda/configuracion"
          className="rounded-full border border-carbon/20 px-4 py-2 text-sm font-medium text-carbon hover:bg-carbon/5"
        >
          Configurar horarios
        </Link>
      </div>

      <section className="mt-10">
        <AgendaCalendario citas={citas} />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Próximas citas</h2>
        <div className="mt-5 space-y-2">
          {proximas.length === 0 && (
            <p className="text-sm text-carbon/40">Sin citas próximas.</p>
          )}
          {proximas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-carbon">{c.pacienteNombre}</p>
                <p className="text-carbon/50">{c.servicioNombre}</p>
              </div>
              <div className="text-right">
                <p className="text-carbon">
                  {new Date(c.fechaHora).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-xs text-carbon/50">
                  {c.estado}
                  {c.requiereAnticipo && !c.anticipoPagado && " · anticipo pendiente"}
                </p>
              </div>
              <div>
                {c.esPacienteNuevo ? (
                  <span className="rounded-full bg-apoyo/20 px-3 py-1 text-xs text-carbon">
                    Nuevo
                  </span>
                ) : (
                  <Link
                    href={`/admin/pacientes/${c.pacienteId}`}
                    className="rounded-full bg-rosa-fuerte px-3 py-1 text-xs font-medium text-white hover:bg-rosa"
                  >
                    Historial
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
