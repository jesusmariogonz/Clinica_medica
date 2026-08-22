// Integración de Mercado Pago — queda detrás de un feature flag hasta que
// la clínica tenga credenciales reales (NEXT_PUBLIC_MP_ENABLED=true y
// MP_ACCESS_TOKEN configurados). La UI de pago oculta esta opción por
// completo mientras el flag esté apagado.

export function mpHabilitado(): boolean {
  return process.env.NEXT_PUBLIC_MP_ENABLED === "true" && !!process.env.MP_ACCESS_TOKEN;
}

interface CrearPreferenciaParams {
  citaId: string;
  nombre: string;
  monto: number;
}

interface PreferenciaResult {
  initPoint: string;
  preferenceId: string;
}

// Crea una preferencia de pago vía la API REST de Mercado Pago
// (https://api.mercadopago.com/checkout/preferences). No usa el SDK
// oficial para mantener esta integración ligera y opcional; si el
// consultorio adopta Mercado Pago de forma definitiva, migrar al SDK
// `mercadopago` npm es la mejora natural.
export async function crearPreferenciaMercadoPago(
  params: CrearPreferenciaParams
): Promise<PreferenciaResult> {
  if (!mpHabilitado()) {
    throw new Error("Mercado Pago no está habilitado.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: params.nombre,
          quantity: 1,
          currency_id: "MXN",
          unit_price: params.monto,
        },
      ],
      metadata: { cita_id: params.citaId },
      back_urls: {
        success: `${siteUrl}/portal?pago=exitoso`,
        failure: `${siteUrl}/portal?pago=cancelado`,
        pending: `${siteUrl}/portal?pago=pendiente`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error creando preferencia de Mercado Pago: ${res.status}`);
  }

  const data = await res.json();
  return { initPoint: data.init_point, preferenceId: data.id };
}
