// components/TaskModal.tsx

import React from "react";
import { FaPlus, FaCheck } from "react-icons/fa";
import { Task, NewTaskForm } from "../../types/task.types";

interface CategoryOption {
  id: string;
  name: string;
  color: string;
}

interface TaskModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  task: NewTaskForm | Task;
  categories?: CategoryOption[];
  isPending?: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string | number | null) => void;
}

export default function TaskModal({
  isOpen,
  mode,
  task,
  categories,
  isPending = false,
  onClose,
  onSave,
  onChange,
}: TaskModalProps) {
  if (!isOpen) return null;

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Tarea" : "Nueva Tarea";

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 transition-colors duration-200">
        <h3 className="font-bold text-2xl mb-4 text-primary">{title}</h3>
        <div className="space-y-4">
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold text-base-content">
                Título
              </span>
            </label>
            <input
              type="text"
              placeholder="Ej: Recoger la basura"
              className="input input-bordered w-full bg-base-200 text-base-content "
              value={task.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold text-base-content">
                Descripción {!isEditMode && "(opcional)"}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 w-full bg-base-200 text-base-content"
              placeholder="Detalles..."
              value={task.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
            ></textarea>
          </div>
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold text-base-content">
                Duración (minutos) {!isEditMode && "- opcional"}
              </span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="20"
              className="input input-bordered w-full bg-base-200 text-base-content"
              value={
                "timerMinutes" in task
                  ? task.timerMinutes ?? ""
                  : task.timerMinutes ?? ""
              }
              onChange={(e) =>
                onChange(
                  "timerMinutes",
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
            />
            {/* PRIORIDAD */}
            <select
              className="select select-bordered w-full bg-base-200 text-base-content mt-4"
              value={task.priority ?? ""}
              onChange={(e) => onChange("priority", e.target.value)}
            >
              <option value="LOW">Prioridad Baja🌋</option>
              <option value="MEDIUM">Prioridad Media🌋🌋</option>
              <option value="HIGH">Prioridad alta🔥🌋🌋🌋</option>
            </select>
            {/* CATEGORÍA */}
            <label className="label mt-2">
              <span className="label-text font-semibold text-base-content">
                Categoría {!isEditMode && "(opcional)"}
              </span>
            </label>
            <select
              className="select select-bordered w-full bg-base-200 text-base-content"
              value={"categoryId" in task ? (task.categoryId ?? "") : ""}
              onChange={(e) => onChange("categoryId", e.target.value || null)}
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={onSave}
            disabled={isPending}
          >
            {isEditMode ? (
              <>
                <FaCheck size={16} /> Guardar
              </>
            ) : (
              <>
                <FaPlus size={16} /> Agregar
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
