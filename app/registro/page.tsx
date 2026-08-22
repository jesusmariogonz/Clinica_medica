"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null };

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Portal del paciente
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Crear cuenta</h1>
      <p className="mt-3 text-sm text-carbon/60">
        Esta cuenta te permite ver tus citas, documentos y firmar
        consentimientos. El registro de expediente clínico lo captura la
        Dra. en tu primera consulta.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-carbon">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
          />
        </div>
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
        <div>
          <label htmlFor="password" className="text-sm font-medium text-carbon">
            Contraseña
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
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-carbon/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-rosa-fuerte">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
