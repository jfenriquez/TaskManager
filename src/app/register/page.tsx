"use client";

import { authClient } from "@/src/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const result = await authClient.signUp.email({
        email,
        password: formData.get("password") as string,
        name: formData.get("name") as string,
      });

      if (result.error) {
        setError(result.error.message || "Error al registrarse");
        return;
      }

      setRegisteredEmail(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      if (!res.ok) throw new Error("Error al reenviar");
      setResendMsg("success");
    } catch {
      setResendMsg("error");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body text-center p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold">Revisa tu email</h2>
            <p className="text-base-content/60 mt-4">
              Te enviamos un enlace de verificación a <strong>{registeredEmail}</strong>.
            </p>
            <p className="text-sm text-base-content/40 mt-2">Si no lo encuentras, revisa la carpeta de spam.</p>

            {resendMsg === "success" && (
              <div className="alert alert-success mt-4 text-sm">Email reenviado correctamente</div>
            )}
            {resendMsg === "error" && (
              <div className="alert alert-error mt-4 text-sm">Error al reenviar el email. Intenta de nuevo.</div>
            )}

            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={handleResend} className="btn btn-outline" disabled={resending}>
                {resending ? <span className="loading loading-spinner loading-sm"></span> : "Reenviar email"}
              </button>
              <a href="/login" className="btn btn-primary">Ir al login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          <h2 className="card-title text-3xl font-bold justify-center">Crear Cuenta</h2>

          {error && <div className="alert alert-error mt-4 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre</span>
              </label>
              <input type="text" name="name" placeholder="Tu nombre" required className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" name="email" placeholder="tu@email.com" required className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input type="password" name="password" placeholder="••••••••" required className="input input-bordered w-full" />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="loading loading-spinner"></span> Registrando...</> : "Registrarse"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-base-content/60">
              ¿Ya tienes cuenta? <a href="/login" className="link link-primary font-semibold">Inicia sesión</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
