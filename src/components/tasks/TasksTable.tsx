// src/components/tasks/TasksTable.tsx
"use client";

import { Tasks } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useTransition, useRef } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUp, ArrowDown, Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { updateTask, deleteTaskXid } from "@/src/actions/taskActions";
import { Trash2 } from "lucide-react";

import { FaTrash } from "react-icons/fa";
import { useTasks } from "@/src/hooks/useTasks";
interface TasksTableProps {
  tasks?: Tasks[];
  onImportTasks?: (tasks: Partial<Tasks>[]) => Promise<void>;
}

export default function TasksTable({
  tasks = [],
  onImportTasks,
}: TasksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { deleteAllCompleted } = useTasks();

  const onDeleteCompleted = async () => {
    startTransition(async () => {
      try {
        await deleteAllCompleted();
      } catch (error) {
        console.error("Error al eliminar tareas completadas:", error);
      }
    });
  };

  const getPriorityBadge = (priority: string | null) => {
    const p = priority || "MEDIUM";
    switch (p.toUpperCase()) {
      case "HIGH":
        return "badge badge-error text-white";
      case "MEDIUM":
        return "badge badge-warning text-white";
      case "LOW":
        return "badge badge-success text-white";
      default:
        return "badge badge-ghost";
    }
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Función para mostrar toast
  const showToast = (message: string, type: "success" | "error") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-top toast-end z-50`;
    toast.innerHTML = `
      <div class="alert alert-${
        type === "success" ? "success" : "error"
      } shadow-lg">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const rows = table.getRowModel().rows;
    const exportData = rows.map((row) => ({
      Tarea: row.original.title,
      Descripción: row.original.description || "",
      Completada: row.original.completed ? "Sí" : "No",
      Prioridad: row.original.priority || "MEDIUM",
      "Tiempo estimado": formatTime(row.original.timerMinutes),
      "Fecha de ejecución": row.original.ExecutionDate
        ? format(new Date(row.original.ExecutionDate), "dd/MM/yyyy")
        : "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tareas");
    const fileName = `mis-tareas-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Parsear tiempo desde formato "Xh Ym" o "Xm"
  const parseTime = (timeStr: string): number | null => {
    if (!timeStr || timeStr === "—") return null;

    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;

    return hours * 60 + minutes;
  };

  // Parsear fecha desde formato "dd/MM/yyyy"
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      return parse(dateStr, "dd/MM/yyyy", new Date());
    } catch {
      return null;
    }
  };

  // Importar desde Excel
  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validar y transformar datos
      const importedTasks: Partial<Tasks>[] = jsonData.map((row: unknown) => {
        const rowData = row as Record<string, unknown>;
        return {
          title: (rowData["Tarea"] as string) || "",
          description: (rowData["Descripción"] as string | null) || null,
          completed:
            (rowData["Completada"] as string)?.toLowerCase() === "sí" ||
            (rowData["Completada"] as string)?.toLowerCase() === "si",
          priority: ((rowData["Prioridad"] as string)?.toUpperCase() ||
            "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
          timerMinutes: parseTime(rowData["Tiempo estimado"] as string),
          ExecutionDate: parseDate(rowData["Fecha de ejecución"] as string),
        };
      });

      // Filtrar tareas sin título
      const validTasks = importedTasks.filter(
        (task) => task.title && task.title.trim() !== ""
      );

      if (validTasks.length === 0) {
        showToast("No se encontraron tareas válidas en el archivo", "error");
        return;
      }

      // Llamar a la función de importación si existe
      if (onImportTasks) {
        startTransition(async () => {
          try {
            await onImportTasks(validTasks);
            showToast(
              `${validTasks.length} tarea(s) importada(s) correctamente`,
              "success"
            );
          } catch (error) {
            showToast("Error al importar las tareas", "error");
          }
        });
      } else {
        showToast(
          "La funcionalidad de importación no está configurada",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      showToast("Error al leer el archivo Excel", "error");
    } finally {
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await updateTask({
          task: { id: taskId, completed: !completed },
        });
        showToast(
          !completed
            ? "Tarea marcada como completada"
            : "Tarea marcada como pendiente",
          "success"
        );
      } catch (error) {
        showToast("Error al actualizar el estado de la tarea", "error");
      }
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTaskXid(taskId);
        showToast("Tarea eliminada correctamente", "success");
      } catch (error) {
        showToast("Error al eliminar la tarea", "error");
      }
    });
  };

  const columns: ColumnDef<Tasks>[] = [
    {
      accessorKey: "completed",
      header: "",
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.completed}
          className="checkbox checkbox-sm checkbox-primary"
          disabled={isPending}
          onChange={() =>
            handleToggleComplete(row.original.id, row.original.completed)
          }
        />
      ),
      size: 50,
      enableSorting: true,
    },
    {
      accessorKey: "title",
      header: "Tarea",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => (
        <div className="text-center">
          <div className={getPriorityBadge(row.original.priority)}>
            {row.original.priority || "MEDIUM"}
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (
          (order[rowA.original.priority || "MEDIUM"] ?? 2) -
          (order[rowB.original.priority || "MEDIUM"] ?? 2)
        );
      },
    },
    {
      accessorKey: "timerMinutes",
      header: "Tiempo",
      cell: ({ row }) => {
        const value = row.original.timerMinutes ?? "";
        return (
          <div className="text-center">
            <input
              type="number"
              min="0"
              placeholder="min"
              defaultValue={value || ""}
              disabled={isPending}
              className="input input-bordered input-xs w-20 text-center font-mono"
              onBlur={(e) => {
                const newMinutes = e.target.value
                  ? parseInt(e.target.value, 10)
                  : null;
                if (newMinutes !== row.original.timerMinutes) {
                  startTransition(async () => {
                    try {
                      await updateTask({
                        task: { id: row.original.id, timerMinutes: newMinutes },
                      });
                      showToast("Tiempo actualizado correctamente", "success");
                    } catch (error) {
                      showToast("Error al actualizar el tiempo", "error");
                    }
                  });
                }
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.target as HTMLInputElement).blur()
              }
            />
          </div>
        );
      },
      sortingFn: "basic",
    },
    {
      accessorKey: "ExecutionDate",
      header: "Ejecución",
      cell: ({ row }) => {
        const dateValue = row.original.ExecutionDate
          ? format(new Date(row.original.ExecutionDate), "yyyy-MM-dd'T'HH:mm")
          : "";
        return (
          <div className="text-center">
            <input
              type="datetime-local"
              defaultValue={dateValue}
              disabled={isPending}
              className="input input-bordered input-sm w-full max-w-xs"
              onBlur={(e) => {
                const newDateStr = e.target.value;
                const newDate = newDateStr ? new Date(newDateStr) : null;

                const currentDate = row.original.ExecutionDate
                  ? new Date(row.original.ExecutionDate)
                  : null;

                const datesDiffer =
                  (newDate && !currentDate) ||
                  (!newDate && currentDate) ||
                  (newDate &&
                    currentDate &&
                    newDate.toISOString() !== currentDate.toISOString());

                if (datesDiffer) {
                  startTransition(async () => {
                    try {
                      await updateTask({
                        task: { id: row.original.id, ExecutionDate: newDate },
                      });
                      showToast("Fecha actualizada correctamente", "success");
                    } catch (error) {
                      showToast("Error al actualizar la fecha", "error");
                    }
                  });
                }
              }}
            />
          </div>
        );
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <p className="text-sm text-base-content/70 line-clamp-2 max-w-xs">
          {row.original.description || "Sin descripción"}
        </p>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => handleDeleteTask(row.original.id)}
          disabled={isPending}
          className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white"
          title="Eliminar tarea"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div>
        <button
          onClick={onDeleteCompleted}
          className="btn btn-error btn-md gap-2"
        >
          <FaTrash size={16} />
          Eliminar completadas
        </button>
      </div>
      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Botones Exportar e Importar */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleImportExcel}
          disabled={isPending}
          className="btn btn-secondary btn-md gap-2 shadow-lg"
        >
          <Upload className="w-5 h-5" />
          Importar Excel
        </button>

        <button
          onClick={handleExportExcel}
          disabled={tasks.length === 0 || isPending}
          className="btn btn-primary btn-md gap-2 shadow-lg"
        >
          <Download className="w-5 h-5" />
          Exportar a Excel
        </button>
      </div>

      {/* Tabla Desktop */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full hidden md:table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-base-300">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left">
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp className="w-4 h-4" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-base-content/60"
                >
                  No hay tareas aún. ¡Crea una nueva!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-base-200 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Vista Móvil */}
        <div className="grid gap-4 md:hidden">
          {tasks.length === 0 ? (
            <div className="card bg-base-100 shadow-xl p-6 text-center">
              <p className="text-base-content/60">
                No hay tareas aún. ¡Crea una nueva!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="card bg-base-100 shadow-lg border border-base-300"
              >
                <div className="card-body p-5">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="checkbox checkbox-primary mt-1"
                      disabled={isPending}
                      onChange={() =>
                        handleToggleComplete(task.id, task.completed)
                      }
                    />
                    <div className={getPriorityBadge(task.priority)}>
                      {task.priority || "MEDIUM"}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{task.title}</h3>

                  {task.description && (
                    <p className="text-sm text-base-content/70 mb-4">
                      {task.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-base-content/50">Tiempo:</span>
                      <span className="ml-2 font-mono font-medium">
                        {formatTime(task.timerMinutes)}
                      </span>
                    </div>
                    <div>
                      <span className="text-base-content/50">ón:</span>
                      <span className="ml-2">
                        {task.ExecutionDate
                          ? format(
                              new Date(task.ExecutionDate),
                              "dd MMM yyyy",
                              { locale: es }
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isPending}
                      className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white flex-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
