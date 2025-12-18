"use client";

import { authClient } from "@/src/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Animación de entrada con GSAP
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".form-element", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.from(".social-btn", {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await authClient.signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    } catch {
      setError("Error al iniciar sesión. Verifica tus credenciales.");

      // Animación de shake en caso de error (usar repeat + yoyo en lugar de array para compatibilidad de tipos)
      gsap.to(formRef.current, {
        x: -10,
        duration: 0.05,
        ease: "power2.inOut",
        repeat: 4,
        yoyo: true,
        // asegurar que termine en 0
        onComplete: () => {
          gsap.to(formRef.current, { x: 0, duration: 0.05 });
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.social({
        provider,
      });
    } catch {
      setError(
        `Error al iniciar sesión con ${
          provider === "github" ? "GitHub" : "Google"
        }.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 flex items-center justify-center p-4 text-base-content">
      <div
        ref={containerRef}
        className="card w-full max-w-md bg-base-100 shadow-2xl"
      >
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6 form-element">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-2xl">🔐</span>
              </div>
            </div>
            <h2 className="card-title text-3xl font-bold justify-center">
              Bienvenido
            </h2>
            <p className="text-base-content/60 mt-2">
              Inicia sesión para continuar
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error form-element">
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
              <span>{error}</span>
            </div>
          )}

          {/* Email Login Form */}
          <form ref={formRef} onSubmit={handleEmailLogin} className="space-y-4">
            <div className="form-control form-element">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                className="input input-bordered w-full focus:input-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control form-element">
              <label className="label">
                <span className="label-text font-medium">Contraseña</span>
                <a href="#" className="label-text-alt link link-hover">
                  ¿Olvidaste tu contraseña?
                </a>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:input-primary"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control form-element">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <span className="label-text">Recordarme</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full form-element"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider form-element">O continúa con</div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin("github")}
              className="btn btn-outline w-full gap-2 social-btn hover:bg-base-300"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continuar con GitHub
            </button>

            <button
              onClick={() => handleSocialLogin("google")}
              className="btn btn-outline w-full gap-2 social-btn hover:bg-base-300"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6 form-element">
            <p className="text-sm text-base-content/60">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="link link-primary font-semibold">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
