import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { signOutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sesion = await requireRole("medico");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Panel médico
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Hola, {sesion.email}</h1>
      <p className="mt-3 text-sm text-carbon/60">2FA activo.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/agenda"
          className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-5 hover:border-rosa-fuerte"
        >
          <p className="font-serif text-lg text-carbon">Agenda</p>
          <p className="mt-1 text-sm text-carbon/60">
            Calendario de citas y próximas consultas.
          </p>
        </Link>
        <Link
          href="/admin/pacientes"
          className="rounded-2xl border border-rosa-suave/50 bg-white/50 p-5 hover:border-rosa-fuerte"
        >
          <p className="font-serif text-lg text-carbon">Pacientes</p>
          <p className="mt-1 text-sm text-carbon/60">
            Expediente clínico, notas de evolución y documentos.
          </p>
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-carbon/20 px-5 py-2 text-sm font-medium text-carbon hover:bg-carbon/5"
          >
            Cerrar sesión
          </button>
        </form>
        <Link href="/admin/auditoria" className="text-xs text-carbon/40 hover:text-carbon/60">
          Bitácora de auditoría
        </Link>
      </div>
    </div>
  );
}
