"use client";

import { useActionState, useState } from "react";
import { crearPacienteAction, type FormState } from "@/lib/expedientes/actions";

const initialState: FormState = { error: null };

export function NuevoPacienteForm() {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState(crearPacienteAction, initialState);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa"
      >
        + Nuevo paciente
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-3xl border border-rosa-suave/50 bg-white/50 p-6 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="nombre" className="text-xs text-carbon/60">Nombre</label>
        <input id="nombre" name="nombre" required className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="apellido_paterno" className="text-xs text-carbon/60">Apellido paterno</label>
        <input id="apellido_paterno" name="apellido_paterno" required className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="apellido_materno" className="text-xs text-carbon/60">Apellido materno</label>
        <input id="apellido_materno" name="apellido_materno" className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="fecha_nacimiento" className="text-xs text-carbon/60">Fecha de nacimiento</label>
        <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="telefono" className="text-xs text-carbon/60">Teléfono</label>
        <input id="telefono" name="telefono" type="tel" className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="email" className="text-xs text-carbon/60">Correo</label>
        <input id="email" name="email" type="email" className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm" />
      </div>

      {state.error && (
        <p className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="sm:col-span-2 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Crear paciente"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full border border-carbon/20 px-5 py-2 text-sm font-medium text-carbon hover:bg-carbon/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
