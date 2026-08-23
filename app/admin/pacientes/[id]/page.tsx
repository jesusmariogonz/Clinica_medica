import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { obtenerOCrearExpedienteAction } from "@/lib/expedientes/actions";
import { DocumentosSection } from "@/components/admin/DocumentosSection";
import { ConsentimientosSection } from "@/components/admin/ConsentimientosSection";
import { ProximaCitaSugerida } from "@/components/admin/ProximaCitaSugerida";

export const metadata: Metadata = {
  title: "Expediente | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("medico");
  const { id: pacienteId } = await params;

  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, telefono, email")
    .eq("id", pacienteId)
    .single();

  if (!paciente) notFound();

  const expedienteId = await obtenerOCrearExpedienteAction(pacienteId);

  const [{ data: expediente }, { data: notas }, { data: documentos }, { data: consentimientos }, { data: citas }] =
    await Promise.all([
      expedienteId
        ? supabase
            .from("expedientes_clinicos")
            .select("id, antecedentes_heredofamiliares, antecedentes_patologicos, antecedentes_no_patologicos, proxima_cita_sugerida, proxima_cita_nota")
            .eq("id", expedienteId)
            .single()
        : Promise.resolve({ data: null }),
      expedienteId
        ? supabase
            .from("notas_clinicas")
            .select("id, firmada")
            .eq("expediente_id", expedienteId)
        : Promise.resolve({ data: [] }),
      supabase
        .from("documentos")
        .select("id, tipo, descripcion, storage_path, subido_en")
        .eq("paciente_id", pacienteId)
        .order("subido_en", { ascending: false }),
      supabase
        .from("consentimientos")
        .select("id, tipo, firmado_en")
        .eq("paciente_id", pacienteId)
        .order("id"),
      supabase
        .from("citas")
        .select("id, fecha_hora, estado, servicios(nombre)")
        .eq("paciente_id", pacienteId)
        .gte("fecha_hora", new Date().toISOString())
        .order("fecha_hora"),
    ]);

  const notasFirmadas = (notas ?? []).filter((n) => n.firmada).length;
  const notasSinFirmar = (notas ?? []).length - notasFirmadas;
  const antecedentesCapturados = !!(
    expediente?.antecedentes_heredofamiliares ||
    expediente?.antecedentes_patologicos ||
    expediente?.antecedentes_no_patologicos
  );
  const consentimientosPendientes = (consentimientos ?? []).filter((c) => !c.firmado_en).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <Link href="/admin/pacientes" className="text-xs font-medium text-rosa-fuerte">
        ← Todos los pacientes
      </Link>
      <span className="mt-3 block text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Expediente clínico
      </span>
      <h1 className="mt-1 font-serif text-3xl text-carbon">
        {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno ?? ""}
      </h1>
      <p className="mt-2 text-sm text-carbon/60">
        Nacimiento: {new Date(`${paciente.fecha_nacimiento}T00:00:00`).toLocaleDateString("es-MX")}
        {paciente.telefono && ` · ${paciente.telefono}`}
        {paciente.email && ` · ${paciente.email}`}
      </p>

      {/* Resumen */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4 text-center">
          <p className="font-serif text-xl text-carbon">{antecedentesCapturados ? "Sí" : "No"}</p>
          <p className="text-xs text-carbon/50">Antecedentes</p>
        </div>
        <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4 text-center">
          <p className="font-serif text-xl text-carbon">{notasFirmadas}/{(notas ?? []).length}</p>
          <p className="text-xs text-carbon/50">Notas firmadas</p>
        </div>
        <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4 text-center">
          <p className="font-serif text-xl text-carbon">{(documentos ?? []).length}</p>
          <p className="text-xs text-carbon/50">Documentos</p>
        </div>
        <div className="rounded-2xl border border-carbon/10 bg-white/50 p-4 text-center">
          <p className="font-serif text-xl text-carbon">{consentimientosPendientes}</p>
          <p className="text-xs text-carbon/50">Consent. pendientes</p>
        </div>
      </div>

      {notasSinFirmar > 0 && (
        <p className="mt-3 text-xs text-rosa-fuerte">
          Tienes {notasSinFirmar} nota{notasSinFirmar > 1 ? "s" : ""} sin firmar.
        </p>
      )}

      {/* Accesos a pantallas dedicadas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/admin/pacientes/${pacienteId}/antecedentes`}
          className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-5 hover:border-rosa-fuerte"
        >
          <p className="font-serif text-lg text-carbon">Antecedentes</p>
          <p className="mt-1 text-sm text-carbon/60">Heredofamiliares, patológicos y no patológicos.</p>
        </Link>
        <Link
          href={`/admin/pacientes/${pacienteId}/notas`}
          className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-5 hover:border-rosa-fuerte"
        >
          <p className="font-serif text-lg text-carbon">Notas de evolución</p>
          <p className="mt-1 text-sm text-carbon/60">Historial de consultas y captura de nuevas notas.</p>
        </Link>
      </div>

      {/* Próximas citas */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Próximas citas</h2>
        <div className="mt-4 space-y-2">
          {(citas ?? []).length === 0 && (
            <p className="text-sm text-carbon/40">Sin citas agendadas.</p>
          )}
          {(citas ?? []).map((c) => {
            const servicio = c.servicios as unknown as { nombre: string } | null;
            return (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-carbon">{servicio?.nombre}</p>
                  <p className="text-carbon/50 capitalize">{c.estado}</p>
                </div>
                <p className="text-carbon">
                  {new Date(c.fecha_hora).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Próxima cita sugerida */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Próxima cita sugerida</h2>
        <p className="mt-1 text-sm text-carbon/60">
          Recomienda una fecha para el siguiente tratamiento (refuerzo, seguimiento, etc.).
        </p>
        <div className="mt-4">
          {expedienteId && (
            <ProximaCitaSugerida
              expedienteId={expedienteId}
              pacienteId={pacienteId}
              fechaSugerida={expediente?.proxima_cita_sugerida ?? null}
              notaSugerida={expediente?.proxima_cita_nota ?? null}
            />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Documentos y fotos</h2>
        <div className="mt-5">
          <DocumentosSection pacienteId={pacienteId} documentos={documentos ?? []} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-carbon">Consentimientos</h2>
        <p className="mt-1 text-sm text-carbon/60">
          El paciente firma desde su propio portal; aquí solo se solicitan.
        </p>
        <div className="mt-5">
          <ConsentimientosSection pacienteId={pacienteId} consentimientos={consentimientos ?? []} />
        </div>
      </section>
    </div>
  );
}
