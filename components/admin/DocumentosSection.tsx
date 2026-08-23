"use client";

import { useActionState, useState } from "react";
import { subirDocumentoAction, obtenerUrlFirmadaAction, type FormState } from "@/lib/expedientes/actions";

interface Documento {
  id: string;
  tipo: string;
  descripcion: string | null;
  storage_path: string;
  subido_en: string;
}

const initialState: FormState = { error: null };

export function DocumentosSection({ pacienteId, documentos }: { pacienteId: string; documentos: Documento[] }) {
  const [state, formAction, pending] = useActionState(subirDocumentoAction, initialState);
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  const verDocumento = async (doc: Documento) => {
    setCargandoId(doc.id);
    const url = await obtenerUrlFirmadaAction(doc.storage_path);
    setCargandoId(null);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <ul className="space-y-2">
        {documentos.length === 0 && (
          <p className="text-sm text-carbon/40">Sin documentos cargados.</p>
        )}
        {documentos.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium capitalize text-carbon">{d.tipo.replace("_", " ")}</p>
              {d.descripcion && <p className="text-xs text-carbon/50">{d.descripcion}</p>}
              <p className="text-xs text-carbon/40">
                {new Date(d.subido_en).toLocaleDateString("es-MX")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => verDocumento(d)}
              disabled={cargandoId === d.id}
              className="rounded-full border border-carbon/20 px-4 py-1.5 text-xs font-medium text-carbon hover:bg-carbon/5 disabled:opacity-60"
            >
              {cargandoId === d.id ? "Generando..." : "Ver"}
            </button>
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
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          >
            <option value="identificacion">Identificación</option>
            <option value="estudio">Estudio</option>
            <option value="foto_seguimiento">Foto de seguimiento</option>
            <option value="consentimiento_firmado">Consentimiento firmado</option>
            <option value="receta">Receta</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor="descripcion" className="text-xs text-carbon/60">Descripción</label>
          <input
            id="descripcion"
            name="descripcion"
            type="text"
            className="mt-1 rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="archivo" className="text-xs text-carbon/60">Archivo</label>
          <input
            id="archivo"
            name="archivo"
            type="file"
            required
            className="mt-1 block text-sm text-carbon/70 file:mr-3 file:rounded-full file:border-0 file:bg-rosa-suave/50 file:px-4 file:py-2 file:text-xs file:font-medium file:text-carbon hover:file:bg-rosa-suave"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa disabled:opacity-60"
        >
          {pending ? "Subiendo..." : "Subir"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
