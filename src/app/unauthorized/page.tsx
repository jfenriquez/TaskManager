import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 flex items-center justify-center p-4 text-base-content">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body text-center">
          <div className="avatar placeholder mb-6">
            <div className="bg-warning text-warning-content rounded-full w-20">
              <span className="text-3xl">🚫</span>
            </div>
          </div>
          <h2 className="card-title text-3xl font-bold justify-center mb-2">
            Acceso Denegado
          </h2>
          <p className="text-base-content/60 mb-6">
            No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta al administrador.
          </p>
          <Link href="/" className="btn btn-primary w-full">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
