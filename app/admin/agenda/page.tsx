import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { DisponibilidadForm } from "@/components/admin/DisponibilidadForm";
import { BloqueosForm } from "@/components/admin/BloqueosForm";

export const metadata: Metadata = {
  title: "Agenda | Panel médico",
};

export default async function AdminAgendaPage() {
  await requireRole("medico");

  const supabase = await createClient();
  const [{ data: rangos }, { data: bloqueos }, { data: citas }] = await Promise.all([
    supabase
      .from("disponibilidad_semanal")
      .select("id, dia_semana, hora_inicio, hora_fin")
      .order("dia_semana"),
    supabase
      .from("bloqueos_disponibilidad")
      .select("id, fecha, motivo")
      .gte("fecha", new Date().toISOString().slice(0, 10))
      .order("fecha"),
    supabase
      .from("citas")
      .select("id, fecha_hora, estado, requiere_anticipo, anticipo_pagado, pacientes(nombre, apellido_paterno), servicios(nombre)")
      .gte("fecha_hora", new Date().toISOString())
      .order("fecha_hora")
      .limit(20),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Panel médico
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Agenda</h1>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Horario semanal</h2>
        <p className="mt-1 text-sm text-carbon/60">
          Define los bloques en los que el consultorio acepta citas.
        </p>
        <div className="mt-5 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6">
          <DisponibilidadForm rangos={rangos ?? []} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Días bloqueados</h2>
        <p className="mt-1 text-sm text-carbon/60">
          Vacaciones, congresos u otros días sin disponibilidad.
        </p>
        <div className="mt-5 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6">
          <BloqueosForm bloqueos={bloqueos ?? []} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Próximas citas</h2>
        <div className="mt-5 space-y-2">
          {(citas ?? []).length === 0 && (
            <p className="text-sm text-carbon/40">Sin citas próximas.</p>
          )}
          {(citas ?? []).map((c) => {
            const paciente = c.pacientes as unknown as { nombre: string; apellido_paterno: string } | null;
            const servicio = c.servicios as unknown as { nombre: string } | null;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-carbon">
                    {paciente ? `${paciente.nombre} ${paciente.apellido_paterno}` : "Paciente"}
                  </p>
                  <p className="text-carbon/50">{servicio?.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-carbon">
                    {new Date(c.fecha_hora).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-xs text-carbon/50">
                    {c.estado}
                    {c.requiere_anticipo && !c.anticipo_pagado && " · anticipo pendiente"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
