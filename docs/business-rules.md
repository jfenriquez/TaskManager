# Reglas de Negocio — TaskManager "Si No Lo Hace Llora"

## 1. Autenticación y Roles

### 1.1 Registro
- El registro requiere email, contraseña y nombre.
- Se envía un email de verificación automáticamente.
- El usuario no puede acceder al dashboard hasta verificar su email.
- Si el email ya existe, se rechaza el registro.

### 1.2 Asignación de Roles
| Condición | Rol asignado |
|---|---|
| Primer usuario registrado en el sistema | ADMIN |
| Email termina en `@tuempresa.com` | MODERATOR |
| Cualquier otro caso | USER |

### 1.3 Permisos por Rol
| Rol | Acceso |
|---|---|
| USER | CRUD propio de tareas, categorías, perfil, temporizador, módulo Hyde-Slayer |
| MODERATOR | Todo lo de USER + capacidades de moderación (reservado para futuro) |
| ADMIN | Todo lo de MODERATOR + panel de administración (`/admin`) |

### 1.4 Sesión
- La sesión se maneja via better-auth con Prisma adapter.
- Las server actions verifican la sesión con `getCurrentUserId()`.
- Las API routes verifican con `auth.api.getSession({ headers })`.

## 2. Gestión de Tareas

### 2.1 CRUD
- Un usuario solo puede ver, crear, editar y eliminar sus propias tareas.
- El título es obligatorio (validado en server action `createTask`).
- La prioridad puede ser LOW, MEDIUM o HIGH (enum `PriorityEnum`).
- El campo `ExecutionDate` determina en qué día aparece la tarea.
- Si `ExecutionDate` es null, la tarea se muestra en el día actual (`getTasksXDay`).
- Al completar una tarea (`updateStatusTask`), se actualiza la racha del usuario.

### 2.2 Categorías
- Cada usuario tiene categorías propias.
- Si un usuario no tiene categorías, se crean 8 por defecto al llamar `getCategories()`:
  Trabajo, Tareas del hogar, Ocio y entretenimiento, Comidas y bebidas, Sueño, Desplazamientos, Estudio, Cuidado personal.
- Cada categoría tiene un nombre y un color HEX.
- Al eliminar una categoría, las tareas asociadas quedan sin categoría (`categoryId = null`).

### 2.3 Vista por Día
- `getTasksXDay()` usa la zona horaria del usuario para determinar el rango del día.
- Devuelve tareas con `ExecutionDate` igual al día actual O `ExecutionDate = null`.
- Orden: `ExecutionDate ASC`, `priority DESC`, `createdAt ASC`.

### 2.4 Vista por Fecha
- `getTasksByDate(dateStr)` busca tareas exactas en una fecha específica (formato YYYY-MM-DD).

### 2.5 Importación Masiva
- `importTasks()` acepta un array de tareas y las crea en una transacción Prisma.
- Revalida la ruta `/TasksTable`.

## 3. Temporizador (Timer)

### 3.1 Inicio (`startTaskTimer`)
- Usa segundos desde `timerRemainingSeconds` (reanudación) si existe.
- Si no, usa `minutes` pasado como parámetro.
- Si no, usa `task.timerMinutes` de la tarea.
- Calcula `timerEndsAt = now + seconds*1000`.
- Setea `timerRunning = true` y limpia `timerRemainingSeconds`.

### 3.2 Pausa (`pauseTaskTimer`)
- Calcula segundos restantes: `max(0, ceil((timerEndsAt - now) / 1000))`.
- Guarda en `timerRemainingSeconds`.
- Setea `timerRunning = false`, limpia `timerEndsAt`.

### 3.3 Detención (`stopTaskTimer`)
- Limpia todos los campos de timer: `timerStartedAt`, `timerEndsAt`, `timerRemainingSeconds`, `timerRunning = false`.

### 3.4 Notificaciones al Finalizar
- El hook `useTimer` detecta cuando `remainingMs` llega a 0.
- Dispara `onTimerEnd` que ejecuta:
  - Notificación del navegador (`showNotification`)
  - Sonido (`playSound("end")`)
  - Vibración (`vibrate([200, 100, 200])`)

## 4. Rachas (Streak)

### 4.1 Cálculo
- Se basa en tareas completadas en los últimos 365 días.
- Por cada día, cuenta cuántas tareas se completaron ese día.
- Meta diaria: configurable via cookie (1-50, default 1).
- Un día cuenta para la racha si `tareas_completadas >= meta_diaria`.
- La racha actual empieza desde hoy; si hoy no cumple la meta, comienza desde ayer.
- Se cuentan días consecutivos hacia atrás hasta encontrar uno que no cumpla la meta.

### 4.2 Milestones
| Días | Icono | Nombre |
|---|---|---|
| 7 | 🥉 | Bronce |
| 14 | 🥈 | Plata |
| 30 | 🥇 | Oro |
| 60 | ⭐ | Estrella |
| 100 | 🌟 | Superestrella |
| 200 | 💎 | Diamante |
| 365 | 👑 | Leyenda |

### 4.3 Íconos por Nivel de Racha
| Rango | Emoji | Color | Label |
|---|---|---|---|
| 0-2 | – | gray | Sin racha |
| 3-6 | ✨ | yellow | Chispa |
| 7-29 | 🔥 | orange | Llama |
| 30+ | 🔥 | red | Fuego |

## 5. Módulo Hyde-Slayer

### 5.1 Perfil del Jugador
- Cada usuario tiene un `PlayerProfile` (creado bajo demanda).
- Stats: level, xp, coins, discipline.
- Fórmula de XP por nivel: `xpMax = level * 200`.

### 5.2 Combate (BattleMode)
- El jugador enfrenta enemigos (`HydeEnemy`) con HP, ataque, defensa.
- Resultados posibles: VICTORY, DEFEAT, FLEE.
- Las batallas registran daño infligido/recibido, XP y monedas ganadas.
- Enemigos pueden ser jefes de castillo (`isBoss = true`).

### 5.3 Castillo (Castle)
- Progresión por niveles de castillo (`CastleLevel`).
- Cada nivel tiene un jefe asociado (`bossId`).
- XP requerido para desbloquear cada nivel.
- El jugador tiene progreso individual (`CastleProgress`): derrotado, mejores tiempos, intentos.

### 5.4 Objetivos (Goals)
- Dos tipos:
  1. **Objetivo mensual (legacy):** un solo objetivo por mes (`month` field set).
  2. **Objetivos Hyde-Slayer:** múltiples objetivos con `month = null`, propósito, visualización, respuestas Hyde, misiones.
- CRUD completo via `goalActions.ts`.

### 5.5 Pactos (Pacts)
- Desafíos con duración y dificultad (EASY, MEDIUM, HARD, IMPOSSIBLE).
- Recompensas: XP, monedas, disciplina.
- Estados: ACTIVE, COMPLETED, FAILED, CANCELLED.
- Un jugador puede tener múltiples pactos activos.

### 5.6 Inventario (Items)
- Tipos: WEAPON, ARMOR, CONSUMABLE, KEY_ITEM, BOOST.
- Rarezas: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY.
- Items con precio de compra/venta y efectos (JSON).
- Un jugador puede equipar items (`equipped = true`).

### 5.7 Vitamentes
- Afirmaciones positivas predefinidas con categoría.
- Los jugadores registran logs de vitamentes completados.

### 5.8 Ejercicios de Relajación
- Ejercicios con nombre, descripción, duración y tipo.
- Los jugadores registran logs con duración real completada.

### 5.9 Logros (Achievements)
- Categorías: COMBAT, GOALS, PACTS, VITAMENTES, STREAK, GENERAL.
- Condiciones de desbloqueo en JSON.
- Recompensas: XP y monedas.

## 6. Estadísticas (Profile)

### 6.1 Métricas Calculadas
- `totalTasks`, `completedTasks`, `activeTasks`
- `totalTimerMinutes` — suma de `timerMinutes` de todas las tareas
- `streak` — racha actual del usuario
- `memberSince` — fecha de creación del usuario
- `timezone` — zona horaria del usuario

### 6.2 Distribución por Categoría
- Solo tareas completadas.
- Minutos y cantidad por categoría.
- Incluye "Sin categoría" para tareas sin `categoryId`.
- Soporta filtro por rango de fechas (startDate/endDate).

### 6.3 Top 5 por Tiempo
- Tareas completadas con `timerMinutes > 0`.
- Ordenadas descendente, top 5.
- Incluye nombre de categoría si tiene.

### 6.4 Heatmap de Actividad
- Últimos 30 días.
- Muestra tareas completadas por día.
- Intensidad de color basada en máximo del período.

## 7. Zona Horaria

- Default: `"America/Bogota"`.
- El usuario puede cambiar su zona horaria desde el perfil.
- Se persiste en BD (`user.timezone`) via API `/api/user/timezone`.
- Todas las queries de tareas por día usan la zona horaria del usuario.
- El hook `useUserTimezone` primero intenta leer del servidor; fallback a `Intl.DateTimeFormat().resolvedOptions().timeZone`.

## 8. Temas Visuales

- 11 temas disponibles: light, dark, cupcake, retro, luxury, dim, coffee, lemonade, wireframe, fantasy, pastel.
- Tema default: `"dim"`.
- Persistencia en localStorage bajo key `"theme"`.
- Aplicado via atributo `data-theme` en `<html>`.

## 9. Seguridad

### 9.1 Headers HTTP (next.config.ts)
- `X-Frame-Options: DENY` — previene clickjacking
- `X-Content-Type-Options: nosniff` — previene MIME sniffing
- `Strict-Transport-Security` — HSTS por 2 años
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — bloquea cámara, micrófono, geolocalización

### 9.2 Protección de Rutas
- Server actions: verifican sesión via `getCurrentUserId()`
- API admin: verifica sesión + rol ADMIN
- Página admin: verifica rol en cliente via `useAuth().isAdmin()`
- Página hyde-slayer: redirige a `/login` si no autenticado

## 10. Notificaciones

- Sonidos: start.mp3, end.mp3, coins.mp3, reset.mp3 en `/public/sounds/`
- Notificación browser: requiere permiso `Notification.requestPermission()`
- Vibración: `navigator.vibrate(pattern)`
- Volumen: start=0.7, end=0.8, coins=0.7, reset=0.8

## 11. Email

- En desarrollo: solo log en consola (`console.log`)
- En producción: envía via nodemailer (SMTP)
- Tipos: verificación de email, restablecimiento de contraseña
- Provider alternativo: Resend

## 12. Validaciones

### Tareas
- Título: requerido, no vacío (validado en server action y formulario)
- Prioridad: enum LOW | MEDIUM | HIGH (default MEDIUM)
- Timer: minutos debe ser número positivo

### Categorías
- Nombre: requerido, no vacío
- Color: HEX string, default `#3b82f6`

### Zona Horaria
- Debe ser string no vacío (validado en API PATCH)

### Meta Diaria (Streak)
- Rango: 1 a 50 (clamped en server action)
- Persistencia: cookie httpOnly por 1 año
