// SIN "use client"

import { getTotalTimerTasks } from "@/src/actions/taskActions";
import TaskTotalClient from "./TaskTotalTimeClient";

export default async function TaskTotalTime() {
  const minutes = await getTotalTimerTasks();

  return <TaskTotalClient minutes={minutes} />;
}
