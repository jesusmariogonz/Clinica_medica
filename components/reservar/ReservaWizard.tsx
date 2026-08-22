"use client";

import { useActionState, useMemo, useState } from "react";
import {
  crearCitaAction,
  obtenerSlotsDisponiblesAction,
  type CrearCitaState,
} from "@/lib/agenda/actions";

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  anticipo_requerido: number;
  duracion_minutos: number;
}

interface ReservaWizardProps {
  servicios: Servicio[];
  requierePerfilPaciente: boolean;
  emailSesion: string;
}

const initialState: CrearCitaState = { error: null, ok: false };

function proximosDias(cantidad: number): string[] {
  const dias: string[] = [];
  const hoy = new Date();
  for (let i = 0; i < cantidad; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

function formatearFecha(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export function ReservaWizard({
  servicios,
  requierePerfilPaciente,
  emailSesion,
}: ReservaWizardProps) {
  const [servicioId, setServicioId] = useState<string>(servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [state, formAction, pending] = useActionState(crearCitaAction, initialState);

  const dias = useMemo(() => proximosDias(21), []);
  const servicioSeleccionado = servicios.find((s) => s.id === servicioId);

  const cargarSlots = (nuevaFecha: string, nuevoServicioId: string) => {
    if (!nuevaFecha || !nuevoServicioId) return;
    setHora("");
    setCargandoSlots(true);
    obtenerSlotsDisponiblesAction(nuevaFecha, nuevoServicioId)
      .then((res) => setSlots(res.slots))
      .finally(() => setCargandoSlots(false));
  };

  const elegirServicio = (id: string) => {
    setServicioId(id);
    if (fecha) cargarSlots(fecha, id);
  };

  const elegirFecha = (d: string) => {
    setFecha(d);
    cargarSlots(d, servicioId);
  };

  if (state.ok) {
    return (
      <div className="rounded-3xl border border-rosa-suave/50 bg-white/60 p-8 text-center">
        <h2 className="font-serif text-2xl text-carbon">¡Cita reservada!</h2>
        <p className="mt-3 text-sm text-carbon/70">
          {servicioSeleccionado?.anticipo_requerido ? (
            <>
              Este tratamiento requiere un anticipo de $
              {servicioSeleccionado.anticipo_requerido.toLocaleString("es-MX")} MXN para
              confirmar tu horario. El pago en línea estará disponible próximamente — mientras
              tanto, te contactaremos para coordinarlo.
            </>
          ) : (
            "Te esperamos en tu cita. Recibirás un recordatorio antes de la fecha."
          )}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="servicio_id" value={servicioId} />
      <input type="hidden" name="fecha" value={fecha} />
      <input type="hidden" name="hora" value={hora} />

      <div>
        <p className="mb-3 text-sm font-medium text-carbon">1. Tratamiento</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {servicios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => elegirServicio(s.id)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                servicioId === s.id
                  ? "border-rosa-fuerte bg-rosa-suave/30"
                  : "border-carbon/10 bg-white/50 hover:border-rosa-suave"
              }`}
            >
              <span className="font-medium text-carbon">{s.nombre}</span>
              <span className="mt-1 block text-xs text-carbon/50">
                ${s.precio.toLocaleString("es-MX")} MXN · {s.duracion_minutos} min
                {s.anticipo_requerido > 0 && " · requiere anticipo"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-carbon">2. Fecha</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dias.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => elegirFecha(d)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs capitalize transition-colors ${
                fecha === d
                  ? "border-rosa-fuerte bg-rosa-suave/30 text-carbon"
                  : "border-carbon/10 bg-white/50 text-carbon/70 hover:border-rosa-suave"
              }`}
            >
              {formatearFecha(d)}
            </button>
          ))}
        </div>
      </div>

      {fecha && (
        <div>
          <p className="mb-3 text-sm font-medium text-carbon">3. Horario</p>
          {cargandoSlots ? (
            <p className="text-sm text-carbon/50">Buscando horarios...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-carbon/50">
              No hay horarios disponibles ese día. Elige otra fecha.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHora(s)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    hora === s
                      ? "border-rosa-fuerte bg-rosa-fuerte text-white"
                      : "border-carbon/10 bg-white/50 text-carbon hover:border-rosa-suave"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hora && requierePerfilPaciente && (
        <div>
          <p className="mb-3 text-sm font-medium text-carbon">4. Tus datos</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="text-xs text-carbon/60">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                required
                className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rosa-fuerte"
              />
            </div>
            <div>
              <label htmlFor="apellido_paterno" className="text-xs text-carbon/60">Apellido paterno</label>
              <input
                id="apellido_paterno"
                name="apellido_paterno"
                required
                className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rosa-fuerte"
              />
            </div>
            <div>
              <label htmlFor="fecha_nacimiento" className="text-xs text-carbon/60">Fecha de nacimiento</label>
              <input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                required
                className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rosa-fuerte"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="text-xs text-carbon/60">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="mt-1 w-full rounded-xl border border-carbon/10 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rosa-fuerte"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-carbon/40">Cuenta: {emailSesion}</p>
        </div>
      )}

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={!hora || pending}
        className="w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa disabled:opacity-40"
      >
        {pending ? "Reservando..." : "Confirmar cita"}
      </button>
    </form>
  );
}
