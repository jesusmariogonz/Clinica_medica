"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const registrado = searchParams.get("registrado") === "1";
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Acceso
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Iniciar sesión</h1>

      {registrado && (
        <p className="mt-4 rounded-xl bg-apoyo/10 px-4 py-3 text-sm text-carbon/80">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
          />
        </div>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-carbon/60">
        ¿Primera vez?{" "}
        <Link href="/registro" className="font-medium text-rosa-fuerte">
          Crea tu cuenta de paciente
        </Link>
      </p>
    </div>
  );
}
