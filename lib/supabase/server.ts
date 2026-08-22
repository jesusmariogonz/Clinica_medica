import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// Cliente para Server Components / Server Actions: respeta RLS con el JWT
// del usuario autenticado (nunca usa la service_role key).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se puede ignorar si setAll se llama desde un Server Component;
            // el middleware ya refresca la sesión en cada request.
          }
        },
      },
    }
  );
}

// Cliente administrativo con service_role: bypassa RLS. Solo debe usarse en
// server actions/route handlers muy específicos (webhooks de pago, envío
// de URLs firmadas, escritura en bitacora_auditoria) y NUNCA exponerse al
// cliente ni importarse desde código que corra en el navegador.
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op: el cliente service_role no maneja sesión de usuario.
        },
      },
    }
  );
}
