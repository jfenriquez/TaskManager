# Convenciones del Proyecto — TaskManager

## 1. Naming Conventions

### Archivos y directorios
- **React components:** PascalCase (`TaskItem.tsx`, `HydeSlayerDashboard.tsx`)
- **Hooks:** camelCase con prefijo `use` (`useAuth.ts`, `useTimer.ts`)
- **Server actions:** camelCase (`taskActions.ts`, `streakActions.ts`)
- **Utils:** camelCase (`dateHelpers.ts`, `taskUtils.ts`)
- **Types:** camelCase (`task.types.ts`, `streak.types.ts`)
- **Rutas Next.js App Router:** kebab-case (`forgot-password/`, `reset-password/`)
- **API routes:** plural/semántico (`admin/`, `user/timezone/`)

### Código
- **Variables y funciones:** camelCase
- **Clases, componentes, types:** PascalCase
- **Constantes globales:** UPPER_SNAKE_CASE
- **Enums (Prisma):** PascalCase (`PriorityEnum`, `BattleResult`)
- **Tablas BD:** snake_case via `@@map("table_name")`
- **Archivos de migración:** auto-generados por Prisma

## 2. Estructura de Archivos

### Server Action Pattern
```
"use server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function actionName(input: InputType): Promise<OutputType> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");
  // validación + lógica
  revalidatePath("/");
  return result;
}
```

### Component Pattern
```
"use client";
import { ... } from "...";

export default function ComponentName({ ... }: Props) {
  return <div>...</div>;
}
```

### Hook Pattern
```
"use client";
import { useState, useCallback } from "...";

export function useCustomHook(...) {
  const [state, setState] = useState(...);
  // lógica
  return { state, action };
}
```

## 3. Importaciones

Orden de imports (separados por línea en blanco):
1. React / Next.js
2. Librerías de terceros
3. Módulos internos (`@/src/...`)
4. Tipos (`@/src/types/...`)
5. Archivos de estilos (`./globals.css`)

```tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { prisma } from "@/src/lib/prisma";
import type { UserWithRole } from "@/src/types/auth";
```

## 4. Convenciones de Estilo

### Tailwind / daisyUI
- Usar clases de daisyUI (`btn`, `card`, `input-bordered`, `badge`) antes que Tailwind vanilla
- Preferir `bg-base-100/200/300` sobre colores absolutos
- Para componentes custom, usar `bg-base-100`, `text-base-content`, `border-base-300`
- Modales: usar `modal modal-open` de daisyUI

### TypeScript
- Preferir `type` sobre `interface` para props de componentes
- Usar `interface` para objetos de clase/response
- Tipos estrictos, evitar `any`
- Funciones server siempre tipadas con tipos explícitos de retorno

### Server Actions
- Siempre validar autenticación al inicio
- Usar `getCurrentUserId()` para server actions
- Usar `auth.api.getSession()` para API routes
- Revalidar paths después de mutaciones
- Manejar errores con `try/catch` y lanzar `Error` descriptivo

### API Routes
- Validar sesión con `auth.api.getSession({ headers: req.headers })`
- Retornar `NextResponse.json()` con status codes apropiados
- Verificar roles cuando sea necesario

### Optimistic Updates (Hooks)
- Efecto inmediato en UI (setState)
- Llamada server en `startTransition`
- Rollback en caso de error

## 5. Prisma

### Schema
- Todos los modelos con `@@map("snake_case")`
- Índices compuestos para queries frecuentes
- Relaciones explícitas con `@relation`
- `onDelete: Cascade` para dependencias de usuario

### Queries
- Usar `findFirst` para verificar existencia antes de update/delete
- Usar `$transaction` para operaciones batch
- Filtrar siempre por `userId` para segmentación multi-usuario

## 6. Variables de Entorno

```env
# Requeridas
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
AUTH_SECRET="..."

# OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# Email (opcional)
RESEND_API_KEY="..."
SMTP_HOST="smtp.gmail.com"
SMTP_EMAIL="..."
SMTP_PASSWORD="..."
```

## 7. Git

- Commits en español, descriptivos
- Sin commits de archivos generados (`.next/`, `node_modules/`, `.env`)
- Sin secretos ni tokens en el repositorio

## 8. Testing

- No hay test suite configurada actualmente
- E2E con Playwright configurado en `playwright.config.ts`
- Para type-check: `npx tsc --noEmit`

## 9. Scripts

| Comando | Uso |
|---|---|
| `pnpm dev` | Desarrollo |
| `pnpm build` | Build (ejecuta prisma generate) |
| `pnpm start` | Producción (ejecuta prisma migrate deploy) |
| `pnpm lint` | ESLint |
| `pnpm prisma:seed` | Seed de base de datos |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npx tsc --noEmit` | Type-check |

## 10. Path Alias

- `@/*` mapea a la raíz del proyecto
- Ejemplos: `@/src/lib/prisma`, `@/src/actions/taskActions`, `@/src/types/auth`
