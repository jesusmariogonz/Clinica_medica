import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { obtenerOCrearExpedienteAction } from "@/lib/expedientes/actions";
import { NotaClinicaForm } from "@/components/admin/NotaClinicaForm";
import { NotasTimeline } from "@/components/admin/NotasTimeline";

export const metadata: Metadata = {
  title: "Notas de evolución | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function NotasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("medico");
  const { id: pacienteId } = await params;

  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("nombre, apellido_paterno")
    .eq("id", pacienteId)
    .single();

  if (!paciente) notFound();

  const expedienteId = await obtenerOCrearExpedienteAction(pacienteId);
  const { data: notas } = expedienteId
    ? await supabase
        .from("notas_clinicas")
        .select("id, contenido, padecimiento_actual, exploracion_fisica, fecha, firmada, version")
        .eq("expediente_id", expedienteId)
        .order("fecha", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <Link href={`/admin/pacientes/${pacienteId}`} className="text-xs font-medium text-rosa-fuerte">
        ← {paciente.nombre} {paciente.apellido_paterno}
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Notas de evolución</h1>

      <div className="mt-8">
        {expedienteId && <NotaClinicaForm expedienteId={expedienteId} pacienteId={pacienteId} />}
      </div>

      <div className="mt-8">
        <NotasTimeline notas={notas ?? []} pacienteId={pacienteId} />
      </div>
    </div>
  );
}
