import type { ConsentimientoTipo } from "@/types/database.types";

// Snapshot versionado de los textos legales usados para firma electrónica
// simple (hash + timestamp del texto exacto firmado). Todo el contenido
// aquí es PLACEHOLDER — ver /aviso-privacidad y /consentimiento-informado,
// ambas marcadas como PENDIENTE DE REVISIÓN LEGAL POR ABOGADO. Cuando el
// abogado apruebe el texto final, se debe crear una nueva versión (nunca
// editar una existente) para no invalidar firmas ya realizadas.
export const VERSION_TEXTOS_LEGALES = "v1-placeholder-2026";

export const TEXTOS_CONSENTIMIENTO: Record<ConsentimientoTipo, string> = {
  aviso_privacidad: `[PLACEHOLDER — PENDIENTE DE REVISIÓN LEGAL] Acepto el Aviso de Privacidad de Dra. Maggie Morales — Medicina Estética (Saltillo, Coahuila), mediante el cual se me informa sobre el tratamiento de mis datos personales, incluidos datos sensibles de salud, conforme a la LFPDPPP y a la NOM-004-SSA3-2012 / NOM-024-SSA3-2012. Versión: ${VERSION_TEXTOS_LEGALES}.`,
  tratamiento_general: `[PLACEHOLDER — PENDIENTE DE REVISIÓN LEGAL] Consiento de manera informada ser atendido/a por Dra. Maggie Morales en el marco de tratamientos de medicina estética. Declaro haber sido informado/a de la naturaleza general de los procedimientos, sus riesgos, beneficios y alternativas, conforme a la NOM-004-SSA3-2012. Versión: ${VERSION_TEXTOS_LEGALES}.`,
  procedimiento_especifico: "", // se define por procedimiento al crear el consentimiento
};

export function textoConsentimiento(tipo: ConsentimientoTipo, textoPersonalizado?: string | null): string {
  if (tipo === "procedimiento_especifico") {
    return textoPersonalizado?.trim() || "[PLACEHOLDER — texto de procedimiento no especificado]";
  }
  return TEXTOS_CONSENTIMIENTO[tipo];
}
