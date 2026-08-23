interface LegalPageProps {
  titulo: string;
  actualizadoLabel: string;
  children: React.ReactNode;
}

export function LegalPage({ titulo, actualizadoLabel, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
      <div className="mb-6 rounded-2xl border border-apoyo/40 bg-apoyo/10 px-5 py-3 text-xs text-carbon/70">
        Documento genérico funcional. Se recomienda validarlo con un abogado
        especializado en protección de datos de salud antes de tratar casos
        legales complejos.
      </div>

      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Legal
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">{titulo}</h1>
      <p className="mt-2 text-xs text-carbon/40">{actualizadoLabel}</p>

      <div className="prose-legal mt-8 space-y-5 text-sm leading-relaxed text-carbon/80">
        {children}
      </div>
    </div>
  );
}
