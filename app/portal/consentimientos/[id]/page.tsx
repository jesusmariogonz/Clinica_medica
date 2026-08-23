import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { DocumentoConsentimiento } from "@/components/consentimientos/DocumentoConsentimiento";

export const metadata: Metadata = {
  title: "Consentimiento | Portal del paciente",
};

export const dynamic = "force-dynamic";

export default async function ConsentimientoPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sesion = await requireRole("paciente");
  const { id } = await params;

  const supabase = await createClient();
  const { data: consentimiento } = await supabase
    .from("consentimientos")
    .select("tipo, texto_version, firmado_en, firma_digital_hash, pacientes(nombre, apellido_paterno, user_id)")
    .eq("id", id)
    .single();

  const paciente = consentimiento?.pacientes as unknown as {
    nombre: string;
    apellido_paterno: string;
    user_id: string | null;
  } | null;

  if (!consentimiento || paciente?.user_id !== sesion.userId) notFound();

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
