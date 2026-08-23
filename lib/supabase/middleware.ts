import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

const RUTAS_MEDICO = ["/admin"];
const RUTAS_ASISTENTE = ["/asistente"];
const RUTAS_PACIENTE = ["/portal", "/reservar"];
const RUTAS_AUTH = ["/login", "/registro"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const esRutaMedico = RUTAS_MEDICO.some((r) => pathname.startsWith(r));
  const esRutaAsistente = RUTAS_ASISTENTE.some((r) => pathname.startsWith(r));
  const esRutaPaciente = RUTAS_PACIENTE.some((r) => pathname.startsWith(r));
  const esRutaProtegida = esRutaMedico || esRutaAsistente || esRutaPaciente;
  const esRutaAuth = RUTAS_AUTH.some((r) => pathname.startsWith(r));

  if (!user && esRutaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && esRutaAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user && esRutaProtegida) {
    const { data: perfil, error: perfilError } = await supabase
      .from("users")
      .select("role, mfa_enabled")
      .eq("id", user.id)
      .single();

    const role = perfil?.role;

    console.error(
      `[proxy] pathname=${pathname} userId=${user.id} role=${JSON.stringify(role)} perfilError=${perfilError?.message ?? "null"}`
    );

    if (esRutaMedico && role !== "medico") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (esRutaAsistente && role !== "asistente") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (esRutaPaciente && role !== "paciente") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // El rol médico debe tener 2FA activo para acceder al panel clínico
    // (expedientes, notas). Si no lo tiene, se le fuerza a inscribirlo.
    if (esRutaMedico && role === "medico" && !perfil?.mfa_enabled) {
      const url = request.nextUrl.clone();
      url.pathname = "/mfa";
      url.searchParams.set("obligatorio", "1");
      return NextResponse.redirect(url);
    }

    // Verificación adicional: el AAL (Authenticator Assurance Level) de la
    // sesión debe ser aal2 para rutas médicas, incluso si mfa_enabled=true
    // en la tabla, para exigir el challenge TOTP en cada inicio de sesión.
    if (esRutaMedico) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.currentLevel !== "aal2" && aalData.nextLevel === "aal2") {
        const url = request.nextUrl.clone();
        url.pathname = "/mfa";
        url.searchParams.set("challenge", "1");
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
