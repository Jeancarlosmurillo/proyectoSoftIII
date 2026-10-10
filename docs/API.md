# CampusHelp — Documentación de API

## Convenciones

- **Formato:** JSON
- **Error uniforme:** `{"error": "CODIGO", "mensaje": "texto claro en español"}`
- **Códigos de estado:** 200 OK, 201 Creado, 400 Datos inválidos, 401 No autorizado, 403 Sin permiso, 404 No encontrado, 409 Conflicto, 500 Error interno

---

## Áreas

### GET /api/areas

Lista todas las áreas activas.

**Parámetros:** ninguno

**Respuesta 200:**
```json
[
  { "id": 1, "nombre": "Hardware", "descripcion": "Equipos de cómputo y periféricos", "activa": true }
]
```

---

## Categorías

### GET /api/categorias

Lista categorías activas. Opcionalmente filtra por área.

**Parámetros query:**
| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `area_id` | integer | No | Filtra por ID de área |

**Respuesta 200:**
```json
[
  { "id": 1, "area_id": 1, "nombre": "Computador", "descripcion": "Equipo de cómputo", "activa": true }
]
```

---

## Usuarios

### GET /api/usuarios

Lista usuarios activos.

**Parámetros:** ninguno

**Respuesta 200:**
```json
[
  { "id": 1, "nombre": "Ana Solicitante", "correo": "ana@uni.edu", "rol": "solicitante", "activo": true }
]
```

---

## Casos

### POST /api/casos

Crea un caso nuevo. Estado inicial: Pendiente. Fecha de creación automática.

**Cuerpo:**
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `tipo` | string | Sí | "Incidente" o "Solicitud" |
| `titulo` | string | Sí | No vacío |
| `descripcion` | string | Sí | Mínimo 10 caracteres |
| `prioridad` | string | Sí | "P1", "P2" o "P3" |
| `usuario_id` | integer | Sí | Usuario solicitante |
| `categoria_id` | integer | Sí | Categoría existente y activa |

**Respuesta 201:**
```json
{
  "id": 1,
  "tipo": "Incidente",
  "titulo": "Wi-Fi no funciona",
  "descripcion": "No puedo conectarme al Wi-Fi institucional",
  "prioridad": "P1",
  "estado": "Pendiente",
  "usuario_id": 1,
  "categoria_id": 7,
  "agente_id": null,
  "fecha_creacion": "2026-10-10T14:30:00.000Z",
  "fecha_asignacion": null,
  "fecha_cierre": null
}
```

**Erres:**
- **400** `DATOS_INVALIDOS` — datos faltantes o inválidos
- **400** `CATEGORIA_INVALIDA` — categoría inexistente o inactiva

---

### GET /api/casos

Lista casos con filtros opcionales.

**Parámetros query:**
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `usuario_id` | integer | Filtra por solicitante ("mis casos") |
| `estado` | string | Filtra por estado |
| `tipo` | string | Filtra por tipo |
| `prioridad` | string | Filtra por prioridad |

**Respuesta 200:** array de casos (mismo formato que POST)

---

### GET /api/casos/{id}

Obtiene el detalle de un caso, incluyendo la atención si existe.

**Respuesta 200:**
```json
{
  "id": 1,
  "tipo": "Incidente",
  "titulo": "Wi-Fi no funciona",
  "...": "...",
  "atencion": {
    "id": 1,
    "caso_id": 1,
    "diagnostico": "Falla en el access point",
    "solucion": "Reemplazo del equipo",
    "fecha": "2026-10-10T15:00:00.000Z",
    "agente_id": 2
  }
}
```

El campo `atencion` solo aparece si existe registro de atención para el caso.

**Errores:**
- **404** `NO_ENCONTRADO`

---

### GET /api/casos/{id}/historial

Lista el historial de eventos de un caso en orden cronológico.

**Respuesta 200:**
```json
[
  {
    "id": 1,
    "caso_id": 1,
    "evento": "Caso creado",
    "estado_anterior": null,
    "estado_nuevo": "Pendiente",
    "usuario_id": 1,
    "fecha": "2026-10-10T14:30:00.000Z"
  }
]
```

**Errores:**
- **404** `NO_ENCONTRADO`

---

### PATCH /api/casos/{id}/estado

Cambia el estado de un caso. Solo roles **agente** o **administrador**. Genera evento en historial dentro de la misma transacción.

**Transiciones permitidas:**
- Pendiente → En análisis
- En análisis → En atención
- En atención → En validación
- En validación → Cerrada
- En validación → En atención (devolución)

**Cuerpo:**
| Campo | Tipo | Requerido |
|-------|------|-----------|
| `estado` | string | Sí |
| `usuario_id` | integer | Sí (debe ser agente o administrador) |

**Respuesta 200:** caso actualizado

**Errores:**
- **400** `DATOS_INVALIDOS` — estado o usuario_id faltantes
- **401** `NO_AUTORIZADO` — usuario no válido
- **403** `SIN_PERMISO` — rol sin permiso (solicitante/validador)
- **404** `NO_ENCONTRADO` — caso no existe
- **409** `ESTADO_CONFLICTO` — caso cerrado
- **409** `TRANSICION_INVALIDA` — transición no permitida

---

## Pendiente Sprint 2

Las siguientes reglas dependen de la tabla `atencion` y serán implementadas en el Sprint 2:
- Cerrar un caso requiere atención con solución registrada
- Solo el agente asignado puede registrar atención
- Asignar agente registra agente_id, fecha_asignacion y evento de historial
