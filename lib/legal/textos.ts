import type { ConsentimientoTipo } from "@/types/database.types";

// Snapshot versionado de los textos legales usados para firma electrónica
// simple (hash + timestamp del texto exacto firmado). Texto genérico
// funcional — ver /aviso-privacidad y /consentimiento-informado para la
// versión completa. Se recomienda validación por un abogado antes de
// casos legales complejos. Si el texto cambia, crear una nueva versión
// (nunca editar esta), para no invalidar firmas ya realizadas.
export const VERSION_TEXTOS_LEGALES = "v1-2026";

export const TEXTOS_CONSENTIMIENTO: Record<ConsentimientoTipo, string> = {
  aviso_privacidad: `Acepto el Aviso de Privacidad de Dra. Maggie Morales — Medicina Estética (Bolivia 563, Col. Latinoamericana, C.P. 25270, Saltillo, Coahuila), mediante el cual se me informa sobre el tratamiento de mis datos personales, incluidos datos sensibles de salud, conforme a la LFPDPPP y a la NOM-004-SSA3-2012 / NOM-024-SSA3-2012. Versión: ${VERSION_TEXTOS_LEGALES}.`,
  tratamiento_general: `Consiento de manera informada ser atendido/a por Dra. Maggie Morales en el marco de tratamientos de medicina estética. Declaro haber sido informado/a de la naturaleza general de los procedimientos, sus riesgos, beneficios y alternativas, conforme a la NOM-004-SSA3-2012, y haber tenido oportunidad de resolver mis dudas antes de firmar. Versión: ${VERSION_TEXTOS_LEGALES}.`,
  procedimiento_especifico: "", // se define por procedimiento al crear el consentimiento
};

export function textoConsentimiento(tipo: ConsentimientoTipo, textoPersonalizado?: string | null): string {
  if (tipo === "procedimiento_especifico") {
    return textoPersonalizado?.trim() || "Texto de procedimiento no especificado.";
  }
  return TEXTOS_CONSENTIMIENTO[tipo];
}
