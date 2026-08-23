import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { enviarRecordatorioCita } from "@/lib/resend/emails";

// Disparado por un cron de Vercel (ver vercel.json) una vez al día — los
// crons más frecuentes requieren el plan Pro de Vercel. Busca citas del
// día calendario siguiente (zona horaria de Monterrey/Saltillo) que aún
// no tengan recordatorio enviado, y las notifica. Usa service_role
// porque no hay sesión de usuario en un cron job; la autenticidad se
// verifica con CRON_SECRET, que Vercel firma automáticamente como header
// Authorization cuando el proyecto tiene esa variable configurada.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // El cron corre a las 15:00 UTC (9:00 CST). Tomamos "mañana" como el
  // rango de las próximas 12 a 36 horas para cubrir con margen todo el
  // día siguiente sin depender de un cálculo fino de zona horaria.
  const ahora = Date.now();
  const desde = new Date(ahora + 12 * 60 * 60 * 1000).toISOString();
  const hasta = new Date(ahora + 36 * 60 * 60 * 1000).toISOString();

  const { data: citas, error } = await supabase
    .from("citas")
    .select("id, fecha_hora, pacientes(nombre, email), servicios(nombre)")
    .gte("fecha_hora", desde)
    .lt("fecha_hora", hasta)
    .eq("recordatorio_enviado", false)
    .in("estado", ["pendiente", "confirmada"]);

  if (error) {
    return NextResponse.json({ error: "Error consultando citas." }, { status: 500 });
  }

  let enviados = 0;

  for (const cita of citas ?? []) {
    const paciente = cita.pacientes as unknown as { nombre: string; email: string | null } | null;
    const servicio = cita.servicios as unknown as { nombre: string } | null;

    if (!paciente?.email || !servicio) continue;

    await enviarRecordatorioCita(paciente.email, {
      nombrePaciente: paciente.nombre,
      nombreServicio: servicio.nombre,
      fechaHora: new Date(cita.fecha_hora),
      requiereAnticipo: false,
    });

    await supabase.from("citas").update({ recordatorio_enviado: true }).eq("id", cita.id);
    enviados++;
  }

  return NextResponse.json({ enviados });
}
