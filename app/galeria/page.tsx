import type { Metadata } from "next";
import { BeforeAfterSlider } from "@/components/public/BeforeAfterSlider";

export const metadata: Metadata = {
  title: "Galería | Dra. Maggie Morales",
};

// Placeholder — reemplazar con fotografías reales de pacientes que hayan
// otorgado su consentimiento explícito para uso en galería pública.
const casos = [
  {
    label: "Armonización facial — 3 meses de seguimiento",
    beforeUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1000&auto=format&fit=crop",
    afterUrl:
      "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=1000&auto=format&fit=crop",
  },
  {
    label: "Rejuvenecimiento facial — 6 meses de seguimiento",
    beforeUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop",
    afterUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function GaleriaPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <div className="mb-14 max-w-xl">
        <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
          Galería
        </span>
        <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
          Resultados reales, cambios sutiles
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-carbon/70">
          Desliza para comparar. Estas imágenes son de referencia
          (placeholder) — se sustituirán por casos reales de pacientes con
          su consentimiento explícito.
        </p>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        {casos.map((c) => (
          <BeforeAfterSlider key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
