// Datos placeholder para renderizado estático del sitio público antes de
// conectar Supabase. Reflejan la tabla `servicios` (ver supabase/seed.sql).
export interface ServicioPlaceholder {
  slug: string;
  nombre: string;
  descripcion: string;
  precioDesde: number;
  duracionMinutos: number;
  imagenUrl: string;
}

export const serviciosPlaceholder: ServicioPlaceholder[] = [
  {
    slug: "valoracion-inicial",
    nombre: "Valoración inicial",
    descripcion: "Consulta de valoración y plan de tratamiento personalizado.",
    precioDesde: 500,
    duracionMinutos: 30,
    imagenUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "toxina-botulinica",
    nombre: "Toxina botulínica",
    descripcion: "Tratamiento para líneas de expresión con resultados naturales.",
    precioDesde: 4500,
    duracionMinutos: 45,
    imagenUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "acido-hialuronico-labios",
    nombre: "Ácido hialurónico - labios",
    descripcion: "Armonización facial sutil, realce natural sin exagerar.",
    precioDesde: 5500,
    duracionMinutos: 60,
    imagenUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "bioestimulador-colageno",
    nombre: "Bioestimulador de colágeno",
    descripcion: "Estimulación de colágeno para mejorar firmeza y calidad de piel.",
    precioDesde: 6800,
    duracionMinutos: 60,
    imagenUrl:
      "https://images.unsplash.com/photo-1596178060810-72660ee8d3e9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "limpieza-facial-profunda",
    nombre: "Limpieza facial profunda",
    descripcion: "Limpieza facial profesional con extracción e hidratación.",
    precioDesde: 900,
    duracionMinutos: 50,
    imagenUrl:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1200&auto=format&fit=crop",
  },
];
