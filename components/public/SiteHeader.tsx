"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/servicios", label: "Servicios" },
  { href: "/quien-es", label: "La Dra." },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-colors sm:px-10 print:hidden ${
        scrolled
          ? "bg-crema/70 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <Link href="/" className="font-serif text-lg italic text-carbon">
        Dra. Maggie Morales
      </Link>
      <nav className="hidden gap-8 rounded-full bg-white/50 px-6 py-2 text-sm text-carbon backdrop-blur-md sm:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-rosa-fuerte">
            {l.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/reservar"
        prefetch={false}
        className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-rosa"
      >
        Agendar
      </Link>
    </header>
  );
}
