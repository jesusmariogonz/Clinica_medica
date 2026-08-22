import { Hero } from "@/components/public/Hero";
import { ServiceCard } from "@/components/public/ServiceCard";

const servicios = [
  {
    nombre: "Toxina botulínica",
    descripcion: "Tratamiento para líneas de expresión con resultados naturales.",
    precioDesde: 4500,
    duracionMinutos: 45,
    imagenUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
  },
  {
    nombre: "Ácido hialurónico",
    descripcion: "Armonización facial sutil, realce natural sin exagerar.",
    precioDesde: 5500,
    duracionMinutos: 60,
    imagenUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    nombre: "Bioestimulador de colágeno",
    descripcion: "Estimulación de colágeno para firmeza y calidad de piel.",
    precioDesde: 6800,
    duracionMinutos: 60,
    imagenUrl:
      "https://images.unsplash.com/photo-1596178060810-72660ee8d3e9?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section id="servicios" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="mb-14 max-w-xl">
          <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
            Tratamientos
          </span>
          <h2 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
            Cuidado personalizado, resultados sutiles
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <ServiceCard key={s.nombre} {...s} />
          ))}
        </div>
      </section>
    </div>
  );
}
