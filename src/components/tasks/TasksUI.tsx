"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Tasks } from "@prisma/client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTasks } from "@/src/hooks/useTasks";
import { useTimer } from "@/src/hooks/useTimer";
import { useNotifications } from "@/src/hooks/useNotifications";
import {
  calculateStats,
  filterTasks,
  promptForTimerMinutes,
} from "@/src/utils/taskUtils";
import TaskHeader from "@/src/components/tasks/TaskHeader";
import TaskStatsComponent from "@/src/components/tasks/TaskStats";
import TaskFilter from "@/src/components/tasks/TaskFilter";
import TaskList from "@/src/components/tasks/TaskList";
import TaskModal from "@/src/components/tasks/TaskModal";
import { Task, NewTaskForm, FilterType } from "@/src/types/task.types";
import TaskTotalTime from "./TaskTotalTime";

import { getCategories, getTasksByDate } from "@/src/actions/taskActions";
import MonthlyGoal from "@/src/components/goal/MonthlyGoal";
import { mapPrismaTaskToTask } from "@/src/utils/mapTask";
import { useAppDispatch } from "@/src/store/hooks";
import { setTotalMinutes } from "@/src/store/taskTimeSlice";

interface TasksProps {
  data?: Tasks[];
}

export default function TasksUI({ data = [] }: TasksProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Estados locales
  const [filter, setFilter] = useState<FilterType>("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [highlightTask, setHighlightTask] = useState<string | null>(null);

  const [categories, setCategories] = useState<
    { id: string; name: string; color: string }[]
  >([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    timerMinutes: "",
    priority: "MEDIUM",
    categoryId: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    replaceTasks,
    isPending,
    handleAddTask,
    deleteTask,
    toggleComplete,
    handleUpdateTask,
    handleStartTimer: startTimer,
    handlePauseTimer,
    handleStopTimer: stopTimer,
  } = useTasks(data);

  // Date navigation
  const [selectedDate, setSelectedDate] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [dateLoading, setDateLoading] = useState(false);

  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: browserTz });
    setTodayDate(today);
    if (!selectedDate) setSelectedDate(today);
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("es", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const shiftDate = (dateStr: string, delta: number) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return dt.toISOString().slice(0, 10);
  };

  const goNextDay = () => setSelectedDate((prev) => shiftDate(prev, 1));
  const goPrevDay = () => setSelectedDate((prev) => shiftDate(prev, -1));
  const goToday = () => { if (todayDate) setSelectedDate(todayDate); };

  const isToday = selectedDate && todayDate && selectedDate === todayDate;

  const fetchTasksForDate = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    setDateLoading(true);
    try {
      const fetched = await getTasksByDate(dateStr);
      replaceTasks(fetched.map(mapPrismaTaskToTask));
    } catch (err) {
      console.error("Error fetching tasks for date:", err);
    } finally {
      setDateLoading(false);
    }
  }, [replaceTasks]);

  useEffect(() => {
    if (selectedDate) fetchTasksForDate(selectedDate);
  }, [selectedDate, fetchTasksForDate]);

  const handleTimerEnd = useCallback((taskId: string) => {
    setHighlightTask(taskId);
    setTimeout(
      () => setHighlightTask((prev) => (prev === taskId ? null : prev)),
      5000
    );

    playSound("coin");
    vibrate([200, 100, 200]);

    const task = tasks.find((t) => t.id === taskId);
    ensureNotificationPermission().then((granted) => {
      if (granted) {
        showNotification(
          "Temporizador finalizado",
          task ? `${task.title} ha terminado` : "Un temporizador terminó"
        );
      }
    });

    stopTimer(taskId);
  }, [tasks, stopTimer]);

  const { counts, formatRemaining, markStoppedByUser } = useTimer({
    tasks,
    onTimerEnd: handleTimerEnd,
  });

  // Dynamic document title when timer is running and page is hidden
  const baseTitleRef = useRef("");
  useEffect(() => {
    baseTitleRef.current = document.title;
  }, []);

  useEffect(() => {
    const baseTitle = baseTitleRef.current;

    const updateTitle = () => {
      const runningEntry = Object.entries(counts).find(([, s]) => s.running);
      if (runningEntry && document.visibilityState === "hidden") {
        document.title = `${formatRemaining(runningEntry[1].remainingMs)} - ${baseTitle}`;
      } else {
        document.title = baseTitle;
      }
    };

    updateTitle();
    document.addEventListener("visibilitychange", updateTitle);

    return () => {
      document.title = baseTitle;
      document.removeEventListener("visibilitychange", updateTitle);
    };
  }, [counts, formatRemaining]);

  const {
    ensureNotificationPermission,
    showNotification,
    playSound,
    vibrate,
    requestPermission,
  } = useNotifications();

  // Manejadores
  const handleStartTimerWithPrompt = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let minutes: number | undefined = undefined;
    if (!task.timerMinutes) {
      const result = promptForTimerMinutes();
      if (result === null) return;
      minutes = result;
    }

    playSound("start");
    ensureNotificationPermission().then((granted) => {
      if (granted) {
        showNotification(
          "Temporizador iniciado",
          `Tarea iniciada: ${task.title}`
        );
      }
    });
    vibrate(100);

    startTimer(taskId, minutes);
  };

  const handlePauseTimerWithSound = (taskId: string) => {
    playSound("reset");
    handlePauseTimer(taskId);
  };

  const handleStopTimerWithSound = (taskId: string) => {
    markStoppedByUser(taskId);
    stopTimer(taskId);
  };

  const onAddTask = () => {
    if (!newTask.title || newTask.title.trim() === "") {
      alert("El título es obligatorio");
      return;
    }
    handleAddTask(newTask, selectedDate);
    setNewTask({
      title: "",
      description: "",
      timerMinutes: "",
      priority: "MEDIUM",
      categoryId: "",
    });
    setShowAddModal(false);
  };

  const onSaveEdit = () => {
    if (editingTask) {
      handleUpdateTask(editingTask);
      setEditingTask(null);
      setShowEditModal(false);
    }
  };

  const handleNewTaskChange = (
    field: string,
    value: string | number | null
  ) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTaskChange = (
    field: string,
    value: string | number | null
  ) => {
    if (editingTask) {
      setEditingTask((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const handleRequestNotifications = async () => {
    const result = await requestPermission();
    alert("Estado actual: " + result);
  };

  // Sincroniza el total de minutos con Redux
  useEffect(() => {
    const total = tasks
      .filter((t) => !t.completed && t.timerMinutes)
      .reduce((sum, t) => sum + (t.timerMinutes ?? 0), 0);
    dispatch(setTotalMinutes(total));
  }, [tasks, dispatch]);

  // Cálculos
  const stats = calculateStats(tasks);
  const filteredTasks = filterTasks(tasks, filter);

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Header con mejor responsividad */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <TaskHeader
            userName={user?.name ?? undefined}
            stats={stats}
            onRequestNotifications={handleRequestNotifications}
          />
        </div>

        {/* Date navigator — carrusel de días */}
        <div className="mb-4">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={goPrevDay}
                  aria-label="Día anterior"
                >
                  ◀
                </button>

                <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
                  {dateLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <span className="text-sm sm:text-base font-medium capitalize truncate text-center text-base-content">
                      {formatDisplayDate(selectedDate)}
                    </span>
                  )}
                  {!isToday && todayDate && (
                    <button
                      className="btn btn-outline btn-xs whitespace-nowrap"
                      onClick={goToday}
                    >
                      Hoy
                    </button>
                  )}
                </div>

                <button
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={goNextDay}
                  aria-label="Día siguiente"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Goal — objetivo mensual */}
        <div className="mb-4">
          <MonthlyGoal />
        </div>

        {/* Stats con layout responsive */}
        <div className="mb-4 sm:mb-6">
          <TaskStatsComponent stats={stats} />
        </div>

        {/* Card principal con mejor padding responsive */}
        <div className="card bg-base-100 shadow-lg sm:shadow-xl transition-colors duration-200">
          <div className="card-body p-4 sm:p-6 md:p-8">
            {/* Filter con botones responsive */}
            <div className="mb-4 sm:mb-6">
              <TaskFilter
                filter={filter}
                onFilterChange={setFilter}
                onAddTask={() => setShowAddModal(true)}
              />
            </div>

            {/* Lista de tareas */}
            <TaskList
              tasks={filteredTasks}
              counts={counts}
              categories={categories}
              formatRemaining={formatRemaining}
              onToggleComplete={toggleComplete}
              onEdit={startEdit}
              onDelete={deleteTask}
              onStartTimer={handleStartTimerWithPrompt}
              onPauseTimer={handlePauseTimerWithSound}
              onStopTimer={handleStopTimerWithSound}
            />
          </div>
        </div>

        {/* Modales con mejor comportamiento responsive */}
        <TaskModal
          isOpen={showAddModal}
          mode="add"
          task={newTask}
          categories={categories}
          isPending={isPending}
          onClose={() => setShowAddModal(false)}
          onSave={onAddTask}
          onChange={handleNewTaskChange}
        />

        {editingTask && (
          <TaskModal
            isOpen={showEditModal}
            mode="edit"
            task={editingTask}
            categories={categories}
            onClose={() => setShowEditModal(false)}
            onSave={onSaveEdit}
            onChange={handleEditTaskChange}
          />
        )}
      </div>
    </div>
  );
}
