"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error: string | null;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).",
      };
    }
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect(next || "/");
}

// Envía un correo con un enlace para restablecer la contraseña. Por
// seguridad, siempre responde igual exista o no la cuenta (no revela si
// un correo está registrado).
export async function solicitarRecuperacionAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/actualizar-password`,
  });

  return { error: null };
}

// Establece la nueva contraseña. Se llama después de que el usuario entra
// desde el enlace del correo de recuperación, momento en el que Supabase
// ya estableció una sesión temporal de recuperación en el cliente.
export async function actualizarPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo actualizar la contraseña. Solicita un nuevo enlace." };
  }

  redirect("/login?actualizada=1");
}

// Autoregistro: únicamente crea cuentas con rol `paciente` (default en la
// tabla users vía trigger). Los roles médico/asistente se asignan
// manualmente por el médico desde el panel administrativo.
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?registrado=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
