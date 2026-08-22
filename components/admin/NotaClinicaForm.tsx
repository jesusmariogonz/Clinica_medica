"use client";

import { useActionState } from "react";
import { crearNotaClinicaAction, type FormState } from "@/lib/expedientes/actions";

const initialState: FormState = { error: null };

export function NotaClinicaForm({ expedienteId, pacienteId }: { expedienteId: string; pacienteId: string }) {
  const [state, formAction, pending] = useActionState(crearNotaClinicaAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6">
      <input type="hidden" name="expediente_id" value={expedienteId} />
      <input type="hidden" name="paciente_id" value={pacienteId} />

      <p className="font-serif text-lg text-carbon">Nueva nota de evolución</p>

      <div>
        <label htmlFor="padecimiento_actual" className="text-xs text-carbon/60">Padecimiento actual</label>
        <textarea
          id="padecimiento_actual"
          name="padecimiento_actual"
          rows={2}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="exploracion_fisica" className="text-xs text-carbon/60">Exploración física</label>
        <textarea
          id="exploracion_fisica"
          name="exploracion_fisica"
          rows={2}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="contenido" className="text-xs text-carbon/60">Nota / plan de tratamiento</label>
        <textarea
          id="contenido"
          name="contenido"
          required
          rows={4}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>

      <p className="text-xs text-carbon/40">
        Una vez guardada, esta nota no podrá editarse ni borrarse (registro
        append-only conforme a NOM-004-SSA3-2012). Podrás firmarla después
        para hacerla definitiva.
      </p>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar nota"}
      </button>
    </form>
  );
}
