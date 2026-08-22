import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { ReservaWizard } from "@/components/reservar/ReservaWizard";

export const metadata: Metadata = {
  title: "Agendar cita | Dra. Maggie Morales",
};

export default async function ReservarPage() {
  const sesion = await requireRole("paciente");

  const supabase = await createClient();
  const [{ data: servicios }, { data: paciente }] = await Promise.all([
    supabase
      .from("servicios")
      .select("id, nombre, precio, anticipo_requerido, duracion_minutos")
      .eq("activo", true)
      .order("nombre"),
    supabase.from("pacientes").select("id").eq("user_id", sesion.userId).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Reserva tu cita
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
        Agenda tu valoración
      </h1>
      <p className="mt-3 text-sm text-carbon/60">
        Elige un tratamiento, la fecha y el horario que mejor te acomode.
      </p>

      <div className="mt-10">
        <ReservaWizard
          servicios={servicios ?? []}
          requierePerfilPaciente={!paciente}
          emailSesion={sesion.email}
        />
      </div>
    </div>
  );
}
