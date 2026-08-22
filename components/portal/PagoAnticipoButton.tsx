"use client";

import { useActionState } from "react";
import { iniciarPagoStripeAction, iniciarPagoMercadoPagoAction, type PagoActionState } from "@/lib/pagos/actions";

const initialState: PagoActionState = { error: null };

export function PagoAnticipoButton({ citaId, mpDisponible }: { citaId: string; mpDisponible: boolean }) {
  const [stateStripe, formActionStripe, pendingStripe] = useActionState(
    iniciarPagoStripeAction,
    initialState
  );
  const [stateMp, formActionMp, pendingMp] = useActionState(
    iniciarPagoMercadoPagoAction,
    initialState
  );

  return (
    <div className="mt-2 flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <form action={formActionStripe}>
          <input type="hidden" name="cita_id" value={citaId} />
          <button
            type="submit"
            disabled={pendingStripe}
            className="rounded-full bg-rosa-fuerte px-4 py-1.5 text-xs font-medium text-white hover:bg-rosa disabled:opacity-60"
          >
            {pendingStripe ? "Redirigiendo..." : "Pagar con tarjeta"}
          </button>
        </form>

        {mpDisponible && (
          <form action={formActionMp}>
            <input type="hidden" name="cita_id" value={citaId} />
            <button
              type="submit"
              disabled={pendingMp}
              className="rounded-full border border-carbon/20 px-4 py-1.5 text-xs font-medium text-carbon hover:bg-carbon/5 disabled:opacity-60"
            >
              {pendingMp ? "Redirigiendo..." : "Pagar con Mercado Pago"}
            </button>
          </form>
        )}
      </div>
      {(stateStripe.error || stateMp.error) && (
        <p className="text-xs text-red-600">{stateStripe.error ?? stateMp.error}</p>
      )}
    </div>
  );
}
