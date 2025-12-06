// components/TaskModal.tsx

import React from "react";
import { FaPlus, FaCheck } from "react-icons/fa";
import { Task, NewTaskForm } from "../../types/task.types";

interface TaskModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  task: NewTaskForm | Task;
  isPending?: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string | number | null) => void;
}

export default function TaskModal({
  isOpen,
  mode,
  task,
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
      <div className="modal-box">
        <h3 className="font-bold text-2xl mb-4 text-purple-600">{title}</h3>
        <div className="space-y-4">
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold">Título</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Recoger la basura"
              className="input input-bordered w-full"
              value={task.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Descripción {!isEditMode && "(opcional)"}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 w-full"
              placeholder="Detalles..."
              value={task.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
            ></textarea>
          </div>
          <div className="w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Duración (minutos) {!isEditMode && "- opcional"}
              </span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="20"
              className="input input-bordered w-full"
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
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost mr-2" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={isPending}
          >
            {isEditMode ? (
              <>
                <FaCheck size={20} /> Guardar
              </>
            ) : (
              <>
                <FaPlus size={20} /> Agregar
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
    </div>
  );
}
