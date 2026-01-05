export const dynamic = "force-dynamic";
import { getTasks } from "@/src/actions/taskActions";
import TasksTableWrapper from "@/src/components/tasks/TasksTableWrapper";

export default async function TasksPage() {
  const tasks = await getTasks(); // tu función server

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mis Tareas</h1>
      <TasksTableWrapper initialTasks={tasks} />
    </div>
  );
}
