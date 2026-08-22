// Cálculo puro de horarios disponibles — sin dependencias de Supabase para
// poder probarlo de forma aislada.

const PASO_MINUTOS = 15;

export interface RangoHorario {
  horaInicio: string; // "HH:MM" o "HH:MM:SS"
  horaFin: string;
}

export interface CitaOcupada {
  horaInicio: string; // "HH:MM"
  duracionMinutos: number;
}

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHHMM(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Calcula los horarios de inicio disponibles (cada 15 min) para un
 * servicio de `duracionMinutos`, dado el/los rango(s) de trabajo del día,
 * las citas ya ocupadas y bloqueos puntuales.
 */
export function calcularSlotsDisponibles(params: {
  rangosTrabajo: RangoHorario[];
  duracionMinutos: number;
  citasOcupadas: CitaOcupada[];
  bloqueos: RangoHorario[];
  diaCompletoBloqueado: boolean;
  ahoraMinutos?: number; // si es hoy, para no ofrecer horarios pasados
}): string[] {
  if (params.diaCompletoBloqueado) return [];

  const ocupados = [
    ...params.citasOcupadas.map((c) => ({
      inicio: aMinutos(c.horaInicio),
      fin: aMinutos(c.horaInicio) + c.duracionMinutos,
    })),
    ...params.bloqueos.map((b) => ({
      inicio: aMinutos(b.horaInicio),
      fin: aMinutos(b.horaFin),
    })),
  ];

  const slots: string[] = [];

  for (const rango of params.rangosTrabajo) {
    const inicioRango = aMinutos(rango.horaInicio);
    const finRango = aMinutos(rango.horaFin);

    for (
      let inicioSlot = inicioRango;
      inicioSlot + params.duracionMinutos <= finRango;
      inicioSlot += PASO_MINUTOS
    ) {
      const finSlot = inicioSlot + params.duracionMinutos;

      if (params.ahoraMinutos !== undefined && inicioSlot < params.ahoraMinutos) {
        continue;
      }

      const seCruza = ocupados.some(
        (o) => inicioSlot < o.fin && finSlot > o.inicio
      );

      if (!seCruza) {
        slots.push(aHHMM(inicioSlot));
      }
    }
  }

  return slots;
}
