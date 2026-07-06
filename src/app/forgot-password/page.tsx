"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al enviar el correo");
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Error al enviar el correo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setResendMsg("success");
    } catch {
      setResendMsg("error");
    } finally {
      setResending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body text-center p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold">Revisa tu email</h2>
            <p className="text-base-content/60 mt-2">
              Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
            </p>

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
              <a href="/login" className="btn btn-primary">Volver al login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          <h2 className="card-title text-3xl font-bold justify-center">¿Olvidaste tu contraseña?</h2>
          <p className="text-base-content/60 text-center mt-2 mb-6">
            Ingresa tu email y te enviaremos un enlace para restablecerla.
          </p>

          {error && (
            <div className="alert alert-error mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="input input-bordered w-full"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <><span className="loading loading-spinner"></span> Enviando...</>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="link link-primary text-sm">Volver al login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
