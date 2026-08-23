import type { Metadata } from "next";
import { LegalPage } from "@/components/public/LegalPage";

export const metadata: Metadata = {
  title: "Consentimiento Informado | Dra. Maggie Morales",
};

export default function ConsentimientoInformadoPage() {
  return (
    <LegalPage
      titulo="Consentimiento Informado — Modelo General"
      actualizadoLabel="Última actualización: agosto 2026"
    >
      <p>
        Este documento describe, en términos generales, la naturaleza,
        riesgos, beneficios y alternativas de los tratamientos de medicina
        estética ofrecidos por la Dra. Maggie Morales en Saltillo, Coahuila,
        conforme a la NOM-004-SSA3-2012. Cada procedimiento específico que
        se le realice requiere, adicionalmente, su propio consentimiento
        informado detallado por escrito o firma electrónica, antes de
        llevarse a cabo.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Naturaleza del tratamiento</h2>
      <p>
        Los tratamientos de medicina estética que ofrece el Consultorio
        (por ejemplo: toxina botulínica, ácido hialurónico, bioestimuladores
        de colágeno, limpiezas faciales y procedimientos similares) tienen
        como objetivo mejorar de forma sutil y natural la apariencia de la
        piel y los rasgos faciales, sin buscar resultados exagerados o
        desproporcionados. Cada tratamiento es evaluado y personalizado por
        la Dra. Maggie Morales según sus condiciones de salud y objetivos
        particulares, previa valoración inicial.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Riesgos y complicaciones posibles</h2>
      <p>
        Como todo procedimiento médico, los tratamientos de medicina
        estética conllevan riesgos inherentes que pueden incluir, entre
        otros: enrojecimiento, inflamación, moretones o sensibilidad en la
        zona tratada, reacciones alérgicas, asimetría temporal, y en casos
        poco frecuentes, complicaciones más serias. Los riesgos específicos
        de cada procedimiento le serán explicados con detalle por la Dra.
        Maggie Morales antes de realizarlo, y se documentarán en el
        consentimiento específico de ese procedimiento.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Alternativas de tratamiento</h2>
      <p>
        Usted tiene derecho a conocer las alternativas de tratamiento
        disponibles, incluyendo la opción de no realizarse ningún
        procedimiento. La Dra. Maggie Morales le explicará las opciones
        razonables según su caso durante la consulta de valoración.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Declaración del paciente</h2>
      <p>
        Al firmar este consentimiento, usted declara que: (1) ha sido
        informado/a de manera clara sobre la naturaleza general de los
        tratamientos de medicina estética que podría recibir; (2) ha tenido
        oportunidad de hacer preguntas y estas han sido respondidas a su
        satisfacción; (3) entiende que ningún resultado estético puede
        garantizarse de forma absoluta; y (4) otorga su consentimiento
        voluntario, libre e informado para ser atendido/a por la Dra.
        Maggie Morales.
      </p>

      <h2 className="mt-2 font-serif text-lg text-carbon">Firma electrónica</h2>
      <p>
        Al firmar digitalmente este consentimiento en el portal del
        paciente, usted confirma haber leído y comprendido este documento.
        La firma se registra como un hash criptográfico único junto con la
        fecha y hora exactas, y queda vinculada de forma permanente a la
        versión exacta del texto que firmó — este registro no puede
        modificarse ni eliminarse una vez creado.
      </p>
    </LegalPage>
  );
}
