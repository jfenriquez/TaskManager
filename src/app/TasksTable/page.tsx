// app/tasks/page.tsx o donde esté
import { getTasks } from "@/src/actions/taskActions";
import TasksTable from "@/src/components/tasks/TasksTable";

export default async function TasksPage() {
  const tasks = await getTasks(); // tu función server

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mis Tareas</h1>
      <TasksTable tasks={tasks} /> {/* ¡Sin onUpdateTask! */}
    </div>
  );
}
