"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";

export interface FormState {
  error: string | null;
}

// Firma electrónica simple: hash SHA-256 del texto exacto firmado + id del
// consentimiento + paciente + timestamp + un nonce, para que el hash sea
// único e irreproducible sin conocer todos los datos. Se guarda junto con
// firmado_en; el trigger de BD (migración 0006) garantiza que esta acción
// solo pueda pasar de "no firmado" a "firmado" una única vez.
export async function firmarConsentimientoAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const sesion = await requireRole("paciente");
  const supabase = await createClient();

  const consentimientoId = String(formData.get("consentimiento_id") ?? "");
  const aceptoTexto = formData.get("acepto") === "on";

  if (!aceptoTexto) {
    return { error: "Debes marcar que aceptas el texto para firmar." };
  }

  const { data: consentimiento } = await supabase
    .from("consentimientos")
    .select("id, paciente_id, texto_version, firmado_en, pacientes(user_id)")
    .eq("id", consentimientoId)
    .single();

  if (!consentimiento) return { error: "Consentimiento no encontrado." };

  const paciente = consentimiento.pacientes as unknown as { user_id: string | null } | null;
  if (paciente?.user_id !== sesion.userId) return { error: "No autorizado." };
  if (consentimiento.firmado_en) return { error: "Este consentimiento ya fue firmado." };

  const timestamp = new Date().toISOString();
  const nonce = randomUUID();
  const hash = createHash("sha256")
    .update(`${consentimiento.id}|${consentimiento.texto_version}|${consentimiento.paciente_id}|${timestamp}|${nonce}`)
    .digest("hex");

  const { error } = await supabase
    .from("consentimientos")
    .update({ firmado_en: timestamp, firma_digital_hash: hash })
    .eq("id", consentimientoId);

  if (error) return { error: "No se pudo registrar la firma. Intenta de nuevo." };

  revalidatePath("/portal");
  return { error: null };
}

// URL firmada de corta duración para que el paciente vea su propio
// documento. Verifica explícitamente la propiedad antes de generar la URL
// (defensa adicional a la policy de Storage, que ya lo restringe).
export async function obtenerUrlFirmadaPropiaAction(documentoId: string): Promise<string | null> {
  const sesion = await requireRole("paciente");
  const supabase = await createClient();

  const { data: documento } = await supabase
    .from("documentos")
    .select("storage_path, pacientes(user_id)")
    .eq("id", documentoId)
    .single();

  const paciente = documento?.pacientes as unknown as { user_id: string | null } | null;
  if (!documento || paciente?.user_id !== sesion.userId) return null;

  const { data, error } = await supabase.storage
    .from("documentos-clinicos")
    .createSignedUrl(documento.storage_path, 300);

  if (error || !data) return null;
  return data.signedUrl;
}
