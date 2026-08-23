"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  label: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl, label }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="overflow-hidden rounded-3xl">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative aspect-[4/5] w-full cursor-ew-resize select-none touch-none sm:aspect-[3/4]"
      >
        <Image
          src={afterUrl}
          alt={`${label} — después`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="pointer-events-none object-cover"
          unoptimized
        />

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeUrl}
            alt={`${label} — antes`}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
            unoptimized
          />
        </div>

        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white/90"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-rosa-fuerte shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-carbon/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
          Antes
        </span>
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-carbon/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
          Después
        </span>
      </div>
      <p className="mt-3 text-sm text-carbon/70">{label}</p>
    </div>
  );
}
