import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { obtenerOCrearExpedienteAction } from "@/lib/expedientes/actions";
import { AntecedentesForm } from "@/components/admin/AntecedentesForm";
import { NotaClinicaForm } from "@/components/admin/NotaClinicaForm";
import { NotasTimeline } from "@/components/admin/NotasTimeline";
import { DocumentosSection } from "@/components/admin/DocumentosSection";

export const metadata: Metadata = {
  title: "Expediente | Panel médico",
};

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("medico");
  const { id: pacienteId } = await params;

  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email")
    .eq("id", pacienteId)
    .single();

  if (!paciente) notFound();

  const expedienteId = await obtenerOCrearExpedienteAction(pacienteId);

  const [{ data: expediente }, { data: notas }, { data: documentos }] = await Promise.all([
    expedienteId
      ? supabase
          .from("expedientes_clinicos")
          .select("id, antecedentes_heredofamiliares, antecedentes_patologicos, antecedentes_no_patologicos")
          .eq("id", expedienteId)
          .single()
      : Promise.resolve({ data: null }),
    expedienteId
      ? supabase
          .from("notas_clinicas")
          .select("id, contenido, padecimiento_actual, exploracion_fisica, fecha, firmada, version")
          .eq("expediente_id", expedienteId)
          .order("fecha", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("documentos")
      .select("id, tipo, descripcion, storage_path, subido_en")
      .eq("paciente_id", pacienteId)
      .order("subido_en", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Expediente clínico
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">
        {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno ?? ""}
      </h1>
      <p className="mt-2 text-sm text-carbon/60">
        Nacimiento: {new Date(`${paciente.fecha_nacimiento}T00:00:00`).toLocaleDateString("es-MX")}
        {paciente.telefono && ` · ${paciente.telefono}`}
        {paciente.email && ` · ${paciente.email}`}
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Antecedentes</h2>
        {expediente && (
          <div className="mt-5 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6">
            <AntecedentesForm
              expedienteId={expediente.id}
              pacienteId={pacienteId}
              antecedentesHeredofamiliares={expediente.antecedentes_heredofamiliares}
              antecedentesPatologicos={expediente.antecedentes_patologicos}
              antecedentesNoPatologicos={expediente.antecedentes_no_patologicos}
            />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Notas de evolución</h2>
        <div className="mt-5">
          {expedienteId && <NotaClinicaForm expedienteId={expedienteId} pacienteId={pacienteId} />}
        </div>
        <div className="mt-6">
          <NotasTimeline notas={notas ?? []} pacienteId={pacienteId} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Documentos</h2>
        <div className="mt-5">
          <DocumentosSection pacienteId={pacienteId} documentos={documentos ?? []} />
        </div>
      </section>
    </div>
  );
}
