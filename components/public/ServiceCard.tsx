"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type PaletteVariant = "a" | "b";

interface ServiceCardProps {
  variant: PaletteVariant;
  nombre: string;
  descripcion: string;
  precioDesde: number;
  duracionMinutos: number;
  imagenUrl: string;
}

const styles: Record<
  PaletteVariant,
  { ring: string; badge: string; icon: string; cta: string }
> = {
  a: {
    ring: "ring-a-rosa-suave/60",
    badge: "bg-a-rosa-suave/80 text-carbon",
    icon: "text-a-rosa-fuerte",
    cta: "text-a-rosa-fuerte group-hover:text-a-rosa",
  },
  b: {
    ring: "ring-b-rosa-suave/50",
    badge: "bg-b-salvia/15 text-b-salvia-fuerte",
    icon: "text-b-salvia-fuerte",
    cta: "text-b-salvia-fuerte group-hover:text-b-salvia",
  },
};

export function ServiceCard({
  variant,
  nombre,
  descripcion,
  precioDesde,
  duracionMinutos,
  imagenUrl,
}: ServiceCardProps) {
  const s = styles[variant];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-3xl border border-carbon/5 bg-white/60 shadow-[0_8px_30px_rgba(46,38,34,0.06)] ring-1 ${s.ring} backdrop-blur-xl transition-shadow hover:shadow-[0_12px_40px_rgba(46,38,34,0.12)]`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imagenUrl}
          alt={nombre}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span
          className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-medium ${s.badge} backdrop-blur-sm`}
        >
          Desde ${precioDesde.toLocaleString("es-MX")} MXN
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl text-carbon">{nombre}</h3>
        <p className="mt-2 text-sm leading-relaxed text-carbon/70">{descripcion}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-carbon/50">{duracionMinutos} min aprox.</span>
          <a
            href="#reservar"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${s.cta}`}
          >
            Agendar
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
