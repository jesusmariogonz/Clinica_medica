"use client";

import { useTransition } from "react";
import { firmarNotaAction } from "@/lib/expedientes/actions";

interface Nota {
  id: string;
  contenido: string;
  padecimiento_actual: string | null;
  exploracion_fisica: string | null;
  fecha: string;
  firmada: boolean;
  version: number;
}

export function NotasTimeline({ notas, pacienteId }: { notas: Nota[]; pacienteId: string }) {
  const [pending, startTransition] = useTransition();

  if (notas.length === 0) {
    return <p className="text-sm text-carbon/40">Sin notas de evolución registradas.</p>;
  }

  return (
    <ul className="space-y-4">
      {notas.map((n) => (
        <li key={n.id} className="rounded-2xl border border-carbon/10 bg-white/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-carbon/50">
              {new Date(n.fecha).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
              {n.version > 1 && ` · versión ${n.version}`}
            </p>
            {n.firmada ? (
              <span className="rounded-full bg-apoyo/20 px-3 py-0.5 text-xs font-medium text-carbon">
                Firmada
              </span>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => firmarNotaAction(n.id, pacienteId))}
                className="rounded-full bg-rosa-fuerte px-3 py-0.5 text-xs font-medium text-white hover:bg-rosa disabled:opacity-60"
              >
                {pending ? "Firmando..." : "Firmar"}
              </button>
            )}
          </div>

          {n.padecimiento_actual && (
            <p className="mt-3 text-sm text-carbon">
              <span className="font-medium">Padecimiento actual: </span>
              {n.padecimiento_actual}
            </p>
          )}
          {n.exploracion_fisica && (
            <p className="mt-1 text-sm text-carbon">
              <span className="font-medium">Exploración física: </span>
              {n.exploracion_fisica}
            </p>
          )}
          <p className="mt-1 whitespace-pre-wrap text-sm text-carbon/80">{n.contenido}</p>
        </li>
      ))}
    </ul>
  );
}
