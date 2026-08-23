"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface CitaAgenda {
  id: string;
  fechaHora: string;
  estado: string;
  requiereAnticipo: boolean;
  anticipoPagado: boolean;
  pacienteId: string;
  pacienteNombre: string;
  pacienteTelefono: string | null;
  pacienteEmail: string | null;
  servicioNombre: string;
  esPacienteNuevo: boolean;
}

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];
const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AgendaCalendario({ citas }: { citas: CitaAgenda[] }) {
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [citaExpandida, setCitaExpandida] = useState<string | null>(null);

  const citasPorDia = useMemo(() => {
    const mapa = new Map<string, CitaAgenda[]>();
    for (const c of citas) {
      const iso = c.fechaHora.slice(0, 10);
      if (!mapa.has(iso)) mapa.set(iso, []);
      mapa.get(iso)!.push(c);
    }
    return mapa;
  }, [citas]);

  const celdas = useMemo(() => {
    const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
    const inicioOffset = primerDiaMes.getDay();

    const resultado: (Date | null)[] = [];
    for (let i = 0; i < inicioOffset; i++) resultado.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
      resultado.push(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia));
    }
    return resultado;
  }, [mesVisible]);

  const citasDelDia = diaSeleccionado ? (citasPorDia.get(diaSeleccionado) ?? []) : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="rounded-full p-1.5 text-carbon/60 hover:bg-carbon/5"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <p className="text-sm font-medium capitalize text-carbon">
            {NOMBRES_MES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="rounded-full p-1.5 text-carbon/60 hover:bg-carbon/5"
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
            const esHoy = iso === aISO(hoy);
            const seleccionado = iso === diaSeleccionado;
            const numCitas = citasPorDia.get(iso)?.length ?? 0;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  setDiaSeleccionado(iso);
                  setCitaExpandida(null);
                }}
                className={`relative aspect-square rounded-lg text-sm transition-colors ${
                  seleccionado
                    ? "bg-rosa-fuerte text-white"
                    : esHoy
                      ? "border border-rosa-fuerte text-carbon hover:bg-rosa-suave/30"
                      : "text-carbon hover:bg-rosa-suave/30"
                }`}
              >
                {fecha.getDate()}
                {numCitas > 0 && (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      seleccionado ? "bg-white" : "bg-rosa-fuerte"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {!diaSeleccionado ? (
          <p className="text-sm text-carbon/40">Selecciona un día para ver sus citas.</p>
        ) : citasDelDia.length === 0 ? (
          <p className="text-sm text-carbon/40">Sin citas ese día.</p>
        ) : (
          <div className="space-y-2">
            {citasDelDia.map((c) => (
              <div key={c.id} className="rounded-xl border border-carbon/10 bg-white/50 p-3">
                <button
                  type="button"
                  onClick={() => setCitaExpandida(citaExpandida === c.id ? null : c.id)}
                  className="flex w-full items-center justify-between text-left text-sm"
                >
                  <div>
                    <p className="font-medium text-carbon">{c.pacienteNombre}</p>
                    <p className="text-carbon/50">
                      {new Date(c.fechaHora).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}
                      {" · "}{c.servicioNombre}
                    </p>
                  </div>
                  <span className="text-carbon/30">{citaExpandida === c.id ? "▲" : "▼"}</span>
                </button>

                {citaExpandida === c.id && (
                  <div className="mt-3 space-y-2 border-t border-carbon/10 pt-3 text-xs text-carbon/70">
                    {c.pacienteTelefono && <p>Tel: {c.pacienteTelefono}</p>}
                    {c.pacienteEmail && <p>Correo: {c.pacienteEmail}</p>}
                    <p>
                      Estado: {c.estado}
                      {c.requiereAnticipo && !c.anticipoPagado && " · anticipo pendiente"}
                    </p>
                    <div className="pt-1">
                      {c.esPacienteNuevo ? (
                        <span className="rounded-full bg-apoyo/20 px-3 py-1 text-carbon">
                          Paciente nuevo
                        </span>
                      ) : (
                        <Link
                          href={`/admin/pacientes/${c.pacienteId}`}
                          className="rounded-full bg-rosa-fuerte px-3 py-1 font-medium text-white hover:bg-rosa"
                        >
                          Ver historial clínico
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
