"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/src/actions/taskActions";

interface Category {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981",
  "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#78716c",
];

export default function CategoriesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (!user?.id) return;
    getCategories().then(setCategories).catch(console.error);
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No autenticado</h1>
          <a href="/login" className="text-primary underline">Iniciar sesión</a>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    setEditing(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        if (editing) {
          const updated = await updateCategory(editing.id, { name: name.trim(), color });
          setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } else {
          const created = await createCategory(name.trim(), color);
          setCategories((prev) => [...prev, created]);
        }
        resetForm();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Las tareas asociadas quedarán sin categoría.")) return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Categorías</h1>

      <div className="card bg-base-100 shadow-xl border border-base-300 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Editar categoría" : "Nueva categoría"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            className="input input-bordered w-full bg-base-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? "border-base-content scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isPending || !name.trim()}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : editing ? (
                "Guardar"
              ) : (
                "Agregar"
              )}
            </button>
            {editing && (
              <button className="btn btn-ghost" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {categories.length === 0 && (
          <p className="text-base-content/50 text-center py-8">
            No hay categorías todavía.
          </p>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between card bg-base-100 border border-base-300 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium">{cat.name}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleEdit(cat)}
              >
                ✏️
              </button>
              <button
                className="btn btn-ghost btn-sm text-error"
                onClick={() => handleDelete(cat.id)}
                disabled={isPending}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
