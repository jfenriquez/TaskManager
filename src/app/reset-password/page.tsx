"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!token) {
      setError("Token inválido o expirado");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("El enlace es inválido o ha expirado. Solicita uno nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card-body text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-error">Enlace inválido</h2>
        <p className="text-base-content/60 mt-2">El enlace no contiene un token válido.</p>
        <a href="/forgot-password" className="btn btn-primary mt-6">Solicitar nuevo enlace</a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card-body text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-success">Contraseña actualizada</h2>
        <p className="text-base-content/60 mt-2">Tu contraseña se ha restablecido correctamente.</p>
        <a href="/login" className="btn btn-primary mt-6">Iniciar sesión</a>
      </div>
    );
  }

  return (
    <div className="card-body p-8">
      <h2 className="card-title text-3xl font-bold justify-center">Nueva contraseña</h2>
      <p className="text-base-content/60 text-center mt-2 mb-6">Ingresa tu nueva contraseña.</p>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Nueva contraseña</span></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Confirmar contraseña</span></label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="input input-bordered w-full"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? (
            <><span className="loading loading-spinner"></span> Restableciendo...</>
          ) : (
            "Restablecer contraseña"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <Suspense fallback={
          <div className="card-body text-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
