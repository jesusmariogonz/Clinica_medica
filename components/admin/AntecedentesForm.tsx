"use client";

import { useActionState } from "react";
import { actualizarAntecedentesAction, type FormState } from "@/lib/expedientes/actions";

const initialState: FormState = { error: null };

interface Props {
  expedienteId: string;
  pacienteId: string;
  antecedentesHeredofamiliares: string | null;
  antecedentesPatologicos: string | null;
  antecedentesNoPatologicos: string | null;
}

export function AntecedentesForm({
  expedienteId,
  pacienteId,
  antecedentesHeredofamiliares,
  antecedentesPatologicos,
  antecedentesNoPatologicos,
}: Props) {
  const [state, formAction, pending] = useActionState(actualizarAntecedentesAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="expediente_id" value={expedienteId} />
      <input type="hidden" name="paciente_id" value={pacienteId} />

      <div>
        <label htmlFor="antecedentes_heredofamiliares" className="text-xs text-carbon/60">
          Antecedentes heredofamiliares
        </label>
        <textarea
          id="antecedentes_heredofamiliares"
          name="antecedentes_heredofamiliares"
          defaultValue={antecedentesHeredofamiliares ?? ""}
          rows={3}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="antecedentes_patologicos" className="text-xs text-carbon/60">
          Antecedentes patológicos
        </label>
        <textarea
          id="antecedentes_patologicos"
          name="antecedentes_patologicos"
          defaultValue={antecedentesPatologicos ?? ""}
          rows={3}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="antecedentes_no_patologicos" className="text-xs text-carbon/60">
          Antecedentes no patológicos
        </label>
        <textarea
          id="antecedentes_no_patologicos"
          name="antecedentes_no_patologicos"
          defaultValue={antecedentesNoPatologicos ?? ""}
          rows={3}
          className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar antecedentes"}
      </button>
    </form>
  );
}
