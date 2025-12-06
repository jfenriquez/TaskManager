// app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      // Leer token desde la URL del cliente para evitar usar useSearchParams (genera CSR bailout en build)
      const token =
        typeof window !== "undefined"
          ? new URL(window.location.href).searchParams.get("token")
          : null;

      if (!token) {
        setStatus("error");
        return;
      }

      try {
        // Enviar token como query parameter
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body text-center">
          {status === "verifying" && (
            <>
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <h2 className="text-2xl font-bold mt-4">
                Verificando tu email...
              </h2>
              <p className="text-base-content/60">
                Por favor espera un momento
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-success">
                ¡Email verificado!
              </h2>
              <p className="text-base-content/60 mt-2">
                Tu cuenta ha sido activada exitosamente
              </p>
              <div className="mt-4">
                <progress
                  className="progress progress-success w-56"
                  value="100"
                  max="100"
                ></progress>
              </div>
              <p className="text-sm text-base-content/50 mt-2">
                Redirigiendo al login...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-error">
                Error de verificación
              </h2>
              <div className="alert alert-error mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>El enlace es inválido o ha expirado</span>
              </div>
              <div className="card-actions justify-center mt-6">
                <a href="/register" className="btn btn-primary">
                  Registrarse de nuevo
                </a>
                <a href="/login" className="btn btn-ghost">
                  Ir al login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
