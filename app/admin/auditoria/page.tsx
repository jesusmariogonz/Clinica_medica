import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bitácora de auditoría | Panel médico",
};

export const dynamic = "force-dynamic";

export default async function AuditoriaPage() {
  await requireRole("medico");

  const supabase = await createClient();
  const { data: registros } = await supabase
    .from("bitacora_auditoria")
    .select("id, usuario_id, accion, entidad_afectada, entidad_id, timestamp, ip")
    .order("timestamp", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Panel médico
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Bitácora de auditoría</h1>
      <p className="mt-3 text-sm text-carbon/60">
        Registro de solo lectura, append-only conforme a NOM-024-SSA3-2012.
        Muestra los últimos 200 eventos.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-carbon/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-arena/50 text-xs uppercase tracking-wide text-carbon/50">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Entidad</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {(registros ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-carbon/40">
                  Sin eventos registrados.
                </td>
              </tr>
            )}
            {(registros ?? []).map((r) => (
              <tr key={r.id} className="border-t border-carbon/5">
                <td className="px-4 py-3 text-carbon/70">
                  {new Date(r.timestamp).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
                <td className="px-4 py-3 text-carbon">{r.accion}</td>
                <td className="px-4 py-3 text-carbon/70">
                  {r.entidad_afectada}
                  {r.entidad_id && <span className="text-carbon/40"> · {r.entidad_id.slice(0, 8)}</span>}
                </td>
                <td className="px-4 py-3 text-carbon/50">{r.usuario_id?.slice(0, 8) ?? "—"}</td>
                <td className="px-4 py-3 text-carbon/50">{r.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
