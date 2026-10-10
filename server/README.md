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
CREATE USER campushelp_user WITH PASSWORD 'Clave1234S';
CREATE DATABASE campushelp OWNER campushelp_user;
GRANT ALL PRIVILEGES ON DATABASE campushelp TO campushelp_user;
GRANT ALL ON SCHEMA public TO campushelp_user;
ALTER SCHEMA public OWNER TO campushelp_user;
```

2. Aplicar las migraciones:

```bash
node database/migrator.js
```

3. Cargar datos iniciales (seed):

```bash
psql -U campushelp_user -d campushelp -f database/seed.sql
```

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
│   │   └── casosController.js
│   ├── middleware/
│   │   └── validaciones.js
│   └── routes/
│       ├── casos.js
│       ├── areas.js
│       ├── categorias.js
│       └── usuarios.js
└── tests/
    ├── casos.test.js
    └── setup.js
```

## Documentación de la API

Ver `docs/API.md`.
