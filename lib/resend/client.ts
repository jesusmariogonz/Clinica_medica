import { Resend } from "resend";

// Inicialización perezosa: el SDK de Resend lanza en el constructor si no
// hay API key, lo que rompería el build/arranque del servidor incluso en
// rutas que no envían correo todavía. Se crea solo hasta el primer uso
// real (dentro de enviarSeguro, en lib/resend/emails.ts).
let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Dra. Maggie Morales <no-reply@example.com>";
