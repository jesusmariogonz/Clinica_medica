import type { Metadata } from "next";
import { ServiceCard } from "@/components/public/ServiceCard";
import { serviciosPlaceholder } from "@/lib/servicios-placeholder";

export const metadata: Metadata = {
  title: "Servicios | Dra. Maggie Morales",
};

export default function ServiciosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <div className="mb-14 max-w-xl">
        <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
          Tratamientos
        </span>
        <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
          Cuidado personalizado, resultados sutiles
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-carbon/70">
          Cada tratamiento se adapta a tu piel y tus objetivos. Los precios
          mostrados son de referencia; el plan final se define en tu
          valoración inicial.
        </p>
      </div>

      <div id="reservar" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {serviciosPlaceholder.map((s) => (
          <ServiceCard key={s.slug} {...s} />
        ))}
      </div>
    </div>
  );
}
