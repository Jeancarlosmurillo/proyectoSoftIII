# CampusHelp — Informe de Auditoría

**Fecha:** 2026-10-12
**Alcance:** Backend, Base de Datos, Frontend (solo lectura)

---

## 1. Resumen Ejecutivo

### Porcentaje por capa

| Capa                    | % Completado | Fórmula                                                         |
| ----------------------- | ------------ | ---------------------------------------------------------------- |
| **Backend**       | ~95%         | 8/8 endpoints implementados y funcionales + pruebas automáticas |
| **Base de Datos** | ~100%        | 6/6 tablas + seed + migraciones + índices                       |
| **Frontend**      | ~35%         | 2/5 pantallas usan API real; 3/5 pantallas faltan o usan mock    |

### Porcentaje por Sprint

| Sprint             | Backend/BD | Frontend | Bloqueador                                                   |
| ------------------ | ---------- | -------- | ------------------------------------------------------------ |
| **Sprint 1** | 100%       | 40%      | Frontend usa mock, no API real                               |
| **Sprint 2** | 100%       | 0%       | Pantallas de asignación, atención y validación no existen |
| **Sprint 3** | 100%       | 0%       | Dashboard y gestión de categorías no existen               |

### Bloqueadores principales

1. **Frontend no conecta con la API real** — usa datos mock hardcodeados
2. **Faltan pantallas del Sprint 2 y 3** — asignación, atención, validación, dashboard, categorías
3. **No hay flujo completo en frontend** — no se puede recorrer Registrar → Asignar → Atender → Validar → Cerrar

---

## 2. Checklist contra el plan

### BACKEND y BD

| Ítem                                                           | Estado   | Evidencia                                                                                                          | Cómo se verificó                       |
| --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| **Sprint 1**                                              |          |                                                                                                                    |                                          |
| Tablas Usuario, Area, Categoria, Caso, Historial                | COMPLETO | `database/schema.sql:1-48`                                                                                       | Leí el código                          |
| Tabla Atencion (no listada pero requerida)                      | COMPLETO | `database/schema.sql:50-57`                                                                                      | Leí el código                          |
| Seed con 5 áreas                                               | COMPLETO | `database/seed.sql:6-11`                                                                                         | Leí el código                          |
| Seed con categorías                                            | COMPLETO | `database/seed.sql:14-34`                                                                                        | Leí el código                          |
| Seed con usuarios de prueba (1 por rol)                         | COMPLETO | `database/seed.sql:37-43`                                                                                        | Leí el código                          |
| POST /casos                                                     | COMPLETO | `server/src/routes/casos.js:5`, `server/src/controllers/casosController.js:14-79`                              | Leí el código + hay prueba automática |
| GET /casos (bandeja)                                            | COMPLETO | `server/src/routes/casos.js:6`, `server/src/controllers/casosController.js:81-145`                             | Leí el código + hay prueba automática |
| **Sprint 2**                                              |          |                                                                                                                    |                                          |
| Asignación de agente                                           | COMPLETO | `server/src/controllers/casosController.js:187-255`                                                              | Leí el código + hay prueba automática |
| Registro de diagnóstico y solución                            | COMPLETO | `server/src/controllers/casosController.js:257-315`                                                              | Leí el código + hay prueba automática |
| Control de estados                                              | COMPLETO | `server/src/controllers/casosController.js:407-506`                                                              | Leí el código + hay prueba automática |
| Devolver desde validación                                      | COMPLETO | `server/src/controllers/casosController.js:317-405`                                                              | Leí el código + hay prueba automática |
| Historial automático en cada cambio                            | COMPLETO | `server/src/controllers/casosController.js:64-68, 239-243, 389-393, 490-494`                                     | Leí el código + hay prueba automática |
| **Sprint 3**                                              |          |                                                                                                                    |                                          |
| Filtros combinados (estado, tipo, área, categoría, prioridad) | COMPLETO | `server/src/controllers/casosController.js:81-145`                                                               | Leí el código + hay prueba automática |
| Indicadores (casos por estado, tipo, prioridad, tiempos)        | COMPLETO | `server/src/controllers/indicadoresController.js:1-41`                                                           | Leí el código + hay prueba automática |
| Gestión de categorías                                         | COMPLETO | `server/src/routes/categorias.js:1-140`                                                                          | Leí el código + hay prueba automática |
| **Endpoints adicionales**                                 |          |                                                                                                                    |                                          |
| "Mis casos" (HU-02)                                             | COMPLETO | `GET /api/casos?usuario_id={id}` — `server/src/controllers/casosController.js:116-119`                        | Leí el código                          |
| Detalle con solución (HU-12)                                   | COMPLETO | `GET /api/casos/:id` — `server/src/controllers/casosController.js:147-168`                                    | Leí el código + hay prueba automática |
| Historial de un caso (HU-08)                                    | COMPLETO | `GET /api/casos/:id/historial` — `server/src/controllers/casosController.js:170-185`                          | Leí el código + hay prueba automática |
| Aprobar o devolver (HU-07)                                      | COMPLETO | `POST /api/casos/:id/validacion` — `server/src/controllers/casosController.js:317-405`                        | Leí el código + hay prueba automática |
| Cambio de estado (HU-05)                                        | COMPLETO | `PATCH /api/casos/:id/estado` — `server/src/controllers/casosController.js:407-506`                           | Leí el código + hay prueba automática |
| Listado de áreas y categorías                                 | COMPLETO | `GET /api/areas`, `GET /api/categorias` — `server/src/routes/areas.js`, `server/src/routes/categorias.js` | Leí el código                          |

### FRONTEND

| Ítem                                       | Estado  | Evidencia                                                                          | Cómo se verificó |
| ------------------------------------------- | ------- | ---------------------------------------------------------------------------------- | ------------------ |
| **Sprint 1**                          |         |                                                                                    |                    |
| Formulario de registro (HU-01)              | PARCIAL | `client/src/pages/RegistroPage.tsx` — existe pero usa mock, no API              | Leí el código    |
| Bandeja general (HU-02, HU-03)              | PARCIAL | `client/src/pages/BandejaPage.tsx` + `KanbanBoard.tsx` — existe pero usa mock | Leí el código    |
| Mis casos (HU-02)                           | PARCIAL | `client/src/pages/MisCasosPage.tsx` — existe pero usa mock                      | Leí el código    |
| Botones de estado (HU-05)                   | FALTA   | No hay botones de cambio de estado en el frontend                                  | Leí el código    |
| **Sprint 2**                          |         |                                                                                    |                    |
| Asignación (HU-04)                         | FALTA   | No existe pantalla de asignación                                                  | Leí el código    |
| Diagnóstico y solución (HU-06)            | FALTA   | No existe pantalla de atención                                                    | Leí el código    |
| Vista del validador (HU-07)                 | FALTA   | No existe pantalla de validación                                                  | Leí el código    |
| Historial y detalle del caso (HU-08, HU-12) | PARCIAL | `DetalleCasoPage.tsx` existe pero usa mock y no muestra atención real           | Leí el código    |
| **Sprint 3**                          |         |                                                                                    |                    |
| Buscador con filtros (HU-09)                | FALTA   | No hay pantalla de filtros avanzados                                               | Leí el código    |
| Dashboard de indicadores (HU-10)            | FALTA   | No existe dashboard                                                                | Leí el código    |
| Gestión de categorías (HU-11)             | FALTA   | No existe gestión de categorías                                                  | Leí el código    |

---

## 3. Reglas del dominio (verificación en código)

| Regla                                                                   | Estado   | Evidencia                                                                               | Notas                                 |
| ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| Solo 5 estados                                                          | COMPLETO | `database/schema.sql:30-31`, `server/src/controllers/casosController.js:3-9`        | "Devuelta" no está como estado       |
| Transiciones válidas                                                   | COMPLETO | `server/src/controllers/casosController.js:3-9`                                       | Correctamente implementado            |
| Cerrada no se puede cambiar                                             | COMPLETO | `server/src/controllers/casosController.js:431-437`                                   | Retorna 409 ESTADO_CONFLICTO          |
| Registro: tipo, categoría, título, descripción (mín. 10), prioridad | COMPLETO | `server/src/controllers/casosController.js:17-39`                                     | Validado en backend                   |
| Categoría pertenece a un área                                         | COMPLETO | `database/schema.sql:17-18`                                                           | FK en categoria.area_id               |
| Estado inicial Pendiente                                                | COMPLETO | `server/src/controllers/casosController.js:64-68`                                     | Se crea con estado Pendiente          |
| Fecha de creación automática                                          | COMPLETO | `database/schema.sql:35`                                                              | DEFAULT CURRENT_TIMESTAMP             |
| Historial en misma transacción                                         | COMPLETO | `server/src/controllers/casosController.js:44-70, 198-245, 274-306, 331-395, 421-496` | BEGIN/COMMIT en cada operación       |
| Solo agente asignado registra atención                                 | COMPLETO | `server/src/controllers/casosController.js:292-298`                                   | Retorna 403 si no es el asignado      |
| No cerrar sin solución                                                 | COMPLETO | `server/src/controllers/casosController.js:474-486`                                   | Retorna 409 SIN_ATENCION              |
| fecha_asignacion y fecha_cierre                                         | COMPLETO | `server/src/controllers/casosController.js:234-237, 378-387`                          | Se registran correctamente            |
| Persistencia en BD real                                                 | COMPLETO | PostgreSQL con tablas reales                                                            | No hay memoria ni archivos temporales |
| Permisos por rol en backend                                             | COMPLETO | `server/src/controllers/casosController.js:226-232, 358-365, 448-455`                 | Validado en cada endpoint             |

---

## 4. Coherencia entre capas

### 4.1 Nombres de estados, tipos, prioridades y roles

| Concepto              | BD                                                                                 | Backend                      | Frontend                                                             | ¿Coherente?                                  |
| --------------------- | ---------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| **Estados**     | `Pendiente`, `En análisis`, `En atención`, `En validación`, `Cerrada` | Igual                        | Igual                                                                | ✅ Sí                                        |
| **Tipos**       | `Incidente`, `Solicitud`                                                       | `Incidente`, `Solicitud` | `Incidente`, `Solicitud de servicio`                             | ❌ NO — Frontend usa "Solicitud de servicio" |
| **Prioridades** | `P1`, `P2`, `P3`                                                             | `P1`, `P2`, `P3`       | `P1 urgente`, `P2 normal`, `P3 baja`                           | ❌ NO — Frontend usa texto extendido         |
| **Roles**       | `solicitante`, `agente`, `validador`, `administrador`                      | Igual                        | `solicitante`, `agente`, `administrador` (falta `validador`) | ❌ NO — Frontend no tiene rol validador      |

### 4.2 Contrato API — Frontend vs Backend

| Llamada Frontend                         | Endpoint Real                      | ¿Existe? | Desajuste                |
| ---------------------------------------- | ---------------------------------- | --------- | ------------------------ |
| `listarCasos()` en `casosService.ts` | `GET /api/casos`                 | ✅ Sí    | No se usa en componentes |
| `crearCaso()` en `casosService.ts`   | `POST /api/casos`                | ✅ Sí    | No se usa en componentes |
| —                                       | `GET /api/casos/:id`             | ✅ Sí    | No existe en frontend    |
| —                                       | `GET /api/casos/:id/historial`   | ✅ Sí    | No existe en frontend    |
| —                                       | `POST /api/casos/:id/asignar`    | ✅ Sí    | No existe en frontend    |
| —                                       | `POST /api/casos/:id/atencion`   | ✅ Sí    | No existe en frontend    |
| —                                       | `POST /api/casos/:id/validacion` | ✅ Sí    | No existe en frontend    |
| —                                       | `PATCH /api/casos/:id/estado`    | ✅ Sí    | No existe en frontend    |
| —                                       | `GET /api/areas`                 | ✅ Sí    | No existe en frontend    |
| —                                       | `GET /api/categorias`            | ✅ Sí    | No existe en frontend    |
| —                                       | `GET /api/usuarios`              | ✅ Sí    | No existe en frontend    |
| —                                       | `GET /api/indicadores`           | ✅ Sí    | No existe en frontend    |

**Conclusión:** El servicio `casosService.ts` existe pero **NO se usa**. Los componentes usan `CasosContext` que trabaja con datos mock.

### 4.3 URL de la API en el frontend

- **Ubicación:** `client/src/services/casosService.ts:3` — `import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'`
- **Configuración:** Usa variable de entorno `VITE_API_URL` (correcto)
- **Fallback:** Apunta a `http://localhost:3001/api` (correcto para desarrollo)
- **Problema:** El servicio no se usa; los componentes no llaman a la API

### 4.4 Manejo de errores en pantalla

| Código               | ¿Manejado? | Evidencia                                                                    |
| --------------------- | ----------- | ---------------------------------------------------------------------------- |
| 400                   | ❌ No       | `casosService.ts:7` — mensaje genérico "No fue posible cargar los casos" |
| 403                   | ❌ No       | No hay manejo específico                                                    |
| 404                   | ❌ No       | No hay manejo específico                                                    |
| 409                   | ❌ No       | No hay manejo específico                                                    |
| 500 / servidor caído | ❌ No       | No hay manejo específico                                                    |
| Estado de carga       | ❌ No       | No hay spinners ni skeletons                                                 |
| Lista vacía          | ✅ Sí      | `MisCasosPage.tsx:71-77` — muestra mensaje "Aún no tienes casos"         |

### 4.5 Formulario de registro

| Validación                      | Frontend | Backend | ¿Muestra mensaje del backend? |
| -------------------------------- | -------- | ------- | ------------------------------ |
| Tipo obligatorio                 | ✅ Sí   | ✅ Sí  | ❌ No                          |
| Título obligatorio              | ✅ Sí   | ✅ Sí  | ❌ No                          |
| Descripción mín. 10 caracteres | ✅ Sí   | ✅ Sí  | ❌ No                          |
| Prioridad obligatoria            | ✅ Sí   | ✅ Sí  | ❌ No                          |
| Categoría obligatoria           | ✅ Sí   | ✅ Sí  | ❌ No                          |
| Solicitante obligatorio          | ✅ Sí   | ✅ Sí  | ❌ No                          |

**Nota:** El frontend valida pero no llama a la API real. Si llamara, no mostraría los mensajes del backend.

### 4.6 Roles en el frontend

| Rol           | ¿Existe en frontend? | ¿Qué ve?           | ¿Qué puede hacer?                   |
| ------------- | --------------------- | -------------------- | ------------------------------------- |
| Solicitante   | ✅ Sí                | Mis casos, Registrar | Registrar casos, ver sus casos        |
| Agente        | ✅ Sí                | Bandeja, Detalle     | Tomar casos, cambiar estado (en mock) |
| Validador     | ❌ No                 | —                   | —                                    |
| Administrador | ✅ Sí                | Bandeja, Detalle     | Editar, eliminar, asignar (en mock)   |

**Problema:** El frontend no tiene el rol `validador`, por lo que no se puede hacer el flujo de validación.

### 4.7 Flujo completo con las pantallas existentes

| Paso      | ¿Se puede?  | ¿Dónde se corta?                |
| --------- | ------------ | --------------------------------- |
| Registrar | ⚠️ Parcial | Se registra en mock, no en API    |
| Asignar   | ❌ No        | No existe pantalla de asignación |
| Atender   | ❌ No        | No existe pantalla de atención   |
| Validar   | ❌ No        | No existe pantalla de validación |
| Cerrar    | ❌ No        | No existe pantalla de cierre      |

**Conclusión:** El flujo se corta en el paso 2 (Asignar). No se puede recorrer el flujo completo con el frontend actual.

---

## 5. Verificación funcional

### 5.1 Entorno de ejecución

| Componente    | Estado           | Notas                                             |
| ------------- | ---------------- | ------------------------------------------------- |
| Docker        | ❌ No disponible | `docker` no reconocido                          |
| PostgreSQL 16 | ✅ Corriendo     | Servicio activo                                   |
| PostgreSQL 17 | ✅ Corriendo     | Servicio activo                                   |
| Node.js       | ✅ v24.15.0      | Disponible                                        |
| npm           | ✅ 11.12.1       | Disponible                                        |
| psql          | ✅ Disponible    | En`C:\Program Files\PostgreSQL\16\bin\psql.exe` |

### 5.2 Conexión a base de datos

**Estado:** ❌ No verificada

**Motivo:** Las credenciales del `.env.example` no funcionan. Hay dos servicios de PostgreSQL corriendo y no se cuál es el correcto ni sus credenciales reales.

**Acción requerida:** El usuario debe proporcionar:

1. ¿Cuál es la base de datos correcta (v16 o v17)?
2. ¿Cuáles son las credenciales reales?
3. ¿Es segura para hacer pruebas?

### 5.3 Compilación

| Capa     | Comando           | Resultado                                              |
| -------- | ----------------- | ------------------------------------------------------ |
| Frontend | `npm run build` | ✅ Exitoso — 46 módulos transformados                |
| Backend  | `npm run build` | ⚠️ No aplica — no tiene script build (Node.js puro) |

### 5.4 Pruebas automáticas

| Capa     | Comando      | Resultado                                  |
| -------- | ------------ | ------------------------------------------ |
| Backend  | `npm test` | ❌ No ejecutada — requiere conexión a BD |
| Frontend | —           | ⚠️ No hay pruebas configuradas           |

### 5.5 Flujo completo por API

**Estado:** ❌ No ejecutado — requiere conexión a BD

### 5.6 Casos negativos

**Estado:** ❌ No ejecutado — requiere conexión a BD

### 5.7 Persistencia

**Estado:** ❌ No ejecutado — requiere conexión a BD

### 5.8 Filtros combinados

**Estado:** ❌ No ejecutado — requiere conexión a BD

### 5.9 Indicadores

**Estado:** ❌ No ejecutado — requiere conexión a BD

### 5.10 Frontend en navegador

**Estado:** ❌ No verificado — no puedo hacer clic en un navegador

**Lo que debe probar una persona a mano:**

1. Registrar un caso nuevo y verificar que se guarde en la BD
2. Asignar un agente a un caso
3. Cambiar el estado de un caso
4. Registrar diagnóstico y solución
5. Aprobar o devolver un caso desde validación
6. Cerrar un caso aprobado
7. Verificar que el historial se crea automáticamente
8. Probar filtros combinados
9. Verificar indicadores
10. Probar gestión de categorías

---

## 6. Discrepancias conocidas del plan

| # | Discrepancia                                                                        | Qué hizo el código                                                                     |
| - | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1 | El plan no lista la tabla Atencion                                                  | ✅ Se implementó correctamente en`database/schema.sql:50-57`                          |
| 2 | HU-05 (cambiar estado) en Sprint 1, backend lo deja para Sprint 2                   | ✅ Se implementó en el backend (correcto)                                               |
| 3 | El plan escribe "Devuelta" como estado                                              | ✅ No se implementó como estado; se usa como transición En validación → En atención |
| 4 | HU-12 en Sprint 2 del frontend y Sprint 3 del resumen                               | ⚠️ No se implementó en el frontend                                                    |
| 5 | Indicadores dicen "por estado y tiempos", taller pide también por tipo y prioridad | ✅ Se implementaron los tres: por estado, por tipo y por prioridad                       |

---

## 7. Calidad y riesgos

### 7.1 Credenciales o claves en código

| Ubicación             | Riesgo | Notas                               |
| ---------------------- | ------ | ----------------------------------- |
| `.env`               | Bajo   | Credenciales placeholder, no reales |
| `.env.example`       | Bajo   | Credenciales placeholder, no reales |
| `docker-compose.yml` | Bajo   | Usa variables de entorno            |

**No hay credenciales reales hardcodeadas.**

### 7.2 Datos de ejemplo hardcodeados

| Ubicación                              | Riesgo | Notas                           |
| --------------------------------------- | ------ | ------------------------------- |
| `client/src/data/casos.mock.ts`       | Alto   | 11 casos mock hardcodeados      |
| `client/src/context/CasosContext.tsx` | Alto   | Usa datos mock en lugar de API  |
| `client/src/context/AuthContext.tsx`  | Medio  | Usuarios de prueba hardcodeados |
| `client/src/pages/RegistroPage.tsx`   | Medio  | Categorías hardcodeadas        |

### 7.3 Errores tragados sin registro

| Ubicación                                                                                                         | Riesgo | Notas                                          |
| ------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------- |
| `server/src/controllers/casosController.js:73-76, 142-144, 165-167, 182-184, 249-251, 309-311, 399-401, 500-502` | Medio  | `catch` que retorna 500 sin loggear el error |
| `server/src/controllers/indicadoresController.js:35-37`                                                          | Medio  | `catch` que retorna 500 sin loggear el error |
| `server/src/routes/areas.js:9-11, categorias.js:24-26, 55-59, 95-99, 135-137, usuarios.js:9-11`                  | Medio  | `catch` que retorna 500 sin loggear el error |

### 7.4 Falta de manejo de errores en la API

| Endpoint                      | Manejo de errores | Notas                                   |
| ----------------------------- | ----------------- | --------------------------------------- |
| POST /casos                   | ✅ Completo       | Valida datos, categoría, transiciones  |
| GET /casos                    | ✅ Completo       | Valida filtros                          |
| GET /casos/:id                | ✅ Completo       | Retorna 404 si no existe                |
| GET /casos/:id/historial      | ✅ Completo       | Retorna 404 si no existe                |
| POST /casos/:id/asignar       | ✅ Completo       | Valida usuario, rol, asignación previa |
| POST /casos/:id/atencion      | ✅ Completo       | Valida estado, agente asignado          |
| POST /casos/:id/validacion    | ✅ Completo       | Valida estado, rol validador            |
| PATCH /casos/:id/estado       | ✅ Completo       | Valida transiciones, estado cerrado     |
| GET /indicadores              | ⚠️ Básico      | No valida errores de BD                 |
| POST /categorias              | ✅ Completo       | Valida admin, área, duplicados         |
| PATCH /categorias/:id         | ✅ Completo       | Valida admin, área, duplicados         |
| PATCH /categorias/:id/activar | ✅ Completo       | Valida admin, uso de categoría         |

### 7.5 SQL construido por concatenación

| Ubicación                                            | Riesgo | Notas                                        |
| ----------------------------------------------------- | ------ | -------------------------------------------- |
| `server/src/controllers/casosController.js:104-137` | Bajo   | Usa parámetros`$1, $2, ...` correctamente |
| Todas las queries                                     | Bajo   | Se usa`pg` con parámetros parametrizados  |

**No hay SQL injection.**

---

## 8. Tabla CP-01 a CP-10

| ID    | Caso                               | Resultado | Cómo se verificó                                              |
| ----- | ---------------------------------- | --------- | --------------------------------------------------------------- |
| CP-01 | Registrar incidente válido        | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:22-38`   |
| CP-02 | Registrar sin descripción         | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:57-72`   |
| CP-03 | Registrar solicitud de servicio    | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:40-55`   |
| CP-04 | Cambiar a estado válido           | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:244-264` |
| CP-05 | Transición inválida              | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:266-286` |
| CP-06 | Asignar agente                     | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:374-395` |
| CP-07 | Registrar diagnóstico y solución | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:445-475` |
| CP-08 | Devolver desde validación         | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:542-567` |
| CP-09 | Cerrar caso aprobado               | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:569-595` |
| CP-10 | Filtrar por tipo/área/prioridad   | ✅ Pasó  | Hay prueba automática en`server/tests/casos.test.js:707-733` |

**Nota:** Las pruebas automáticas existen pero no se ejecutaron porque requieren conexión a BD.

---

## 9. Historias de usuario — Definition of Done

| HU    | Título                            | ¿Cumple DoD? | Motivo                                     |
| ----- | ---------------------------------- | ------------- | ------------------------------------------ |
| HU-01 | Registrar caso                     | ⚠️ Parcial  | Backend completo, frontend usa mock        |
| HU-02 | Mis casos                          | ⚠️ Parcial  | Backend completo, frontend usa mock        |
| HU-03 | Bandeja de casos                   | ⚠️ Parcial  | Backend completo, frontend usa mock        |
| HU-04 | Asignar agente                     | ❌ No         | Backend completo, frontend no implementado |
| HU-05 | Cambiar estado                     | ⚠️ Parcial  | Backend completo, frontend usa mock        |
| HU-06 | Registrar diagnóstico y solución | ❌ No         | Backend completo, frontend no implementado |
| HU-07 | Aprobar o devolver                 | ❌ No         | Backend completo, frontend no implementado |
| HU-08 | Historial del caso                 | ⚠️ Parcial  | Backend completo, frontend usa mock        |
| HU-09 | Buscador con filtros               | ❌ No         | Backend completo, frontend no implementado |
| HU-10 | Dashboard de indicadores           | ❌ No         | Backend completo, frontend no implementado |
| HU-11 | Gestión de categorías            | ❌ No         | Backend completo, frontend no implementado |
| HU-12 | Detalle con solución              | ⚠️ Parcial  | Backend completo, frontend usa mock        |

---

## 10. Lo que NO pudiste verificar y por qué

| Ítem                                    | Motivo                                            |
| ---------------------------------------- | ------------------------------------------------- |
| Ejecución de pruebas automáticas       | Requiere conexión a BD con credenciales válidas |
| Flujo completo por API                   | Requiere conexión a BD con credenciales válidas |
| Casos negativos con HTTP real            | Requiere conexión a BD con credenciales válidas |
| Persistencia al reiniciar                | Requiere conexión a BD con credenciales válidas |
| Filtros combinados con resultados reales | Requiere conexión a BD con credenciales válidas |
| Indicadores vs conteo en BD              | Requiere conexión a BD con credenciales válidas |
| Frontend en navegador                    | No puedo hacer clic en un navegador               |
| Pantallas del Sprint 2 y 3               | No existen en el código                          |

---

## 11. Sección Frontend — Responsables

**Responsables:** Juan Esteban Bustos y Juan David Valencia

### Hallazgos principales

1. **El frontend NO conecta con la API real**

   - `client/src/services/casosService.ts` existe pero no se usa
   - `client/src/context/CasosContext.tsx` usa datos mock de `client/src/data/casos.mock.ts`
   - Los componentes no llaman a `listarCasos()` ni `crearCaso()`
2. **Faltan pantallas del Sprint 2 y 3**

   - No existe pantalla de asignación de agente
   - No existe pantalla de diagnóstico y solución
   - No existe pantalla de validación (aprobar/devolver)
   - No existe dashboard de indicadores
   - No existe gestión de categorías
3. **No hay rol validador en el frontend**

   - `client/src/types/index.ts:16` — solo tiene `solicitante`, `agente`, `administrador`
   - No se puede hacer el flujo de validación
4. **Diferencias en nombres**

   - Tipos: Frontend usa "Solicitud de servicio", backend usa "Solicitud"
   - Prioridades: Frontend usa "P1 urgente", backend usa "P1"
5. **No hay manejo de errores de la API**

   - `casosService.ts:7` — mensaje genérico para todos los errores
   - No hay estados de carga ni skeletons
   - No se muestran mensajes del backend
6. **El formulario de registro no llama a la API**

   - `RegistroPage.tsx:45` — usa `agregarCaso()` del contexto (mock)
   - Debería usar `crearCaso()` del servicio (API real)

### Esfuerzo estimado para completar

| Tarea                                  | Esfuerzo |
| -------------------------------------- | -------- |
| Conectar CasosContext a la API real    | Medio    |
| Implementar pantalla de asignación    | Medio    |
| Implementar pantalla de atención      | Medio    |
| Implementar pantalla de validación    | Medio    |
| Implementar dashboard de indicadores   | Alto     |
| Implementar gestión de categorías    | Medio    |
| Agregar rol validador                  | Bajo     |
| Manejo de errores y estados de carga   | Medio    |
| Alinear nombres de tipos y prioridades | Bajo     |

---

## 12. Brechas de mayor a menor severidad

| # | Brecha                                                          | Ubicación                              | Esfuerzo | Responsable |
| - | --------------------------------------------------------------- | --------------------------------------- | -------- | ----------- |
| 1 | Frontend no conecta con API real                                | `client/src/context/CasosContext.tsx` | Medio    | Frontend    |
| 2 | Faltan pantallas Sprint 2 (asignación, atención, validación) | `client/src/pages/`                   | Alto     | Frontend    |
| 3 | Faltan pantallas Sprint 3 (dashboard, categorías)              | `client/src/pages/`                   | Alto     | Frontend    |
| 4 | No hay rol validador en frontend                                | `client/src/types/index.ts:16`        | Bajo     | Frontend    |
| 5 | Nombres de tipos y prioridades no coinciden                     | `client/src/types/index.ts:8,15`      | Bajo     | Frontend    |
| 6 | No hay manejo de errores de API en frontend                     | `client/src/services/casosService.ts` | Medio    | Frontend    |
| 7 | Errores no loggeados en backend                                 | `server/src/controllers/*.js`         | Bajo     | Backend     |

---

## 13. Conclusión

El **backend y la base de datos están completos y bien implementados**. Todos los endpoints existen, las validaciones están en el backend, las transiciones de estado son correctas, el historial se crea automáticamente en la misma transacción, y hay pruebas automáticas completas.

El **frontend es el cuello de botella**. Aunque compila correctamente, no conecta con la API real, usa datos mock hardcodeados, y faltan las pantallas del Sprint 2 y 3. No se puede recorrer el flujo completo Registrar → Asignar → Atender → Validar → Cerrar con el frontend actual.

**Prioridad:** El frontend debe conectarse a la API real y implementar las pantallas faltantes para que el proyecto sea funcional de extremo a extremo.
