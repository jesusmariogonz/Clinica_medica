"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { mpHabilitado, crearPreferenciaMercadoPago } from "@/lib/mercadopago/client";

export interface PagoActionState {
  error: string | null;
}

// Crea el checkout de Stripe para el anticipo de una cita del paciente
// autenticado y redirige. El registro en `pagos` se crea aquí mismo
// (estado pendiente, policy pagos_insert_self) para poder conciliarlo
// después con el webhook por stripe_payment_id (session.id).
export async function iniciarPagoStripeAction(
  _prevState: PagoActionState,
  formData: FormData
): Promise<PagoActionState> {
  const sesion = await requireRole("paciente");
  const supabase = await createClient();

  const citaId = String(formData.get("cita_id") ?? "");

  const { data: cita } = await supabase
    .from("citas")
    .select("id, anticipo_pagado, requiere_anticipo, servicios(nombre, anticipo_requerido), pacientes(user_id)")
    .eq("id", citaId)
    .single();

  if (!cita) return { error: "Cita no encontrada." };

  const paciente = cita.pacientes as unknown as { user_id: string | null } | null;
  if (paciente?.user_id !== sesion.userId) {
    return { error: "No autorizado." };
  }

  if (!cita.requiere_anticipo || cita.anticipo_pagado) {
    return { error: "Esta cita no tiene un anticipo pendiente." };
  }

  const servicio = cita.servicios as unknown as { nombre: string; anticipo_requerido: number } | null;
  if (!servicio) return { error: "Servicio no encontrado." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(servicio.anticipo_requerido * 100),
          product_data: {
            name: `Anticipo — ${servicio.nombre}`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: sesion.email,
    metadata: { cita_id: citaId },
    success_url: `${siteUrl}/portal?pago=exitoso`,
    cancel_url: `${siteUrl}/portal?pago=cancelado`,
  });

  if (!session.url) {
    return { error: "No se pudo iniciar el pago. Intenta de nuevo." };
  }

  const { error: pagoError } = await supabase.from("pagos").insert({
    cita_id: citaId,
    monto: servicio.anticipo_requerido,
    metodo: "stripe",
    stripe_payment_id: session.id,
    estado: "pendiente",
  });

  if (pagoError) {
    return { error: "No se pudo registrar el intento de pago." };
  }

  redirect(session.url);
}

// Mercado Pago: solo disponible si NEXT_PUBLIC_MP_ENABLED=true y hay
// credenciales configuradas. Mientras tanto queda oculto en la UI.
export async function iniciarPagoMercadoPagoAction(
  _prevState: PagoActionState,
  formData: FormData
): Promise<PagoActionState> {
  if (!mpHabilitado()) {
    return { error: "Mercado Pago no está disponible por el momento." };
  }

  const sesion = await requireRole("paciente");
  const supabase = await createClient();
  const citaId = String(formData.get("cita_id") ?? "");

  const { data: cita } = await supabase
    .from("citas")
    .select("id, anticipo_pagado, requiere_anticipo, servicios(nombre, anticipo_requerido), pacientes(user_id)")
    .eq("id", citaId)
    .single();

  if (!cita) return { error: "Cita no encontrada." };

  const paciente = cita.pacientes as unknown as { user_id: string | null } | null;
  if (paciente?.user_id !== sesion.userId) {
    return { error: "No autorizado." };
  }

  if (!cita.requiere_anticipo || cita.anticipo_pagado) {
    return { error: "Esta cita no tiene un anticipo pendiente." };
  }

  const servicio = cita.servicios as unknown as { nombre: string; anticipo_requerido: number } | null;
  if (!servicio) return { error: "Servicio no encontrado." };

  const { initPoint, preferenceId } = await crearPreferenciaMercadoPago({
    citaId,
    nombre: `Anticipo — ${servicio.nombre}`,
    monto: servicio.anticipo_requerido,
  });

  const { error: pagoError } = await supabase.from("pagos").insert({
    cita_id: citaId,
    monto: servicio.anticipo_requerido,
    metodo: "mercadopago",
    mp_payment_id: preferenceId,
    estado: "pendiente",
  });

  if (pagoError) {
    return { error: "No se pudo registrar el intento de pago." };
  }

  redirect(initPoint);
}
