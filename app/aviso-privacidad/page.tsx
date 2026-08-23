import type { Metadata } from "next";
import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Dra. Maggie Morales",
};

export default function AvisoPrivacidadPage() {
  return (
    <LegalPage titulo="Aviso de Privacidad" actualizadoLabel="Última actualización: agosto 2026">
      <p>
        <strong>Dra. Maggie Morales — Medicina Estética</strong> (&ldquo;el Consultorio&rdquo;),
        con domicilio en Bolivia 563, Colonia Latinoamericana, C.P. 25270,
        Saltillo, Coahuila, México, es responsable del tratamiento de sus
        datos personales, incluyendo datos personales sensibles relacionados
        con su salud, conforme a la Ley Federal de Protección de Datos
        Personales en Posesión de los Particulares (LFPDPPP), su Reglamento,
        y a la normatividad sanitaria aplicable (NOM-004-SSA3-2012 y
        NOM-024-SSA3-2012).
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Datos que recabamos</h2>
      <p>
        Para prestarle nuestros servicios recabamos datos de identificación y
        contacto (nombre, fecha de nacimiento, teléfono, correo electrónico,
        dirección, contacto de emergencia) y datos personales sensibles de
        salud (antecedentes heredofamiliares, patológicos y no patológicos,
        notas de evolución clínica, estudios, fotografías clínicas y
        documentos relacionados con su tratamiento). También podemos recabar
        datos de facturación y de pago necesarios para procesar cobros.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Finalidades</h2>
      <p>Sus datos personales serán utilizados para las siguientes finalidades necesarias para el servicio que solicita:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Integrar y mantener su expediente clínico conforme a la NOM-004-SSA3-2012.</li>
        <li>Brindarle valoración, diagnóstico y tratamiento de medicina estética.</li>
        <li>Agendar, confirmar y recordarle sus citas.</li>
        <li>Procesar el cobro de anticipos y servicios (incluyendo, en su caso, a través de Stripe o Mercado Pago).</li>
        <li>Enviarle comunicaciones relacionadas con su atención (confirmaciones, recordatorios).</li>
        <li>Cumplir con obligaciones legales y sanitarias aplicables al Consultorio.</li>
      </ul>
      <p>
        No utilizaremos sus datos para finalidades distintas a las anteriores
        sin su consentimiento adicional, salvo que la ley lo permita o exija.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Transferencias</h2>
      <p>
        Sus datos de pago pueden compartirse con los procesadores de pago
        Stripe y/o Mercado Pago, únicamente para procesar el cobro de
        anticipos y servicios. Su expediente clínico se almacena en
        Supabase (proveedor de infraestructura en la nube) bajo controles
        de acceso estrictos por rol y cifrado. No vendemos ni compartimos
        sus datos con terceros para fines de mercadotecnia.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Derechos ARCO</h2>
      <p>
        Usted tiene derecho a Acceder, Rectificar y Cancelar sus datos
        personales, así como a Oponerse al tratamiento de los mismos
        (derechos ARCO), y a revocar el consentimiento que en su caso nos
        haya otorgado. Para ejercer estos derechos, envíe su solicitud al
        correo{" "}
        <a href="mailto:sandramormart@gmail.com" className="text-rosa-fuerte">
          sandramormart@gmail.com
        </a>{" "}
        indicando su nombre completo y el derecho que desea ejercer.
        Responderemos su solicitud en un plazo máximo de 20 días hábiles,
        conforme a la LFPDPPP.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Seguridad</h2>
      <p>
        Su expediente clínico se almacena con controles de acceso por rol
        (solo la Dra. Maggie Morales tiene acceso a las notas clínicas
        completas), bitácora de auditoría de solo lectura sobre accesos y
        modificaciones, cifrado en tránsito y en reposo, y URLs firmadas de
        corta duración para la consulta de documentos — nunca enlaces
        públicos permanentes.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Cambios a este aviso</h2>
      <p>
        Nos reservamos el derecho de modificar este Aviso de Privacidad. Los
        cambios se publicarán en esta misma página con su fecha de
        actualización.
      </p>
    </LegalPage>
  );
}
