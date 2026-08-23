"use client";

import { useActionState, useState } from "react";
import { reenviarConfirmacionAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null };

export function ReenviarConfirmacion({ email }: { email: string }) {
  const [enviado, setEnviado] = useState(false);
  const [, formAction, pending] = useActionState(async (prev: AuthActionState, formData: FormData) => {
    const result = await reenviarConfirmacionAction(prev, formData);
    setEnviado(true);
    return result;
  }, initialState);

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="email" value={email} />
      {pending ? (
        <p className="text-xs text-carbon/60">Reenviando...</p>
      ) : enviado ? (
        <p className="text-xs text-carbon/60">Correo reenviado. Revisa tu bandeja (y spam).</p>
      ) : (
        <button type="submit" className="text-xs font-medium text-rosa-fuerte hover:underline">
          Reenviar correo de confirmación
        </button>
      )}
    </form>
  );
}
