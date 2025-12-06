"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Tasks } from "@prisma/client";
import React, { useState } from "react";
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

interface TasksProps {
  data?: Tasks[];
}

export default function TasksUI({ data = [] }: TasksProps) {
  const { user } = useAuth();

  // Estados locales
  const [filter, setFilter] = useState<FilterType>("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [highlightTask, setHighlightTask] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    timerMinutes: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Hooks personalizados
  const {
    tasks,
    isPending,
    handleAddTask,
    deleteTask,
    toggleComplete,
    handleUpdateTask,
    deleteAllCompleted,
    handleStartTimer: startTimer,
    handlePauseTimer,
    handleStopTimer: stopTimer,
  } = useTasks(data);

  const handleTimerEnd = (taskId: string) => {
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
  };

  const { counts, formatRemaining, markStoppedByUser } = useTimer({
    tasks,
    onTimerEnd: handleTimerEnd,
  });

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
    handleAddTask(newTask);
    setNewTask({ title: "", description: "", timerMinutes: "" });
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

  // Cálculos
  const stats = calculateStats(tasks);
  const filteredTasks = filterTasks(tasks, filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TaskHeader
          userName={user?.name ?? undefined}
          stats={stats}
          onDeleteCompleted={deleteAllCompleted}
          onRequestNotifications={handleRequestNotifications}
        />

        <TaskStatsComponent stats={stats} />

        <div className="card bg-white shadow-2xl">
          <div className="card-body">
            <TaskFilter
              filter={filter}
              onFilterChange={setFilter}
              onAddTask={() => setShowAddModal(true)}
            />

            <TaskList
              tasks={filteredTasks}
              counts={counts}
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

        <TaskModal
          isOpen={showAddModal}
          mode="add"
          task={newTask}
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
            onClose={() => setShowEditModal(false)}
            onSave={onSaveEdit}
            onChange={handleEditTaskChange}
          />
        )}
      </div>
    </div>
  );
}
