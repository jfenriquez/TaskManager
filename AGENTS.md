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
| `npm run dev` | next dev server |
| `npm run build` | `prisma migrate dev` then `next build` |
| `npm run start` | `prisma migrate deploy` then `next start` |
| `npm run lint` | ESLint (flat config at `eslint.config.mjs`) |
| `npm run prisma:seed` | `ts-node src/seed.ts` |
| `npx prisma generate` | Regenerates Prisma client after schema changes |
| `npx tsc --noEmit` | TypeScript type-check (no dedicated script) |

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

## No tests / no CI
- Repository has no test framework, no test files, and no CI workflows
- No typecheck script exists — run `npx tsc --noEmit` manually if needed
