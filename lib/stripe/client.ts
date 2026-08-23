import Stripe from "stripe";

// Inicialización perezosa: el SDK de Stripe lanza en el constructor si no
// hay API key, lo que rompería el build/arranque del servidor incluso en
// rutas que no cobran nada todavía (p. ej. el webhook antes de validar la
// firma). Se crea solo hasta el primer uso real.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY no configurada.");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return _stripe;
}
