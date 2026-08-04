import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserIdByApiKey } from "@/src/lib/mcp-auth";
import { registerTaskTools } from "@/src/lib/mcp-tools/tasks";
import { registerCategoryTools } from "@/src/lib/mcp-tools/categories";
import { registerTimerTools } from "@/src/lib/mcp-tools/timer";
import { registerStreakTools } from "@/src/lib/mcp-tools/streaks";
import { registerResources } from "@/src/lib/mcp-resources/index";

function buildMcpServer(userId: string): McpServer {
  const server = new McpServer(
    { name: "taskmanager-core", version: "1.0.0" },
    { capabilities: { resources: {}, tools: {} } }
  );
  registerTaskTools(server, userId);
  registerCategoryTools(server, userId);
  registerTimerTools(server, userId);
  registerStreakTools(server, userId);
  registerResources(server, userId);
  return server;
}

const handler = createMcpHandler(
  async (ctx) => {
    const apiKey = ctx.requestInfo?.headers.get("x-api-key") ?? null;
    const userId = await resolveUserIdByApiKey(apiKey);
    return buildMcpServer(userId);
  },
  { legacy: "stateless" }
);

const SUPPORTED_PROTOCOL_VERSIONS = ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05", "2024-10-07"];

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: NextRequest) {
  const raw = await request.clone().json();

  if (raw?.method === "initialize") {
    try {
      await resolveUserIdByApiKey(request.headers.get("x-api-key") ?? null);
      const requested =
        typeof raw?.params?.protocolVersion === "string" ? raw.params.protocolVersion : undefined;
      const protocolVersion =
        requested && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
          ? requested
          : "2025-11-25";
      const response = {
        jsonrpc: "2.0",
        id: raw.id ?? null,
        result: {
          protocolVersion,
          capabilities: {
            resources: { listChanged: true },
            tools: { listChanged: true },
          },
          serverInfo: { name: "taskmanager-core", version: "1.0.0" },
        },
      };
      return NextResponse.json(response);
    } catch (e) {
      console.error(">>> Initialize FAILED:", e);
      return NextResponse.json(
        { jsonrpc: "2.0", id: raw.id ?? null, error: { code: -32000, message: "Authentication failed" } },
        { status: 401 }
      );
    }
  }

  return handler.fetch(request);
}
