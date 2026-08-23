"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { solicitarRecuperacionAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null };

export default function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [, formAction, pending] = useActionState(async (prev: AuthActionState, formData: FormData) => {
    const result = await solicitarRecuperacionAction(prev, formData);
    if (!result.error) setEnviado(true);
    return result;
  }, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Acceso
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Recuperar contraseña</h1>
      <p className="mt-3 text-sm text-carbon/60">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {enviado ? (
        <p className="mt-8 rounded-xl bg-apoyo/10 px-4 py-3 text-sm text-carbon/80">
          Si existe una cuenta con ese correo, te llegará un enlace en unos
          minutos. Revisa también tu carpeta de spam.
        </p>
      ) : (
        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-carbon">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa disabled:opacity-60"
          >
            {pending ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-carbon/60">
        <Link href="/login" className="font-medium text-rosa-fuerte">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
