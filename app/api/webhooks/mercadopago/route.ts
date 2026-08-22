import { NextResponse, type NextRequest } from "next/server";
import { mpHabilitado } from "@/lib/mercadopago/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Webhook de Mercado Pago. Queda inactivo mientras NEXT_PUBLIC_MP_ENABLED
// esté apagado. Cuando se active con credenciales reales, falta agregar
// la verificación de firma x-signature/x-request-id documentada en
// https://www.mercadopago.com.mx/developers/es/docs/checkout-api/webhooks —
// por ahora solo valida que el pago exista y consulta su estado real a la
// API antes de aprobar nada.
export async function POST(request: NextRequest) {
  if (!mpHabilitado()) {
    return NextResponse.json({ error: "Mercado Pago no está habilitado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id;

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  // Nunca confiar en el estado que venga en el body del webhook: siempre
  // reconsultar el pago directamente a la API de Mercado Pago.
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  if (!res.ok) {
    return NextResponse.json({ received: true });
  }

  const pago = await res.json();
  const citaId: string | undefined = pago?.metadata?.cita_id;

  if (pago.status === "approved" && citaId) {
    const supabase = createServiceRoleClient();

    await supabase
      .from("pagos")
      .update({ estado: "aprobado" })
      .eq("mp_payment_id", String(pago.preference_id ?? paymentId));

    await supabase
      .from("citas")
      .update({ anticipo_pagado: true, estado: "confirmada" })
      .eq("id", citaId);

    await supabase.rpc("log_auditoria", {
      p_accion: "pago_confirmado_mercadopago",
      p_entidad_afectada: "citas",
      p_entidad_id: citaId,
      p_ip: null,
    });
  }

  return NextResponse.json({ received: true });
}
