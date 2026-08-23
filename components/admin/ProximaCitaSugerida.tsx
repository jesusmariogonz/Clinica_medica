"use client";

import { useActionState, useTransition } from "react";
import {
  sugerirProximaCitaAction,
  quitarSugerenciaProximaCitaAction,
  type FormState,
} from "@/lib/expedientes/actions";

const initialState: FormState = { error: null };

interface Props {
  expedienteId: string;
  pacienteId: string;
  fechaSugerida: string | null;
  notaSugerida: string | null;
}

export function ProximaCitaSugerida({ expedienteId, pacienteId, fechaSugerida, notaSugerida }: Props) {
  const [state, formAction, pending] = useActionState(sugerirProximaCitaAction, initialState);
  const [quitando, startTransition] = useTransition();

  if (fechaSugerida) {
    return (
      <div className="rounded-2xl border border-rosa-suave/50 bg-rosa-suave/20 p-4 text-sm">
        <p className="font-medium text-carbon">
          Próxima cita sugerida: {new Date(`${fechaSugerida}T00:00:00`).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        {notaSugerida && <p className="mt-1 text-carbon/70">{notaSugerida}</p>}
        <button
          type="button"
          disabled={quitando}
          onClick={() => startTransition(() => quitarSugerenciaProximaCitaAction(expedienteId, pacienteId))}
          className="mt-2 text-xs text-carbon/50 hover:text-red-600"
        >
          Quitar sugerencia
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="expediente_id" value={expedienteId} />
      <input type="hidden" name="paciente_id" value={pacienteId} />
      <div>
        <label htmlFor="dias_adelante" className="text-xs text-carbon/60">Siguiente cita en (días)</label>
        <input
          id="dias_adelante"
          name="dias_adelante"
          type="number"
          min={1}
          required
          className="mt-1 w-28 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="nota" className="text-xs text-carbon/60">Nota (opcional)</label>
        <input
          id="nota"
          name="nota"
          type="text"
          placeholder="Ej. Aplicación de refuerzo"
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Sugerir"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
