import { requireRole } from "@/lib/auth/rbac";
import { signOutAction } from "@/lib/auth/actions";

export default async function PortalPage() {
  const sesion = await requireRole("paciente");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Portal del paciente
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Hola, {sesion.email}</h1>
      <p className="mt-3 text-sm text-carbon/60">
        Tus citas, documentos y consentimientos pendientes aparecerán aquí
        (módulo 7).
      </p>

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
