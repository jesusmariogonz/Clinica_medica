"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ServiceCardProps {
  nombre: string;
  descripcion: string;
  precioDesde: number;
  duracionMinutos: number;
  imagenUrl: string;
}

export function ServiceCard({
  nombre,
  descripcion,
  precioDesde,
  duracionMinutos,
  imagenUrl,
}: ServiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-carbon/5 bg-white/60 shadow-[0_8px_30px_rgba(46,38,34,0.06)] ring-1 ring-rosa-suave/60 backdrop-blur-xl transition-shadow hover:shadow-[0_12px_40px_rgba(46,38,34,0.12)]"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imagenUrl}
          alt={nombre}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-rosa-suave/80 px-3 py-1 text-xs font-medium text-carbon backdrop-blur-sm">
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
            className="flex items-center gap-1 text-sm font-medium text-rosa-fuerte transition-colors group-hover:text-rosa"
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
