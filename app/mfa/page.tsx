"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Estado =
  | { paso: "cargando" }
  | { paso: "enroll"; factorId: string; qrCode: string; secret: string }
  | { paso: "challenge"; factorId: string }
  | { paso: "error"; mensaje: string };

export default function MfaPage() {
  return (
    <Suspense fallback={null}>
      <MfaFlow />
    </Suspense>
  );
}

function MfaFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const obligatorio = searchParams.get("obligatorio") === "1";

  const [estado, setEstado] = useState<Estado>({ paso: "cargando" });
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const { data: factores, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        setEstado({ paso: "error", mensaje: listError.message });
        return;
      }

      const factorVerificado = factores?.totp.find((f) => f.status === "verified");
      if (factorVerificado) {
        setEstado({ paso: "challenge", factorId: factorVerificado.id });
        return;
      }

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (enrollError || !enrollData) {
        setEstado({ paso: "error", mensaje: enrollError?.message ?? "No se pudo iniciar el registro de 2FA." });
        return;
      }

      setEstado({
        paso: "enroll",
        factorId: enrollData.id,
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
      });
    })();
  }, []);

  const verificarCodigo = async (factorId: string) => {
    setVerificando(true);
    setError(null);

    const supabase = createClient();
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challengeData) {
      setError(challengeError?.message ?? "No se pudo generar el reto de verificación.");
      setVerificando(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: codigo,
    });

    if (verifyError) {
      setError("Código incorrecto. Intenta de nuevo.");
      setVerificando(false);
      return;
    }

    // Marca mfa_enabled=true en el perfil vía función administrativa
    // (self-service, solo toca la propia fila). Es idempotente si ya
    // estaba habilitado.
    await supabase.rpc("set_mfa_enabled", { p_enabled: true });

    router.replace("/admin");
    router.refresh();
  };

  if (estado.paso === "cargando") {
    return <MfaShell><p className="text-sm text-carbon/60">Cargando...</p></MfaShell>;
  }

  if (estado.paso === "error") {
    return (
      <MfaShell>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{estado.mensaje}</p>
      </MfaShell>
    );
  }

  return (
    <MfaShell>
      {obligatorio && (
        <p className="mb-6 rounded-xl bg-apoyo/10 px-4 py-3 text-sm text-carbon/80">
          El rol médico requiere verificación en dos pasos para acceder al
          expediente clínico, conforme a NOM-024-SSA3-2012.
        </p>
      )}

      {estado.paso === "enroll" && (
        <>
          <p className="text-sm text-carbon/70">
            Escanea este código QR con tu app de autenticación (Google
            Authenticator, Authy, 1Password, etc.).
          </p>
          <div
            className="my-6 flex justify-center rounded-2xl bg-white p-6"
            dangerouslySetInnerHTML={{ __html: estado.qrCode }}
          />
          <p className="text-center text-xs text-carbon/40">
            ¿No puedes escanear? Ingresa esta clave manualmente:
            <br />
            <code className="mt-1 inline-block rounded bg-arena px-2 py-1 text-carbon/70">
              {estado.secret}
            </code>
          </p>
        </>
      )}

      {estado.paso === "challenge" && (
        <p className="text-sm text-carbon/70">
          Ingresa el código de 6 dígitos de tu app de autenticación.
        </p>
      )}

      <div className="mt-6">
        <label htmlFor="codigo" className="text-sm font-medium text-carbon">
          Código de verificación
        </label>
        <input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          maxLength={6}
          className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-carbon outline-none focus:border-rosa-fuerte"
          placeholder="000000"
        />

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="button"
          disabled={codigo.length !== 6 || verificando}
          onClick={() => verificarCodigo(estado.factorId)}
          className="mt-5 w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa disabled:opacity-60"
        >
          {verificando ? "Verificando..." : "Verificar"}
        </button>
      </div>
    </MfaShell>
  );
}

function MfaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 sm:px-10">
      <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
        Verificación en dos pasos
      </span>
      <h1 className="mt-3 font-serif text-3xl text-carbon">Autenticación 2FA</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}
