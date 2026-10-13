# CampusHelp — Backend

API REST para gestión de incidentes y solicitudes de servicios tecnológicos.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación

```bash
cd server
npm install
```

## Configuración

Crea un archivo `.env` en la carpeta `server/` con las variables de entorno:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/campushelp
PORT=3001
```

## Crear la base de datos

1. Crear el usuario y la base de datos en PostgreSQL:

```sql
CREATE USER campushelp_user WITH PASSWORD 'tu_password_local';
CREATE DATABASE campushelp OWNER campushelp_user;
GRANT ALL PRIVILEGES ON DATABASE campushelp TO campushelp_user;
GRANT ALL ON SCHEMA public TO campushelp_user;
ALTER SCHEMA public OWNER TO campushelp_user;
```

2. Desde la raíz del proyecto, ejecutar el migrador:

```bash
cd ..
node database/migrator.js
```

3. Cargar datos iniciales (seed):

```bash
psql -U campushelp_user -d campushelp -f database/seed.sql
```

El seed crea una población demo distribuida entre tres solicitantes, tres agentes
y dos validadores para que el tablero y los flujos por rol puedan demostrarse sin
que todos los casos pertenezcan a la misma persona.

## Arrancar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`.

## Pruebas

```bash
npm test
```

## Estructura

```
server/
├── src/
│   ├── app.js
│   ├── index.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── casosController.js
│   │   └── indicadoresController.js
│   ├── middleware/
│   │   └── validaciones.js
│   └── routes/
│       ├── casos.js
│       ├── areas.js
│       ├── categorias.js
│       ├── usuarios.js
│       └── indicadores.js
└── tests/
    ├── casos.test.js
    └── setup.js
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/areas | Lista áreas activas |
| GET | /api/categorias | Lista categorias activas (filtro: area_id) |
| POST | /api/categorias | Crear categoría (solo admin) |
| PATCH | /api/categorias/:id | Editar categoría (solo admin) |
| PATCH | /api/categorias/:id/activar | Activar/desactivar categoría (solo admin) |
| GET | /api/usuarios | Lista usuarios activos |
| POST | /api/casos | Crear caso |
| GET | /api/casos | Lista casos con filtros combinables |
| GET | /api/casos/:id | Detalle de caso con atención |
| GET | /api/casos/:id/historial | Historial de eventos |
| POST | /api/casos/:id/asignar | Asignar agente |
| POST | /api/casos/:id/desasignar | Desasignar agente (solo admin) |
| POST | /api/casos/:id/atencion | Registrar atención |
| POST | /api/casos/:id/validacion | Validar caso |
| PATCH | /api/casos/:id | Editar caso (solo admin) |
| DELETE | /api/casos/:id | Eliminar caso (solo admin) |
| PATCH | /api/casos/:id/estado | Cambiar estado |
| GET | /api/indicadores | Indicadores del sistema |

## Documentación de la API

Ver `docs/API.md`.
