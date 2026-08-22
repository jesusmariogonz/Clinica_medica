"use client";

import { useActionState, useState } from "react";
import { firmarConsentimientoAction, type FormState } from "@/lib/portal/actions";

interface Consentimiento {
  id: string;
  tipo: string;
  texto_version: string;
}

const initialState: FormState = { error: null };

function FirmaForm({ consentimiento }: { consentimiento: Consentimiento }) {
  const [state, formAction, pending] = useActionState(firmarConsentimientoAction, initialState);
  const [acepto, setAcepto] = useState(false);

  return (
    <form action={formAction} className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-5">
      <input type="hidden" name="consentimiento_id" value={consentimiento.id} />
      <p className="font-medium capitalize text-carbon">{consentimiento.tipo.replace(/_/g, " ")}</p>
      <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-arena/30 p-3 text-xs text-carbon/70">
        {consentimiento.texto_version}
      </p>

      <label className="mt-3 flex items-start gap-2 text-xs text-carbon/70">
        <input
          type="checkbox"
          name="acepto"
          checked={acepto}
          onChange={(e) => setAcepto(e.target.checked)}
          className="mt-0.5"
        />
        He leído y acepto el texto anterior. Entiendo que esta firma electrónica
        queda registrada con fecha, hora y un identificador único vinculado a este texto.
      </label>

      {state.error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={!acepto || pending}
        className="mt-3 rounded-full bg-rosa-fuerte px-5 py-2 text-xs font-medium text-white hover:bg-rosa disabled:opacity-40"
      >
        {pending ? "Firmando..." : "Firmar"}
      </button>
    </form>
  );
}

export function ConsentimientosPendientes({ consentimientos }: { consentimientos: Consentimiento[] }) {
  if (consentimientos.length === 0) {
    return <p className="text-sm text-carbon/40">No tienes consentimientos pendientes de firma.</p>;
  }

  return (
    <div className="space-y-4">
      {consentimientos.map((c) => (
        <FirmaForm key={c.id} consentimiento={c} />
      ))}
    </div>
  );
}
