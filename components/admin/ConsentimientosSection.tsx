"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { crearConsentimientoPendienteAction, type FormState } from "@/lib/expedientes/actions";

interface Consentimiento {
  id: string;
  tipo: string;
  firmado_en: string | null;
}

const initialState: FormState = { error: null };

export function ConsentimientosSection({
  pacienteId,
  consentimientos,
}: {
  pacienteId: string;
  consentimientos: Consentimiento[];
}) {
  const [tipo, setTipo] = useState("tratamiento_general");
  const [state, formAction, pending] = useActionState(crearConsentimientoPendienteAction, initialState);

  return (
    <div>
      <ul className="space-y-2">
        {consentimientos.length === 0 && (
          <p className="text-sm text-carbon/40">Sin consentimientos solicitados.</p>
        )}
        {consentimientos.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm"
          >
            <span className="capitalize text-carbon">{c.tipo.replace(/_/g, " ")}</span>
            <div className="flex items-center gap-2">
              {c.firmado_en ? (
                <span className="rounded-full bg-apoyo/20 px-3 py-0.5 text-xs font-medium text-carbon">
                  Firmado {new Date(c.firmado_en).toLocaleDateString("es-MX")}
                </span>
              ) : (
                <span className="rounded-full bg-rosa-suave/40 px-3 py-0.5 text-xs font-medium text-carbon">
                  Pendiente de firma
                </span>
              )}
              <Link
                href={`/admin/pacientes/${pacienteId}/consentimientos/${c.id}`}
                className="text-xs font-medium text-rosa-fuerte hover:underline"
              >
                Ver
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <form action={formAction} className="mt-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="paciente_id" value={pacienteId} />
        <div>
          <label htmlFor="tipo" className="text-xs text-carbon/60">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          >
            <option value="tratamiento_general">Tratamiento general</option>
            <option value="aviso_privacidad">Aviso de privacidad</option>
            <option value="procedimiento_especifico">Procedimiento específico</option>
          </select>
        </div>
        {tipo === "procedimiento_especifico" && (
          <div className="flex-1">
            <label htmlFor="texto_personalizado" className="text-xs text-carbon/60">
              Descripción del procedimiento
            </label>
            <input
              id="texto_personalizado"
              name="texto_personalizado"
              type="text"
              className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Solicitar firma"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
