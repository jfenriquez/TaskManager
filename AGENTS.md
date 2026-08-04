# TaskManager — AGENTS.md

## Stack
- Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, daisyUI 5
- **Auth: better-auth** (NOT NextAuth.js) — configured in `src/lib/auth.ts` + `src/lib/auth-client.ts`
- **Database:** Prisma 6 + PostgreSQL — schema at `prisma/schema.prisma`, config via `prisma.config.ts` (Prisma's new `defineConfig` API)
- Prisma client generated to `src/generated/prisma/` (gitignored)
- Path alias `@/*` maps to project root (e.g., `@/src/lib/prisma`)

## Commands
| Command | What it does |
|---|---|
| `pnpm dev` | next dev server |
| `pnpm build` | `prisma migrate dev` then `next build` |
| `pnpm start` | `prisma migrate deploy` then `next start` |
| `pnpm lint` | ESLint (flat config at `eslint.config.mjs`) |
| `pnpm prisma:seed` | `ts-node src/seed.ts` |
| `pnpx prisma generate` | Regenerates Prisma client after schema changes |
| `pnpx tsc --noEmit` | TypeScript type-check (no dedicated script) |

## Architecture

### Auth
- better-auth handles sessions via `auth.api.getSession({ headers: await headers() })`
- Server actions in `src/actions/taskActions.ts` use this pattern
- Catch-all API route: `src/app/api/auth/[...all]/route.ts`
- Roles: USER, ADMIN, MODERATOR — first registered user auto-assigned ADMIN

### Key directories
- `src/app/` — Next.js App Router pages (login, register, admin, verify-email)
- `src/app/api/` — API routes (auth catch-all, admin, user/timezone)
- `src/components/` — UI components (tasks/, nav/, home/)
- `src/lib/` — auth, auth-client, prisma singleton
- `src/actions/` — server actions (task CRUD + timer)
- `src/hooks/` — useAuth, useTasks, useTimer, useNotifications, useUserTimezone
- `src/context/` — ThemeProvider
- `src/types/` — auth.ts, task.types.ts
- `src/utils/` — dateHelpers, taskUtils
- `prisma/` — schema, migrations, config

### Timer (in `src/actions/taskActions.ts`)
- Server actions: `startTaskTimer`, `pauseTaskTimer`, `stopTaskTimer`
- Uses `timerRemainingSeconds` / `timerEndsAt` / `timerRunning` fields on Tasks model

### Prisma config quirk
- Uses `prisma.config.ts` (new Prisma config format) with `engine: "classic"`
- `.env` must be present for Prisma CLI commands since config imports `dotenv/config`

## Env variables (see `.env.example`)
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
- `AUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (optional, defaults to `window.location.origin`)

## MCP Server (`mcp/`)
- **TaskManager Core MCP** — expone CRUD de tareas, timer, categorías y rachas como herramientas y recursos MCP
- Basado en `@modelcontextprotocol/server` v2
- **Dos transportes:**
  - **stdio** (`mcp/src/index.ts`) — para uso local (Claude Desktop, Cursor)
  - **HTTP** (`/api/mcp`) — para acceso remoto via Next.js, usa `createMcpHandler`
- Autenticación (por orden de prioridad):
  1. `MCP_API_KEY` — API key generada desde el perfil web (/profile)
  2. `MCP_USER_EMAIL` — email del usuario
  3. `MCP_USER_ID` — ID del usuario
  4. Primer usuario de la BD (si no se configura nada, útil en desarrollo monousuario)

### MCP via HTTP (URL)
El endpoint `/api/mcp` acepta requests MCP modernas (2026-07-28). Se autentica via header `x-api-key`.

Ejemplo de configuración para clientes remotos:
```json
{
  "mcpServers": {
    "taskmanager": {
      "url": "https://tudominio.com/api/mcp",
      "headers": { "x-api-key": "sk_..." }
    }
  }
}
```

### Comandos
| Comando | Qué hace |
|---|---|
| `pnpm mcp:dev` | Inicia el MCP server en modo desarrollo (tsx) |
| `pnpm mcp:build` | Compila el MCP server a JS |
| `pnpm mcp:generate` | Regenera el Prisma client para el MCP |

### Herramientas disponibles
`create_task`, `update_task`, `delete_task`, `get_tasks_by_date`, `toggle_completion`, `import_tasks`, `get_categories`, `create_category`, `update_category`, `delete_category`, `start_timer`, `pause_timer`, `stop_timer`, `get_streak`

### Recursos disponibles
`task://{id}`, `tasks://today`, `tasks://date/{YYYY-MM-DD}`, `categories://`, `streak://current`

### Ejemplo de configuración (Claude Desktop/Cursor)
```json
{
  "mcpServers": {
    "taskmanager": {
      "command": "pnpm",
      "args": ["--dir", "<ruta-a-taskmanager>/mcp", "dev"],
      "env": {
        "MCP_API_KEY": "sk_..."
      }
    }
  }
}
```

## No tests / no CI
- Repository has no test framework, no test files, and no CI workflows
- No typecheck script exists — run `npx tsc --noEmit` manually if needed
