# CampusHelp — Dominio y reglas (fuente de verdad del backend)

## Tipos, áreas y prioridades
- Tipo de caso: "Incidente" o "Solicitud de servicio".
- Áreas (5): Hardware, Software, Red y conectividad, Cuentas y acceso, Plataformas académicas.
- Una categoría pertenece a UN área. El área de un caso se deriva de su categoría.
- Prioridad: P1 urgente, P2 normal, P3 baja.

## Estados y transiciones
Estados (solo estos 5): Pendiente, En análisis, En atención, En validación, Cerrada.
Transiciones permitidas:
- Pendiente → En análisis → En atención → En validación → Cerrada
- En validación → En atención (devolver la solución)
"Devuelta" NO es un estado: es la transición En validación → En atención.
Un caso Cerrada no puede cambiarse desde la operación normal.

## Reglas de negocio
- Registro: tipo, categoría, título, descripción (mín. 10 caracteres) y prioridad
  obligatorios; fecha de creación automática; estado inicial Pendiente; la categoría
  debe existir y estar activa.
- Todo cambio de estado genera un evento en Historial (evento, estado_anterior,
  estado_nuevo, usuario_id, fecha), en la MISMA transacción que el cambio.
- Asignar un agente registra agente_id y fecha_asignacion (y un evento de historial).
- Solo el agente asignado al caso puede registrar la atención (diagnóstico y solución).
- Un caso no puede pasar a Cerrada sin una atención con solución registrada.
- Cerrar registra fecha_cierre.

## Roles (sin autenticación real)
Solicitante, Agente de soporte, Validador, Administrador.
Propuesta (confirmar con el frontend): el usuario actual llega en el encabezado
X-Usuario-Id y el backend consulta su rol. Sin usuario válido → 401; rol sin permiso → 403.

### Secciones de la interfaz por rol
- **Solicitante:** Mis casos y Registrar nuevo caso. Puede consultar el detalle de sus casos.
- **Agente:** Bandeja operativa y Mis asignaciones. Puede tomar casos disponibles, atender los casos asignados y avanzar el flujo.
- **Validador:** Casos por validar. Puede revisar soluciones en `En validación`, aprobarlas o devolverlas a atención.
- **Administrador:** Bandeja operativa, Todos los casos, Registrar nuevo caso e Indicadores. Puede editar, eliminar, asignar y desasignar casos.

## Modelo de datos mínimo
- Usuario: id, nombre, correo, rol, activo
- Area: id, nombre, descripcion, activa
- Categoria: id, area_id, nombre, descripcion, activa
- Caso: id, tipo, titulo, descripcion, prioridad, estado, usuario_id, categoria_id,
  agente_id, fecha_creacion, fecha_asignacion, fecha_cierre
- Atencion: id, caso_id, diagnostico, solucion, fecha, agente_id
- Historial: id, caso_id, evento, estado_anterior, estado_nuevo, usuario_id, fecha

## Convenciones de la API
JSON. Códigos: 201 creado, 400 datos inválidos, 401, 403, 404, 409 (transición inválida
o conflicto de estado). Error con formato uniforme:
{"error": "CODIGO", "mensaje": "texto claro en español"}.
Los endpoints se documentan en docs/API.md.