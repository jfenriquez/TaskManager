// app/register/page.tsx
"use client";

import { authClient } from "@/src/lib/auth-client";

export default function RegisterPage() {
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await authClient.signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          <h2 className="card-title text-3xl font-bold text-center text-base-content">
            Crear Cuenta
          </h2>

          <form onSubmit={handleRegister} className="space-y-6 mt-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Nombre</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Tu nombre"
                required
                className="input input-bordered input-lg w-full text-base-content placeholder:text-base-content/70 focus:input-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                required
                className="input input-bordered input-lg w-full text-base-content placeholder:text-base-content/70 focus:input-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Contraseña</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="input input-bordered input-lg w-full text-base-content placeholder:text-base-content/70 focus:input-primary"
              />
            </div>

            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full text-base-100"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
