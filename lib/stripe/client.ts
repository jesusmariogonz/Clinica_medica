import Stripe from "stripe";

// Instancia única del SDK de Stripe para uso en server actions/route
// handlers. Nunca importar este módulo desde código de cliente.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});
