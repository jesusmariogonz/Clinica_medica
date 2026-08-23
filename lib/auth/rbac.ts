import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

export interface SesionActual {
  userId: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
}

// Obtiene la sesión + perfil (rol) del usuario actual desde un Server
// Component o Server Action. El middleware ya filtra el acceso por ruta;
// este helper es la segunda capa de defensa a nivel de código.
export async function getSesionActual(): Promise<SesionActual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("users")
    .select("role, mfa_enabled, email")
    .eq("id", user.id)
    .single();

  if (!perfil) return null;

  return {
    userId: user.id,
    email: perfil.email,
    role: perfil.role,
    mfaEnabled: perfil.mfa_enabled,
  };
}

// Exige un rol específico; redirige a login o a home si no cumple.
// Usar al inicio de páginas/server actions sensibles (expediente, agenda,
// pagos) como defensa adicional a las políticas RLS de Postgres.
export async function requireRole(...rolesPermitidos: UserRole[]): Promise<SesionActual> {
  const sesion = await getSesionActual();

  if (!sesion) {
    redirect("/login");
  }

  if (!rolesPermitidos.includes(sesion.role)) {
    console.error(
      `[requireRole] Acceso denegado: userId=${sesion.userId} role="${sesion.role}" permitidos=${JSON.stringify(rolesPermitidos)}`
    );
    redirect("/");
  }

  if (sesion.role === "medico" && !sesion.mfaEnabled) {
    redirect("/mfa?obligatorio=1");
  }

  return sesion;
}
