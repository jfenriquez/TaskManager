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
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUp, ArrowDown, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { updateTask } from "@/src/actions/taskActions";

interface TasksTableProps {
  tasks?: Tasks[];
}

export default function TasksTable({ tasks = [] }: TasksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();

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

  const columns: ColumnDef<Tasks>[] = [
    {
      accessorKey: "completed",
      header: "",
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.completed}
          className="checkbox checkbox-sm checkbox-primary"
          readOnly
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
          ? format(new Date(row.original.ExecutionDate), "yyyy-MM-dd")
          : "";
        return (
          <div className="text-center">
            <input
              type="date"
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
      {/* Botón Exportar Excel */}
      <div className="flex justify-end">
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
                      readOnly
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
                      <span className="text-base-content/50">Ejecución:</span>
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
