import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { obtenerOCrearExpedienteAction } from "@/lib/expedientes/actions";
import { AntecedentesForm } from "@/components/admin/AntecedentesForm";

export const metadata: Metadata = {
  title: "Antecedentes | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function AntecedentesPage({
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
  const { data: expediente } = expedienteId
    ? await supabase
        .from("expedientes_clinicos")
        .select("id, antecedentes_heredofamiliares, antecedentes_patologicos, antecedentes_no_patologicos")
        .eq("id", expedienteId)
        .single()
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <Link href={`/admin/pacientes/${pacienteId}`} className="text-xs font-medium text-rosa-fuerte">
        ← {paciente.nombre} {paciente.apellido_paterno}
      </Link>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Antecedentes</h1>

      {expediente && (
        <div className="mt-8 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6">
          <AntecedentesForm
            expedienteId={expediente.id}
            pacienteId={pacienteId}
            antecedentesHeredofamiliares={expediente.antecedentes_heredofamiliares}
            antecedentesPatologicos={expediente.antecedentes_patologicos}
            antecedentesNoPatologicos={expediente.antecedentes_no_patologicos}
          />
        </div>
      )}
    </div>
  );
}
