import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-carbon/10 bg-arena/40 px-6 py-14 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        <div>
          <span className="font-serif text-lg italic text-carbon">Dra. Maggie Morales</span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-carbon/70">
            Medicina estética en Saltillo, Coahuila. Resultados naturales,
            tratamientos personalizados y mínimamente invasivos.
          </p>
        </div>

        <div className="text-sm text-carbon/70">
          <p className="mb-3 font-medium text-carbon">Navegación</p>
          <ul className="space-y-2">
            <li><Link href="/servicios" className="hover:text-rosa-fuerte">Servicios</Link></li>
            <li><Link href="/quien-es" className="hover:text-rosa-fuerte">La Dra.</Link></li>
            <li><Link href="/galeria" className="hover:text-rosa-fuerte">Galería</Link></li>
            <li><Link href="/contacto" className="hover:text-rosa-fuerte">Contacto</Link></li>
          </ul>
        </div>

        <div className="text-sm text-carbon/70">
          <p className="mb-3 font-medium text-carbon">Legal</p>
          <ul className="space-y-2">
            <li><Link href="/aviso-privacidad" className="hover:text-rosa-fuerte">Aviso de privacidad</Link></li>
            <li><Link href="/consentimiento-informado" className="hover:text-rosa-fuerte">Consentimiento informado</Link></li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl text-xs text-carbon/40">
        © {new Date().getFullYear()} Dra. Maggie Morales · Medicina Estética · Saltillo, Coahuila.
      </p>
    </footer>
  );
}
