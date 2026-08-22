"use client";

import { useState } from "react";
import { obtenerUrlFirmadaPropiaAction } from "@/lib/portal/actions";

interface Documento {
  id: string;
  tipo: string;
  descripcion: string | null;
  subido_en: string;
}

export function DocumentosPropios({ documentos }: { documentos: Documento[] }) {
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  const verDocumento = async (id: string) => {
    setCargandoId(id);
    const url = await obtenerUrlFirmadaPropiaAction(id);
    setCargandoId(null);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (documentos.length === 0) {
    return <p className="text-sm text-carbon/40">Aún no tienes documentos disponibles.</p>;
  }

  return (
    <ul className="space-y-2">
      {documentos.map((d) => (
        <li key={d.id} className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm">
          <div>
            <p className="font-medium capitalize text-carbon">{d.tipo.replace(/_/g, " ")}</p>
            {d.descripcion && <p className="text-xs text-carbon/50">{d.descripcion}</p>}
            <p className="text-xs text-carbon/40">{new Date(d.subido_en).toLocaleDateString("es-MX")}</p>
          </div>
          <button
            type="button"
            onClick={() => verDocumento(d.id)}
            disabled={cargandoId === d.id}
            className="rounded-full border border-carbon/20 px-4 py-1.5 text-xs font-medium text-carbon hover:bg-carbon/5 disabled:opacity-60"
          >
            {cargandoId === d.id ? "Generando..." : "Ver"}
          </button>
        </li>
      ))}
    </ul>
  );
}
