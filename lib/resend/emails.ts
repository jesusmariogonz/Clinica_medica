import { getResend, FROM_EMAIL } from "@/lib/resend/client";

interface DatosCita {
  nombrePaciente: string;
  nombreServicio: string;
  fechaHora: Date;
  requiereAnticipo: boolean;
  montoAnticipo?: number;
}

function formatearFechaHora(fecha: Date): string {
  return fecha.toLocaleString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Monterrey",
  });
}

// Envoltura HTML compartida — misma paleta cálida/rosa del sitio, simple
// e inline (los clientes de correo no soportan CSS externo/Tailwind).
function envoltura(contenido: string): string {
  return `
  <div style="background:#faf6f1;padding:32px 16px;font-family:Georgia,serif;color:#2e2622;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="font-style:italic;font-size:18px;margin:0 0 24px;color:#2e2622;">Dra. Maggie Morales</p>
      ${contenido}
      <p style="margin-top:32px;font-size:12px;color:#2e2622a0;font-family:Arial,sans-serif;">
        Medicina Estética · Saltillo, Coahuila
      </p>
    </div>
  </div>`;
}

// No lanza si Resend falla (p. ej. sin API key en desarrollo): el correo
// es una confirmación de cortesía, nunca debe tumbar el flujo de reserva
// o pago que ya se completó correctamente en la base de datos.
async function enviarSeguro(params: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada; se omite el envío de email.");
    return;
  }

  try {
    await resend.emails.send({ from: FROM_EMAIL, ...params });
  } catch (err) {
    console.error("Error enviando email transaccional:", err);
  }
}

export async function enviarConfirmacionCita(to: string, datos: DatosCita) {
  const anticipoHtml = datos.requiereAnticipo
    ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:#d9738f;">
         Este tratamiento requiere un anticipo${
           datos.montoAnticipo ? ` de $${datos.montoAnticipo.toLocaleString("es-MX")} MXN` : ""
         } para confirmar tu horario. Puedes pagarlo desde tu portal de paciente.
       </p>`
    : "";

  await enviarSeguro({
    to,
    subject: "Confirmación de tu cita",
    html: envoltura(`
      <h1 style="font-size:22px;margin:0 0 16px;">Tu cita fue registrada</h1>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
        Hola ${datos.nombrePaciente}, confirmamos tu cita para
        <strong>${datos.nombreServicio}</strong> el
        <strong>${formatearFechaHora(datos.fechaHora)}</strong>.
      </p>
      ${anticipoHtml}
    `),
  });
}

export async function enviarRecordatorioCita(to: string, datos: DatosCita) {
  await enviarSeguro({
    to,
    subject: "Recordatorio: tu cita es mañana",
    html: envoltura(`
      <h1 style="font-size:22px;margin:0 0 16px;">Te esperamos mañana</h1>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
        Hola ${datos.nombrePaciente}, este es un recordatorio de tu cita de
        <strong>${datos.nombreServicio}</strong> el
        <strong>${formatearFechaHora(datos.fechaHora)}</strong>.
      </p>
    `),
  });
}
