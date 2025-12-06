// src/app/admin/page.tsx
"use client";

import { useAuth } from "@/src/hooks/useAuth";

export default function AdminPage() {
  const { user, isLoading, isAdmin, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No autenticado</h1>
          <p>Por favor inicia sesión para acceder a esta página</p>
          <a href="/login" className="text-blue-500 underline mt-4 block">
            Ir a login
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p>No tienes permisos de administrador</p>
          <p className="text-sm text-gray-600 mt-2">
            Tu rol actual: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
        <div className="space-y-2">
          <p>
            <strong>Nombre:</strong> {user?.name || "No especificado"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Rol:</strong> {user?.role}
          </p>
          <p>
            <strong>ID:</strong> {user?.id}
          </p>
        </div>
      </div>
    </div>
  );
}
