import { McpServer } from "@modelcontextprotocol/server";
import { registerTaskTools } from "./tools/tasks.js";
import { registerCategoryTools } from "./tools/categories.js";
import { registerTimerTools } from "./tools/timer.js";
import { registerStreakTools } from "./tools/streaks.js";
import { registerResources } from "./resources/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "taskmanager-core", version: "1.0.0" },
    { capabilities: { resources: {}, tools: {} } }
  );

  registerTaskTools(server);
  registerCategoryTools(server);
  registerTimerTools(server);
  registerStreakTools(server);
  registerResources(server);

  return server;
}
