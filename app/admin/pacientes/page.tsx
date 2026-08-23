import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { NuevoPacienteForm } from "@/components/admin/NuevoPacienteForm";

export const metadata: Metadata = {
  title: "Pacientes | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  await requireRole("medico");

  const supabase = await createClient();
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nombre, apellido_paterno, apellido_materno, telefono, email, creado_en")
    .order("creado_en", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
            Panel médico
          </span>
          <h1 className="mt-3 font-serif text-3xl text-carbon">Pacientes</h1>
        </div>
        <NuevoPacienteForm />
      </div>

      <div className="mt-8 space-y-2">
        {(pacientes ?? []).length === 0 && (
          <p className="text-sm text-carbon/40">Sin pacientes registrados.</p>
        )}
        {(pacientes ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/pacientes/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-transparent bg-white/50 px-4 py-3 text-sm hover:border-rosa-suave"
          >
            <div>
              <p className="font-medium text-carbon">
                {p.nombre} {p.apellido_paterno} {p.apellido_materno ?? ""}
              </p>
              <p className="text-xs text-carbon/50">{p.email ?? p.telefono ?? "Sin contacto"}</p>
            </div>
            <span className="text-carbon/30">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
