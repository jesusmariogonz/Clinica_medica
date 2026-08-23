"use client";

import { useActionState, useEffect, useState } from "react";
import { actualizarPasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthActionState = { error: null };

export default function ActualizarPasswordPage() {
  const [state, formAction, pending] = useActionState(actualizarPasswordAction, initialState);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Instanciar el cliente en el navegador procesa automáticamente el
    // token de recuperación que viene en la URL (enviado por Supabase) y
    // establece la sesión temporal necesaria para poder actualizar la
    // contraseña.
    const supabase = createClient();
    supabase.auth.getSession().then(() => setListo(true));
  }, []);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Acceso
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Nueva contraseña</h1>

      {!listo ? (
        <p className="mt-8 text-sm text-carbon/60">Verificando enlace...</p>
      ) : (
        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="text-sm font-medium text-carbon">
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
            />
            <p className="mt-1 text-xs text-carbon/40">Mínimo 8 caracteres.</p>
          </div>

          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}
