# Especificación Técnica — TaskManager "Si No Lo Hace Llora"

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | ^16.0.7 |
| UI Runtime | React | ^19.2.1 |
| Lenguaje | TypeScript | ^5.9.3 |
| Estilos | Tailwind CSS + daisyUI | ^4 / ^5.3.8 |
| ORM | Prisma | ^6.18.0 |
| Base de datos | PostgreSQL | — |
| Autenticación | better-auth | ^1.3.34 |
| Tablas | @tanstack/react-table | ^8.21.3 |
| Fechas | date-fns | ^4.1.0 |
| Animaciones | framer-motion, GSAP, lottie-react | — |
| Íconos | lucide-react, react-icons | — |
| Formularios | react-hook-form | ^7.65.0 |
| Email | nodemailer + Resend | — |
| Excel | xlsx | ^0.18.5 |
| Cifrado | bcryptjs, jose | — |
| Gráficos | chart.js + react-chartjs-2 | — |
| Estado global | Redux Toolkit + react-redux | — |
| Player | react-youtube | — |
| Package manager | pnpm | ^10.33.0 |

## 2. Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma          # Modelos y relaciones
│   ├── migrations/            # Migraciones de BD
│   └── config.ts              # Config de Prisma (defineConfig)
├── src/
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Landing / Dashboard (server)
│   │   ├── layout.tsx         # Root layout (Navbar, ThemeProvider)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── forgot-password/   # Recuperación de contraseña
│   │   ├── reset-password/    # Reset de contraseña
│   │   ├── verify-email/      # Verificación de email
│   │   ├── profile/           # Perfil con estadísticas
│   │   ├── admin/             # Panel de administración
│   │   ├── categories/        # CRUD de categorías
│   │   ├── TasksTable/        # Vista tabla mensual
│   │   ├── hyde-slayer/       # Módulo RPG psicológico
│   │   ├── unauthorized/      # Página de acceso denegado
│   │   └── api/
│   │       ├── auth/[...all]/ # Catch-all de better-auth
│   │       ├── auth/actions/  # Server actions legacy de auth
│   │       ├── admin/         # API admin protegida
│   │       └── user/timezone/ # API de zona horaria
│   ├── actions/               # Server Actions
│   │   ├── taskActions.ts     # CRUD tareas + timer + categorías + stats
│   │   ├── streakActions.ts   # Cálculo de rachas
│   │   └── goalActions.ts     # CRUD de objetivos mensuales
│   ├── components/
│   │   ├── tasks/             # UI del dashboard de tareas
│   │   ├── hyde-slayer/       # UI del módulo RPG
│   │   ├── streak/            # Display de rachas
│   │   ├── home/              # Landing page (Hero, Features, CTA, Footer)
│   │   ├── nav/               # Navbar
│   │   ├── forms/             # Formularios compartidos
│   │   ├── goal/              # Goal mensual
│   │   └── ui/                # Componentes atómicos (form, modal, alert, etc.)
│   ├── hooks/                 # Custom hooks
│   ├── context/               # Contextos (Theme, PlayerStats)
│   ├── lib/                   # Core (auth, prisma, email, auth-utils)
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utilidades (date, streak, map)
│   └── store/                 # Redux store & provider
├── docs/                      # Documentación
├── prisma.config.ts           # Config de Prisma CLI
├── next.config.ts             # Config de Next.js
├── tailwind.config.ts         # Config de Tailwind
└── postcss.config.mjs         # Config de PostCSS
```

## 3. Arquitectura de Autenticación

- **Sistema:** better-auth con Prisma adapter
- **Estrategia:** Sesiones manejadas vía `auth.api.getSession()` en server actions y API routes
- **Client:** `createAuthClient()` en `src/lib/auth-client.ts`
- **Endpoint API:** `src/app/api/auth/[...all]/route.ts` usando `toNextJsHandler`
- **Roles:** `USER`, `MODERATOR`, `ADMIN` — almacenados como campo adicional en User
- **Asignación automática:** El primer usuario registrado se convierte en ADMIN. Usuarios con email `@tuempresa.com` obtienen MODERATOR.
- **Métodos de login:** Email/password con verificación, Google OAuth, GitHub OAuth
- **Email:** notificaciones vía nodemailer (SMTP) y Resend como alternativa

## 4. Base de Datos

### Modelos principales

- **User** — Usuarios con roles, timezone, streak
- **Session** — Sesiones de better-auth
- **Account** — Cuentas vinculadas (OAuth, credentials)
- **Verification** — Tokens de verificación
- **Jwks** — Llaves JWK para better-auth
- **Tasks** — Tareas con temporizador, prioridad, categoría
- **Category** — Categorías por usuario con color
- **Goal** — Objetivos mensuales y del módulo Hyde-Slayer

### Modelos Hyde-Slayer (RPG)

- **PlayerProfile** — Perfil del jugador (nivel, XP, monedas, disciplina)
- **XpLog** — Historial de XP ganada
- **DailyLog** — Registro diario de actividad
- **Vitamente / VitamenteLog** — Afirmaciones positivas
- **RelaxationExercise / RelaxationLog** — Ejercicios de relajación
- **HydeEnemy** — Enemigos con stats (HP, ataque, defensa)
- **BattleLog** — Historial de batallas
- **CastleLevel / CastleProgress** — Progresión de jefes (castillo)
- **Item / Inventory** — Items y equipamiento
- **Pact / PlayerPact** — Pactos/desafíos
- **Achievement / PlayerAchievement** — Logros

### Convenciones de naming

- Tablas en snake_case via `@@map("name")`
- Modelos en PascalCase
- Enums como modelos separados

## 5. Server Actions

Todas las server actions están en `src/actions/` y usan el patrón:
1. Obtener sesión vía `getCurrentUserId()` o `auth.api.getSession()`
2. Validar autenticación
3. Ejecutar lógica con Prisma
4. Revalidar path con `revalidatePath()`

### taskActions.ts (651 líneas)
- **Lectura:** `getTasks()`, `getTasksXDay()`, `getTasksByDate()`
- **Escritura:** `createTask()`, `updateTask()`, `updateStatusTask()`, `deleteTaskXid()`, `deleteTasksCompleted()`
- **Importación:** `importTasks()` — batch create vía transacción
- **Categorías:** `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`, `ensureDefaultCategories()`
- **Timer:** `startTaskTimer()`, `pauseTaskTimer()`, `stopTaskTimer()`
- **Stats:** `getProfileStats()`, `getTotalTimerTasks()`

### streakActions.ts (158 líneas)
- `updateStreakOnTaskToggle()` — recalcula racha al completar tareas
- `getStreakData()` — obtiene datos de racha (actual, mejor, metas)
- `setDailyTaskGoal()` — establece meta diaria vía cookie

### goalActions.ts (239 líneas)
- `getMonthlyGoal()` / `setMonthlyGoal()` / `toggleMonthlyGoal()` — objetivo mensual legacy
- `getAllGoals()` / `createGoal()` / `updateGoal()` / `deleteGoal()` / `toggleGoalCompleted()` — CRUD completo de objetivos Hyde-Slayer

## 6. API Routes

| Ruta | Método | Propósito | Protección |
|---|---|---|---|
| `/api/auth/[...all]` | GET, POST | Catch-all de better-auth | — |
| `/api/admin` | GET | Verificación de rol ADMIN | Sesión + rol ADMIN |
| `/api/user/timezone` | GET | Obtener timezone del usuario | Sesión |
| `/api/user/timezone` | PATCH | Actualizar timezone | Sesión |

## 7. Hooks

| Hook | Archivo | Propósito |
|---|---|---|
| `useAuth` | `src/hooks/useAuth.ts` | Sesión, autenticación, verificación de roles |
| `useTasks` | `src/hooks/useTasks.ts` | CRUD optimista de tareas + timer |
| `useTimer` | `src/hooks/useTimer.ts` | Countdown en tiempo real con detección de fin |
| `useNotifications` | `src/hooks/useNotifications.ts` | Notificaciones browser + sonido + vibración |
| `useUserTimezone` | `src/hooks/useUserTimezone.ts` | Zona horaria del usuario |
| `useFormSubmit` | `src/hooks/useFormSubmit.ts` | Manejo genérico de submit con transiciones |
| `useGoals` | `src/hooks/useGoals.ts` | CRUD optimista de objetivos |

## 8. Páginas y Rutas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Server | Landing (no auth) o Dashboard con sidebar de tiempo |
| `/login` | Client | Login con email/password, Google, GitHub |
| `/register` | Client | Registro con verificación de email |
| `/forgot-password` | Client | Solicitud de recuperación |
| `/reset-password` | Client | Reset de contraseña |
| `/verify-email` | Client | Verificación de email |
| `/profile` | Client | Estadísticas, heatmap, racha, zona horaria |
| `/admin` | Client | Panel de admin (solo rol ADMIN) |
| `/categories` | Client | CRUD de categorías |
| `/TasksTable` | Server + Client | Vista tabla mensual con @tanstack/react-table |
| `/hyde-slayer` | Client | Módulo RPG (Hyde-Slayer) |
| `/unauthorized` | Client | Acceso denegado |

## 9. Contextos

- **ThemeProvider** (`src/context/ThemeProvider.tsx`) — 11 temas daisyUI, persistencia en localStorage
- **PlayerStatsProvider** (`src/context/PlayerStatsContext.tsx`) — Stats del jugador Hyde-Slayer, refrescables

## 10. Temporizador (Timer)

- **Server actions:** `startTaskTimer()`, `pauseTaskTimer()`, `stopTaskTimer()`
- **Campos en Task:** `timerRemainingSeconds`, `timerEndsAt`, `timerRunning`, `timerMinutes`
- **Lógica:**
  - `startTaskTimer()`: calcula `timerEndsAt = now + seconds`, set `timerRunning = true`
  - `pauseTaskTimer()`: guarda segundos restantes en `timerRemainingSeconds`, set `timerRunning = false`
  - `stopTaskTimer()`: limpia todos los campos de timer
- **Client hook `useTimer()`:** tick cada 1s, detecta cuando llega a 0 y dispara `onTimerEnd`
- **Notificaciones:** sonido + notificación browser + vibración al finalizar

## 11. Módulo Hyde-Slayer

Sub-aplicación RPG gamificada dentro de TaskManager. Componentes principales:

- **HydeSlayerDashboard** — Layout principal con sidebar de navegación
- **Dashboard (StatsBar)** — Stats del jugador (nivel, XP, monedas, disciplina)
- **BattleMode** — Sistema de combate contra enemigos
- **HydeCastle** — Progresión de jefes
- **GoalSheet / GoalModal / GoalList** — Objetivos con metodología (propósito, visualización, misiones)
- **Pacts** — Pactos/desafíos con dificultad
- **Inventory** — Inventario con equipamiento
- **Achievements** — Logros por categoría
- **Vitamentes** — Afirmaciones positivas
- **Relaxation** — Ejercicios de relajación
- **Analytics** — Analíticas del jugador

## 12. Rachas (Streak)

- Calculadas en `streakActions.ts` basadas en tareas completadas por día
- Meta diaria configurable (1-50, guardada en cookie)
- Días consecutivos donde `tareas_completadas >= meta_diaria`
- Íconos por nivel: Sin racha (–), Chispa (✨, 3+), Llama (🔥, 7+), Fuego (🔥, 30+)
- Milestones: 7(Bronce), 14(Plata), 30(Oro), 60(Estrella), 100(Superestrella), 200(Diamante), 365(Leyenda)

## 13. Temas Visuales

11 temas daisyUI: `light`, `dark`, `cupcake`, `retro`, `luxury`, `dim`, `coffee`, `lemonade`, `wireframe`, `fantasy`, `pastel`

Persistencia en localStorage, aplicado via `data-theme` en el `<html>`.

## 14. Configuración de Prisma

- Usa `prisma.config.ts` con `defineConfig` (nueva API de Prisma 6)
- Engine: `"classic"`
- Carga `.env` explícitamente con `import "dotenv/config"`
- Cliente generado en `src/generated/prisma/` (gitignored)

## 15. Seguridad

- Headers HTTP: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-XSS-Protection`, `Permissions-Policy`
- Autenticación requerida en server actions mediante `getCurrentUserId()`
- Rutas admin protegidas por rol en API y cliente
- Verificación de email requerida por defecto
- Contraseñas hasheadas con bcryptjs
- Tokens JWT con jose
