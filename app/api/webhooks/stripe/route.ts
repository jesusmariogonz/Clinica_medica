import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Webhook de Stripe: confirma pagos de anticipo y actualiza la cita.
// Usa el cliente service_role porque no hay sesión de usuario en un
// webhook — la autenticidad de la petición se garantiza verificando la
// firma con STRIPE_WEBHOOK_SECRET, no con RLS.
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta firma de Stripe." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: { cita_id?: string } };
    const citaId = session.metadata?.cita_id;

    const { data: pago } = await supabase
      .from("pagos")
      .update({ estado: "aprobado" })
      .eq("stripe_payment_id", session.id)
      .select("cita_id")
      .single();

    const citaIdResuelto = pago?.cita_id ?? citaId;

    if (citaIdResuelto) {
      await supabase
        .from("citas")
        .update({ anticipo_pagado: true, estado: "confirmada" })
        .eq("id", citaIdResuelto);

      await supabase.rpc("log_auditoria", {
        p_accion: "pago_confirmado_stripe",
        p_entidad_afectada: "citas",
        p_entidad_id: citaIdResuelto,
        p_ip: null,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as { id: string };
    await supabase
      .from("pagos")
      .update({ estado: "rechazado" })
      .eq("stripe_payment_id", session.id);
  }

  return NextResponse.json({ received: true });
}
