"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type PaletteVariant = "a" | "b";

interface HeroProps {
  variant: PaletteVariant;
}

const accentClasses: Record<PaletteVariant, { btn: string; badge: string; kicker: string }> = {
  a: {
    btn: "bg-a-rosa-fuerte hover:bg-a-rosa text-white",
    badge: "bg-a-rosa-suave/70 text-carbon",
    kicker: "text-a-rosa-fuerte",
  },
  b: {
    btn: "bg-b-salvia-fuerte hover:bg-b-salvia text-white",
    badge: "bg-b-rosa-suave/70 text-carbon",
    kicker: "text-b-salvia-fuerte",
  },
};

export function Hero({ variant }: HeroProps) {
  const accent = accentClasses[variant];

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2400&auto=format&fit=crop"
          alt="Consultorio de medicina estética, ambiente cálido y luminoso"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 via-carbon/20 to-carbon/10" />
      </motion.div>

      {/* nav translúcida */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-serif text-lg italic text-white">Dra. Maggie Morales</span>
        <nav className="hidden gap-8 rounded-full bg-white/10 px-6 py-2 text-sm text-white backdrop-blur-md sm:flex">
          <a href="#servicios" className="hover:opacity-80">Servicios</a>
          <a href="#quien-es" className="hover:opacity-80">La Dra.</a>
          <a href="#galeria" className="hover:opacity-80">Galería</a>
          <a href="#contacto" className="hover:opacity-80">Contacto</a>
        </nav>
      </header>

      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-20 sm:px-10 sm:pb-28">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase ${accent.badge} backdrop-blur-sm`}
        >
          Medicina estética · Saltillo, Coahuila
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="max-w-2xl font-serif text-4xl leading-tight text-white sm:text-6xl"
        >
          Belleza natural,{" "}
          <span className="italic text-white/90">cuidada con precisión médica</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg"
        >
          Tratamientos personalizados y mínimamente invasivos, pensados para
          realzar tu esencia — sin exagerar, sin prisas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <a
            href="#reservar"
            className={`rounded-full px-7 py-3 text-sm font-medium transition-colors ${accent.btn}`}
          >
            Agendar valoración
          </a>
          <a
            href="#servicios"
            className="rounded-full border border-white/40 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Ver tratamientos
          </a>
        </motion.div>
      </div>
    </section>
  );
}
