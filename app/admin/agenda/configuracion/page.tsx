import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { DisponibilidadForm } from "@/components/admin/DisponibilidadForm";
import { BloqueosForm } from "@/components/admin/BloqueosForm";

export const metadata: Metadata = {
  title: "Configuración de agenda | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function ConfiguracionAgendaPage() {
  await requireRole("medico");

  const supabase = await createClient();
  const [{ data: rangos }, { data: bloqueos }] = await Promise.all([
    supabase
      .from("disponibilidad_semanal")
      .select("id, dia_semana, hora_inicio, hora_fin")
      .order("dia_semana"),
    supabase
      .from("bloqueos_disponibilidad")
      .select("id, fecha, motivo")
      .gte("fecha", new Date().toISOString().slice(0, 10))
      .order("fecha"),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <Link href="/admin/agenda" className="text-xs font-medium text-rosa-fuerte">
        ← Volver a la agenda
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Configuración de agenda</h1>

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
    </div>
  );
}
