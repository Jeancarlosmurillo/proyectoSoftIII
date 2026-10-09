# Cliente

Frontend de CampusHelp construido con React y Vite. La pantalla inicial implementa
la bandeja de casos como un tablero Kanban horizontal.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Estructura

- `src/App.jsx`: composición de la pantalla, filtros rápidos y resumen.
- `src/components/KanbanColumn.jsx`: columna con contador y alerta WIP.
- `src/components/CaseCard.jsx`: tarjeta reutilizable de incidente o solicitud.
- `src/data/cases.js`: estados permitidos, límites WIP y mock de `GET /api/casos`.
- `src/styles.css`: estilos responsive del tablero.

Los estados del tablero usan los mismos valores del esquema de base de datos:
`Pendiente`, `En analisis`, `En atencion`, `En validacion` y `Cerrada`.

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
