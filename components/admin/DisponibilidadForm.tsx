"use client";

import { useActionState } from "react";
import {
  agregarRangoDisponibilidadAction,
  eliminarRangoDisponibilidadAction,
  type DisponibilidadState,
} from "@/lib/agenda/actions";

interface Rango {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const initialState: DisponibilidadState = { error: null };

export function DisponibilidadForm({ rangos }: { rangos: Rango[] }) {
  const [state, formAction, pending] = useActionState(
    agregarRangoDisponibilidadAction,
    initialState
  );

  const porDia = DIAS.map((_, i) => rangos.filter((r) => r.dia_semana === i));

  return (
    <div>
      <ul className="space-y-3">
        {DIAS.map((nombre, i) => (
          <li key={nombre} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-24 font-medium text-carbon">{nombre}</span>
            {porDia[i].length === 0 ? (
              <span className="text-carbon/40">Sin horario</span>
            ) : (
              porDia[i].map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-2 rounded-full bg-rosa-suave/30 px-3 py-1 text-xs text-carbon"
                >
                  {r.hora_inicio.slice(0, 5)}–{r.hora_fin.slice(0, 5)}
                  <button
                    type="button"
                    onClick={() => eliminarRangoDisponibilidadAction(r.id)}
                    className="text-carbon/40 hover:text-red-600"
                    aria-label="Eliminar horario"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </li>
        ))}
      </ul>

      <form action={formAction} className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="dia_semana" className="text-xs text-carbon/60">Día</label>
          <select
            id="dia_semana"
            name="dia_semana"
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          >
            {DIAS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hora_inicio" className="text-xs text-carbon/60">De</label>
          <input
            id="hora_inicio"
            name="hora_inicio"
            type="time"
            required
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="hora_fin" className="text-xs text-carbon/60">A</label>
          <input
            id="hora_fin"
            name="hora_fin"
            type="time"
            required
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
