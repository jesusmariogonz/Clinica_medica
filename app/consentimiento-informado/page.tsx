import type { Metadata } from "next";
import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Consentimiento Informado | Dra. Maggie Morales",
};

export default function ConsentimientoInformadoPage() {
  return (
    <LegalPage
      titulo="Consentimiento Informado — Modelo General"
      actualizadoLabel="Versión placeholder — PENDIENTE DE REVISIÓN LEGAL"
    >
      <p>
        [PLACEHOLDER] Este documento describe, en términos generales, la
        naturaleza, riesgos, beneficios y alternativas de los tratamientos
        de medicina estética ofrecidos por Dra. Maggie Morales, conforme a
        la NOM-004-SSA3-2012. Cada procedimiento específico requiere su
        propio consentimiento informado detallado, firmado antes de
        realizarse.
      </p>
      <p>
        <strong>Naturaleza del tratamiento:</strong> [PLACEHOLDER —
        descripción general de procedimientos de medicina estética.]
      </p>
      <p>
        <strong>Riesgos y complicaciones posibles:</strong> [PLACEHOLDER —
        a definir por procedimiento, con apoyo legal y médico.]
      </p>
      <p>
        <strong>Alternativas de tratamiento:</strong> [PLACEHOLDER]
      </p>
      <p>
        <strong>Firma electrónica:</strong> Al firmar digitalmente este
        consentimiento en el portal del paciente, usted confirma haber
        leído y comprendido este documento. La firma se registra como hash
        + timestamp en el sistema, junto con la versión exacta del texto
        firmado, conforme al campo <code>firma_digital_hash</code> del
        expediente.
      </p>
    </LegalPage>
  );
}
