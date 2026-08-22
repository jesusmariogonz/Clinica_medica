"use client";

import { useActionState } from "react";
import {
  agregarBloqueoAction,
  eliminarBloqueoAction,
  type DisponibilidadState,
} from "@/lib/agenda/actions";

interface Bloqueo {
  id: string;
  fecha: string;
  motivo: string | null;
}

const initialState: DisponibilidadState = { error: null };

export function BloqueosForm({ bloqueos }: { bloqueos: Bloqueo[] }) {
  const [state, formAction, pending] = useActionState(agregarBloqueoAction, initialState);

  return (
    <div>
      {bloqueos.length === 0 ? (
        <p className="text-sm text-carbon/40">Sin días bloqueados.</p>
      ) : (
        <ul className="space-y-2">
          {bloqueos.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-xl bg-arena/40 px-4 py-2 text-sm"
            >
              <span className="text-carbon">
                {new Date(`${b.fecha}T00:00:00`).toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                {b.motivo && <span className="text-carbon/50"> — {b.motivo}</span>}
              </span>
              <button
                type="button"
                onClick={() => eliminarBloqueoAction(b.id)}
                className="text-carbon/40 hover:text-red-600"
                aria-label="Eliminar bloqueo"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="fecha" className="text-xs text-carbon/60">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="motivo" className="text-xs text-carbon/60">Motivo (opcional)</label>
          <input
            id="motivo"
            name="motivo"
            type="text"
            placeholder="Vacaciones, congreso..."
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Bloquear día"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
