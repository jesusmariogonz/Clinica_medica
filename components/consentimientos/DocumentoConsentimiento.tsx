"use client";

interface Props {
  nombrePaciente: string;
  tipo: string;
  textoVersion: string;
  firmadoEn: string | null;
  firmaHash: string | null;
}

export function DocumentoConsentimiento({ nombrePaciente, tipo, textoVersion, firmadoEn, firmaHash }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
          Consentimiento
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa"
        >
          Imprimir / Descargar PDF
        </button>
      </div>

      <div className="rounded-3xl border border-rosa-suave/50 bg-white/70 p-8 print:border-none print:bg-white print:p-0">
        <p className="font-serif text-lg italic text-carbon">Dra. Maggie Morales</p>
        <p className="text-xs text-carbon/50">Medicina Estética · Saltillo, Coahuila</p>

        <h1 className="mt-6 font-serif text-2xl capitalize text-carbon">
          {tipo.replace(/_/g, " ")}
        </h1>
        <p className="mt-1 text-sm text-carbon/60">Paciente: {nombrePaciente}</p>

        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-carbon/80">
          {textoVersion}
        </p>

        <div className="mt-8 border-t border-carbon/10 pt-4 text-xs text-carbon/50">
          {firmadoEn ? (
            <>
              <p>
                Firmado electrónicamente el{" "}
                {new Date(firmadoEn).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}.
              </p>
              {firmaHash && <p className="mt-1 break-all">Identificador de firma: {firmaHash}</p>}
            </>
          ) : (
            <p>Aún no ha sido firmado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
