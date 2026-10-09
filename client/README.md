# Cliente

Frontend de CampusHelp construido con React, TypeScript, Vite y React Router.
La aplicación incluye un layout compartido, navegación funcional, estado global
de casos y la bandeja Kanban.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Estructura

- `src/App.tsx`: composición de la aplicación y proveedor de rutas.
- `src/components/common/`: `MainLayout`, `Navbar` y `Sidebar`.
- `src/components/casos/`: tablero y tarjeta reutilizable.
- `src/context/CasosContext.tsx`: estado global y helpers de casos.
- `src/context/AuthContext.tsx`: sesión de prueba, roles y permisos de transición.
- `src/data/casos.mock.ts`: mock tipado de `GET /api/casos`.
- `src/pages/`: bandeja, registro, detalle y 404.
- `src/routes/AppRoutes.tsx`: configuración de rutas.
- `src/services/casosService.ts`: capa preparada para consumir la API.
- `src/types/index.ts`: interfaces y uniones del dominio.
- `src/styles.css` y `src/styles-layout.css`: estilos responsive.

Los estados del tablero usan los mismos valores del esquema de base de datos:
`Pendiente`, `En analisis`, `En atencion`, `En validacion` y `Cerrada`.

## Rutas

- `/` y `/bandeja`: tablero Kanban.
- `/mis-casos`: casos del usuario de prueba activo, ordenados por fecha de creación descendente.
- `/nuevo-caso`: formulario de registro.
- `/caso/:id`: detalle y cambio de estado.
- Cualquier ruta no existente muestra una página 404 con retorno a la bandeja.

El `CasosProvider` comparte los casos entre el formulario, la bandeja y el
detalle. Al registrar un caso se agrega de forma reactiva sin recargar la página.
La vista **Mis Casos** filtra exclusivamente por `usuario_id` del usuario
seleccionado y muestra ID, título, tipo, área, estado, prioridad y fecha de
creación. Cada registro enlaza a su detalle.

## HU-03: Bandeja de casos pendientes

La bandeja general está orientada a los roles `agente` y `administrador`.
Incluye una sección **Bandeja disponible** que:

- Lista los casos en `Pendiente` o que no tienen `agente_id`.
- Ordena por prioridad (`P1 urgente`, `P2 normal`, `P3 baja`) y luego por
  fecha de creación descendente.
- Permite que un agente tome un caso.
- Al tomarlo, asigna el agente actual, registra `fecha_asignacion` y mueve el
  caso a `En análisis`.
- Registra un evento `Caso asignado` en el historial local con el agente,
  estado anterior, estado nuevo y fecha.
- Impide tomar casos cuando el WIP de `En análisis` ya alcanzó 3.
- Oculta el tablero general para los solicitantes y los dirige a **Mis Casos**.

Los solicitantes de prueba están clasificados como estudiante, docente o
personal administrativo. El agente visualiza todos los casos disponibles y
los casos que forman parte del flujo Kanban.

## HU-04: Asignarse un caso

El botón **Asignarme** está disponible únicamente para el rol agente y solo
aparece en casos sin `agente_id`. Al usarlo, el caso se asigna al agente
actual, se registra la hora de asignación, pasa a `En análisis` y desaparece
de la bandeja disponible. El detalle muestra el evento en el historial de
actividad.

## HU-05: Cambiar estado del caso

El detalle permite avanzar un caso mediante la secuencia:

`Pendiente` → `En análisis` → `En atención` → `En validación` → `Cerrada`.

Un agente solo puede avanzar casos que tenga asignados y únicamente al
siguiente estado. El administrador puede gestionar cualquier transición
operativa. Cada cambio valida el límite WIP del estado destino, actualiza el
caso y registra un evento `Cambio de estado` con estado anterior, estado nuevo,
usuario y fecha en el historial local.

## Roles y permisos

El selector de usuario de la barra superior simula cuatro perfiles:

| Rol | Permisos de flujo |
|---|---|
| Solicitante | Registrar casos y consultar información |
| Agente | Tomar casos disponibles y avanzar el flujo completo respetando WIP |
| Administrador | Gestionar cualquier transición |

El frontend oculta o informa las acciones no permitidas para mejorar la
experiencia. En producción, estas reglas deben validarse también en el backend
con la sesión autenticada; nunca se debe confiar únicamente en los controles
visuales del navegador.

## Funciones de gestión disponibles

- El administrador puede editar tipo, título, descripción, prioridad, área,
  usuario y categoría.
- El administrador puede eliminar un caso con confirmación explícita.
- El administrador puede asignar o desasignar un agente.
- Los agentes pueden cambiar estados únicamente dentro de las transiciones
  permitidas y sobre casos que hayan tomado.
- El detalle muestra errores de autorización y conserva la navegación sin
  recargar la aplicación.

Estas operaciones funcionan sobre el `CasosContext` y los mocks actuales.
Cuando se conecte PostgreSQL, deberán enlazarse con endpoints protegidos,
por ejemplo `PATCH /api/casos/:id`, `DELETE /api/casos/:id` y
`PATCH /api/casos/:id/asignacion`. El servidor debe repetir las validaciones
de rol y registrar las acciones en `historial`.

## HU-01: Registrar Incidente o Solicitud

La historia HU-01 queda cubierta en el mock frontend:

- Tipo, área, categoría, título y solicitante son campos visibles y obligatorios.
- La descripción se valida con un mínimo de 10 caracteres y muestra el error
  sin insertar el caso cuando no cumple.
- El formulario inicia con prioridad `P1 urgente` y todos los nuevos casos se
  crean automáticamente en estado `Pendiente`.
- Se genera un ID incremental para el mock, se redirige a la bandeja y se
  muestra confirmación del caso creado.

La persistencia en PostgreSQL queda pendiente de conectar el formulario con
`POST /api/casos`; la validación equivalente ya existe en el controlador del
backend y deberá conservarse al hacer esa integración.

## Mock de casos

`mockCases` simula la respuesta JSON del endpoint `GET /api/casos`. Cada registro
incluye `id`, `tipo`, `titulo`, `descripcion`, `prioridad`, `estado`,
`usuario_id`, `categoria_id`, `agente_id`, `fecha_creacion`,
`fecha_asignacion` y `fecha_cierre`. También incorpora `area` para identificar
la distribución de datos en Hardware, Software, Red y conectividad, Cuentas y
acceso y Plataformas académicas.

El tablero inicia con un único caso `Expedite`, respetando el máximo operativo
de un caso urgente. Los casos se distribuyen para mostrar los límites WIP
completos en En análisis (3), En atención (3) y En validación (2).

## Producción

```bash
npm run build
npm run preview
```
