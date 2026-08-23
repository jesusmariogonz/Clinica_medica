"use client";

import { useMemo, useState } from "react";

interface CalendarioProps {
  fechaSeleccionada: string; // "YYYY-MM-DD"
  onSeleccionar: (fechaISO: string) => void;
  diasMaximoAdelante?: number; // ventana de reserva permitida
}

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];
const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Calendario({ fechaSeleccionada, onSeleccionar, diasMaximoAdelante = 60 }: CalendarioProps) {
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  const limiteMax = useMemo(() => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + diasMaximoAdelante);
    return d;
  }, [hoy, diasMaximoAdelante]);

  const celdas = useMemo(() => {
    const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
    const inicioOffset = primerDiaMes.getDay(); // 0=domingo

    const resultado: (Date | null)[] = [];
    for (let i = 0; i < inicioOffset; i++) resultado.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
      resultado.push(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia));
    }
    return resultado;
  }, [mesVisible]);

  const puedeRetroceder = mesVisible.getFullYear() > hoy.getFullYear() ||
    (mesVisible.getFullYear() === hoy.getFullYear() && mesVisible.getMonth() > hoy.getMonth());

  const puedeAvanzar = mesVisible < new Date(limiteMax.getFullYear(), limiteMax.getMonth(), 1);

  return (
    <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          disabled={!puedeRetroceder}
          onClick={() => setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="rounded-full p-1.5 text-carbon/60 hover:bg-carbon/5 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <p className="text-sm font-medium capitalize text-carbon">
          {NOMBRES_MES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
        </p>
        <button
          type="button"
          disabled={!puedeAvanzar}
          onClick={() => setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="rounded-full p-1.5 text-carbon/60 hover:bg-carbon/5 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-carbon/40">
        {DIAS_SEMANA.map((d, i) => (
          <span key={`${d}-${i}`} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdas.map((fecha, i) => {
          if (!fecha) return <span key={`vacio-${i}`} />;

          const iso = aISO(fecha);
          const deshabilitado = fecha < hoy || fecha > limiteMax;
          const esHoy = iso === aISO(hoy);
          const seleccionado = iso === fechaSeleccionada;

          return (
            <button
              key={iso}
              type="button"
              disabled={deshabilitado}
              onClick={() => onSeleccionar(iso)}
              className={`aspect-square rounded-lg text-sm transition-colors ${
                seleccionado
                  ? "bg-rosa-fuerte text-white"
                  : deshabilitado
                    ? "text-carbon/20"
                    : esHoy
                      ? "border border-rosa-fuerte text-carbon hover:bg-rosa-suave/30"
                      : "text-carbon hover:bg-rosa-suave/30"
              }`}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
