# PRD — Task Manager "Si No Lo Hace Llora"

## 1. Resumen Ejecutivo

Aplicación web full-stack de gestión diaria de tareas con temporizador, categorización por prioridades, autenticación social, panel de administración y perfil detallado con estadísticas. Construida con Next.js 16, React 19, TypeScript, Tailwind CSS 4, daisyUI 5, y PostgreSQL.

## 2. Objetivos del Producto

- Proveer una herramienta simple e intuitiva para la gestión de tareas diarias
- Incorporar un temporizador regresivo por tarea con notificaciones multimodales (sonido, navegador, vibración)
- Permitir organización por prioridades y categorías
- Ofrecer una vista mensual tipo tabla con importación/exportación Excel
- Brindar estadísticas detalladas del desempeño del usuario (rachas, heatmap, distribución)
- Soportar autenticación segura con email y proveedores sociales (Google, GitHub)
- Habilitar roles de usuario (USER, MODERATOR, ADMIN) con panel de administración
- Personalización mediante 11 temas visuales y selector de zona horaria

## 3. Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | ^16.0.7 |
| UI | React | ^19.2.1 |
| Lenguaje | TypeScript | ^5.9.3 |
| Estilos | Tailwind CSS + daisyUI | ^4 / ^5.3.8 |
| ORM | Prisma | ^6.18.0 |
| BD | PostgreSQL | — |
| Auth | better-auth | ^1.3.34 |
| Tablas | @tanstack/react-table | ^8.21.3 |
| Fechas | date-fns | ^4.1.0 |
| Animaciones | framer-motion, GSAP, lottie-react | — |
| Íconos | lucide-react, react-icons | — |
| Formularios | react-hook-form | ^7.65.0 |
| Email | Resend | ^6.3.0 |
| Excel | xlsx | ^0.18.5 |
| Cifrado | bcryptjs, jose | — |

## 4. Audiencia Objetivo

- **Usuarios primarios:** Personas que necesitan organizar sus tareas diarias con seguimiento de tiempo
- **Usuarios secundarios:** Administradores que gestionan usuarios y moderan contenido
- **Casos de uso típicos:** Lista de pendientes diaria, temporizador pomodoro por tarea, seguimiento de productividad mensual

## 5. Funcionalidades

### 5.1 MVP (Core)
- **Autenticación:** Registro/login email/password, verificación de email, OAuth Google/GitHub, recuperación de sesión
- **CRUD de tareas:** Crear, editar, eliminar, marcar completadas, eliminación masiva de completadas
- **Prioridades:** LOW, MEDIUM, HIGH con badges visuales
- **Categorías:** CRUD de categorías por usuario con color HEX, asignación a tareas, creación automática de categorías por defecto
- **Filtros:** Vista all/active/completed
- **Temporizador:** Iniciar, pausar, detener conteo regresivo por tarea; notificaciones al finalizar (sonido + browser + vibrate)
- **Panel lateral:** Tiempo total estimado, reloj en vivo, hora estimada de finalización
- **Perfil:** Estadísticas (totales, completadas, activas, tiempo), racha actual, heatmap 30 días, donut de categorías, barra de prioridades, top 5 tareas por tiempo, selector de zona horaria

### 5.2 Post-MVP
- **Vista tabla mensual:** CRUD en tabla con @tanstack/react-table, ordenamiento por columnas
- **Importación/exportación Excel:** Subir `.xlsx` para crear tareas en lote, exportar tabla mensual
- **Reproductor de música:** 4 pistas integradas, controles play/pause/next/prev/volumen/progreso
- **Ticker motivacional:** Marquee con frases motivacionales en el navbar
- **Avatar animado (Lottie):** Emoji que refleja la relación tareas completadas vs totales
- **Temas visuales:** 11 temas daisyUI con selector animado, persistencia en localStorage

### 5.3 Administración
- **Panel admin:** Vista de todos los usuarios, roles, acciones administrativas
- **API protegida:** Ruta `/api/admin` con verificación de rol ADMIN

## 6. Roles de Usuario

| Rol | Permisos |
|---|---|
| USER | CRUD propio de tareas, categorías, perfil, uso del temporizador |
| MODERATOR | USER + capacidades de moderación (a definir) |
| ADMIN | MODERATOR + panel de administración, gestión de usuarios |

- El primer usuario registrado obtiene rol ADMIN automáticamente
- Usuarios con email `@tuempresa.com` obtienen rol MODERATOR

## 7. Arquitectura del Sistema

### 7.1 Frontend (App Router)
- **Públicas:** Landing page (Hero, Features, CTA, Footer), login, register
- **Privadas:** Tasks (dashboard principal), TasksTable (vista mensual), profile, categories, admin
- **Layout:** Navbar responsivo, ThemeProvider, drawer lateral en móvil

### 7.2 Backend (Server Actions + API Routes)
- **Server Actions:** CRUD de tareas, control del temporizador, ubicadas en `src/actions/taskActions.ts`
- **API Routes:** Auth (catch-all `[...all]`), admin, user/timezone
- **Auth:** Sesiones vía `better-auth` con Prisma adapter, middleware de verificación de email

### 7.3 Base de Datos (PostgreSQL + Prisma)
- **Modelos:** User, Tasks, Category, Session, Account, Verification, Jwks
- **Enums:** PriorityEnum (LOW, MEDIUM, HIGH), Role (USER, ADMIN, MODERATOR)
- **Relaciones:** User 1:N Tasks, User 1:N Categories, Category 1:N Tasks

## 8. Flujo del Usuario

1. **Llegada** → Landing page (si no autenticado) o dashboard de tareas (si autenticado)
2. **Registro/Login** → Email/password u OAuth → Verificación de email (si aplica)
3. **Dashboard** → CRUD de tareas, filtros, temporizador, panel lateral
4. **Organización** → Categorías, prioridades, vista tabla mensual
5. **Seguimiento** → Perfil con estadísticas, heatmap, rachas, temporizador por tarea
6. **Personalización** → Tema visual, zona horaria, reproductor de música

## 9. Criterios de Éxito (KPIs)

- **Tareas creadas por usuario/día** → métrica de engagement
- **Tareas completadas vs creadas** → tasa de finalización
- **Uso del temporizador** → tiempo promedio por tarea
- **Retención semanal** → usuarios que regresan a los 7 días
- **Velocidad de carga** → Lighthouse score > 90

## 10. Limitaciones Técnicas

- No hay tests automatizados ni CI/CD configurados
- Sin límite de rate limiting en API routes
- Las notificaciones push requieren permisos explícitos del navegador
- La verificación de email depende del servicio Resend (límite del plan gratuito)

## 11. Próximos Pasos (Roadmap)

- [ ] Implementar suite de tests (unitarios + e2e)
- [ ] Agregar paginación en tareas
- [ ] Soporte multi-idioma (i18n)
- [ ] Modo oscuro/claro independiente del tema
- [ ] WebSockets para temporizador en tiempo real multi-sesión
- [ ] App móvil (React Native o PWA)
- [ ] Compartir tareas entre usuarios
- [ ] Recordatorios por email/notificación push programados
