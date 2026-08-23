import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "La Dra. Maggie Morales | Medicina Estética",
};

export default function QuienEsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:items-center">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image
          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1400&auto=format&fit=crop"
          alt="Dra. Maggie Morales en su consultorio"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>

      <div>
        <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
          Sobre la Dra.
        </span>
        <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
          Dra. Maggie Morales
        </h1>
        <p className="mt-2 text-sm text-carbon/60">
          Medicina Estética · Saltillo, Coahuila
        </p>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-carbon/80">
          <p>
            La Dra. Maggie Morales se dedica a la medicina estética con un
            enfoque centrado en resultados naturales y en el bienestar de
            cada paciente. Su consultorio en Saltillo combina el rigor
            médico con un trato cercano y personalizado.
          </p>
          <p className="italic text-carbon/50">
            [PENDIENTE: cédula profesional, especialidad, formación
            académica y trayectoria — contenido a proporcionar por la
            clínica.]
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "Enfoque", value: "Natural" },
            { label: "Ubicación", value: "Saltillo" },
            { label: "Atención", value: "Personalizada" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-4 text-center backdrop-blur-sm"
            >
              <p className="font-serif text-lg text-rosa-fuerte">{item.value}</p>
              <p className="mt-1 text-xs text-carbon/50">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
