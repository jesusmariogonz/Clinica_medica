import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { DocumentoConsentimiento } from "@/components/consentimientos/DocumentoConsentimiento";

export const metadata: Metadata = {
  title: "Consentimiento | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function ConsentimientoAdminPage({
  params,
}: {
  params: Promise<{ id: string; consentimientoId: string }>;
}) {
  await requireRole("medico");
  const { id: pacienteId, consentimientoId } = await params;

  const supabase = await createClient();
  const { data: consentimiento } = await supabase
    .from("consentimientos")
    .select("tipo, texto_version, firmado_en, firma_digital_hash, paciente_id, pacientes(nombre, apellido_paterno)")
    .eq("id", consentimientoId)
    .single();

  const paciente = consentimiento?.pacientes as unknown as { nombre: string; apellido_paterno: string } | null;

  if (!consentimiento || consentimiento.paciente_id !== pacienteId || !paciente) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <DocumentoConsentimiento
        nombrePaciente={`${paciente.nombre} ${paciente.apellido_paterno}`}
        tipo={consentimiento.tipo}
        textoVersion={consentimiento.texto_version}
        firmadoEn={consentimiento.firmado_en}
        firmaHash={consentimiento.firma_digital_hash}
      />
    </div>
  );
}
