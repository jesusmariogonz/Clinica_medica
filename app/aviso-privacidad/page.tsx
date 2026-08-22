import type { Metadata } from "next";
import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Dra. Maggie Morales",
};

export default function AvisoPrivacidadPage() {
  return (
    <LegalPage
      titulo="Aviso de Privacidad"
      actualizadoLabel="Versión placeholder — PENDIENTE DE REVISIÓN LEGAL"
    >
      <p>
        [PLACEHOLDER] Dra. Maggie Morales — Medicina Estética ("el
        Consultorio"), con domicilio en Saltillo, Coahuila, México, es
        responsable del tratamiento de sus datos personales, incluyendo
        datos sensibles de salud, conforme a la Ley Federal de Protección
        de Datos Personales en Posesión de los Particulares (LFPDPPP) y a
        la NOM-004-SSA3-2012 y NOM-024-SSA3-2012.
      </p>
      <p>
        <strong>Datos que recabamos:</strong> [PLACEHOLDER — datos de
        identificación, contacto, y datos clínicos de salud necesarios
        para la prestación del servicio médico.]
      </p>
      <p>
        <strong>Finalidades:</strong> [PLACEHOLDER — prestación de
        servicios médicos, integración del expediente clínico conforme a
        NOM-004, agenda de citas, facturación y contacto.]
      </p>
      <p>
        <strong>Transferencias:</strong> [PLACEHOLDER — especificar si se
        comparten datos con procesadores de pago (Stripe, Mercado Pago) u
        otros terceros, y bajo qué fundamento.]
      </p>
      <p>
        <strong>Derechos ARCO:</strong> [PLACEHOLDER — mecanismo para
        ejercer derechos de Acceso, Rectificación, Cancelación y
        Oposición.]
      </p>
      <p>
        <strong>Seguridad:</strong> El expediente clínico se almacena con
        controles de acceso por rol, bitácora de auditoría inmutable y
        cifrado en tránsito y en reposo. [PLACEHOLDER — detallar medidas
        específicas tras revisión legal y técnica final.]
      </p>
    </LegalPage>
  );
}
