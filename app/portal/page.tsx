import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { mpHabilitado } from "@/lib/mercadopago/client";
import { PagoAnticipoButton } from "@/components/portal/PagoAnticipoButton";
import { DocumentosPropios } from "@/components/portal/DocumentosPropios";
import { ConsentimientosPendientes } from "@/components/portal/ConsentimientosPendientes";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const sesion = await requireRole("paciente");

  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id")
    .eq("user_id", sesion.userId)
    .maybeSingle();

  const [{ data: citas }, { data: documentos }, { data: consentimientosPendientes }] = await Promise.all([
    paciente
      ? supabase
          .from("citas")
          .select("id, fecha_hora, estado, requiere_anticipo, anticipo_pagado, servicios(nombre)")
          .eq("paciente_id", paciente.id)
          .order("fecha_hora", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
    paciente
      ? supabase
          .from("documentos")
          .select("id, tipo, descripcion, subido_en")
          .eq("paciente_id", paciente.id)
          .order("subido_en", { ascending: false })
      : Promise.resolve({ data: [] }),
    paciente
      ? supabase
          .from("consentimientos")
          .select("id, tipo, texto_version")
          .eq("paciente_id", paciente.id)
          .is("firmado_en", null)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Portal del paciente
      </span>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-carbon">Hola, {sesion.email}</h1>
        <Link
          href="/reservar"
          prefetch={false}
          className="rounded-full bg-rosa-fuerte px-5 py-2 text-sm font-medium text-white hover:bg-rosa"
        >
          Agendar nueva cita
        </Link>
      </div>

      {(consentimientosPendientes ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-carbon">Consentimientos pendientes</h2>
          <div className="mt-5">
            <ConsentimientosPendientes consentimientos={consentimientosPendientes ?? []} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Tus citas</h2>
        <div className="mt-5 space-y-2">
          {(citas ?? []).length === 0 && (
            <p className="text-sm text-carbon/40">Aún no tienes citas registradas.</p>
          )}
          {(citas ?? []).map((c) => {
            const servicio = c.servicios as unknown as { nombre: string } | null;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-carbon">{servicio?.nombre}</p>
                  <p className="text-carbon/50">
                    {new Date(c.fecha_hora).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right text-xs text-carbon/50">
                  <p className="capitalize">{c.estado}</p>
                  {c.requiere_anticipo && !c.anticipo_pagado && (
                    <>
                      <p className="text-rosa-fuerte">Anticipo pendiente</p>
                      <PagoAnticipoButton citaId={c.id} mpDisponible={mpHabilitado()} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Tus documentos</h2>
        <div className="mt-5">
          <DocumentosPropios documentos={documentos ?? []} />
        </div>
      </section>

      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-carbon/20 px-5 py-2 text-sm font-medium text-carbon hover:bg-carbon/5"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
