# CampusHelp - Mesa de Servicios TI Universitaria

Aplicación web para gestionar incidentes y solicitudes de servicios tecnológicos universitarios.

## Stack Tecnológico

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **Contenedores**: Docker + Docker Compose

## Estructura del Proyecto

```
proyectoSoftIII/
├── database/          # Schema y seed de PostgreSQL
├── server/            # API REST (Node.js + Express)
├── client/            # Frontend (React + Vite)
├── docs/              # Documentación del proyecto
└── docker-compose.yml # Orquestación de contenedores
```

## Configuración Inicial

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL:

```env
DB_USER=tu_usuario
DB_PASSWORD=tu_password_real
DB_NAME=campushelp
DB_PORT=5432
```

### 2. Levantar con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- Backend en puerto 3001
- Frontend en puerto 5173

### 3. Verificar servicios

```bash
# Ver logs
docker-compose logs -f

# Ver contenedores activos
docker-compose ps
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/casos` | Crear incidente/solicitud |
| GET | `/api/casos` | Listar casos (con filtros) |
| GET | `/api/casos/:id` | Obtener caso por ID |
| PATCH | `/api/casos/:id` | Editar caso (administrador) |
| DELETE | `/api/casos/:id` | Eliminar caso (administrador) |
| POST | `/api/casos/:id/asignar` | Asignar caso a un agente |
| POST | `/api/casos/:id/desasignar` | Retirar agente asignado (administrador) |
| POST | `/api/casos/:id/atencion` | Registrar diagnóstico y solución |
| POST | `/api/casos/:id/validacion` | Aprobar o devolver solución |
| PATCH | `/api/casos/:id/estado` | Cambiar estado |
| GET | `/api/areas` | Listar áreas |
| GET | `/api/categorias` | Listar categorías |
| GET | `/api/usuarios` | Listar usuarios |

## Desarrollo Local (sin Docker)

### Backend

```bash
cd server
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

Antes de iniciar el servidor en una base vacía, ejecuta el esquema y los datos de demostración:

```bash
psql "$DATABASE_URL" -f ../database/schema.sql
psql "$DATABASE_URL" -f ../database/seed.sql
```

El archivo `server/.env` debe apuntar a la instancia local:

```env
DATABASE_URL=postgresql://campushelp_user:tu_password@localhost:5432/campushelp
PORT=3001
```

Para usar la configuración reproducible del proyecto, puedes levantar PostgreSQL
con Docker Desktop mediante `docker compose up -d postgres`. Si Docker Desktop no
está disponible, instala PostgreSQL localmente y crea el usuario y la base de
datos indicados en `server/README.md`.

### Frontend

```bash
cd client
npm install
npm run dev
```

## Pruebas

```bash
cd server
npm test
```

## Estados del Flujo

```
Pendiente → En análisis → En atención → En validación → Cerrada
```

## Roles para la demostración

- **Solicitante:** registra solicitudes y consulta sus propios casos.
- **Agente:** toma casos, registra la atención y los envía a validación.
- **Validador:** revisa la solución, la aprueba o la devuelve.
- **Administrador:** supervisa el tablero, gestiona asignaciones y consulta indicadores.

El selector de usuario del encabezado simula la autenticación para la demostración
académica; en producción debe reemplazarse por login y control de sesión real.

## Equipo Sprint 1

| Persona | Responsabilidad |
|---------|-----------------|
| Backend/BD | API + Base de datos |
| Frontend C | Formulario de registro |
| Frontend D | Bandeja de casos |
| ScrumBan E | Tablero + métricas |
| QA F | Documentación + pruebas |
