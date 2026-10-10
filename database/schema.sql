CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  rol VARCHAR(30) NOT NULL CHECK(rol IN ('solicitante','agente','validador','administrador')),
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS area (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS categoria (
  id SERIAL PRIMARY KEY,
  area_id INTEGER NOT NULL REFERENCES area(id),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS caso (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('Incidente','Solicitud')),
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NOT NULL CHECK(length(descripcion) >= 10),
  prioridad VARCHAR(2) NOT NULL CHECK(prioridad IN ('P1','P2','P3')),
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente'
    CHECK(estado IN ('Pendiente','En análisis','En atención','En validación','Cerrada')),
  usuario_id INTEGER NOT NULL REFERENCES usuario(id),
  categoria_id INTEGER NOT NULL REFERENCES categoria(id),
  agente_id INTEGER REFERENCES usuario(id),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_asignacion TIMESTAMP,
  fecha_cierre TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historial (
  id SERIAL PRIMARY KEY,
  caso_id INTEGER NOT NULL REFERENCES caso(id),
  evento VARCHAR(120) NOT NULL,
  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30),
  usuario_id INTEGER NOT NULL REFERENCES usuario(id),
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atencion (
  id SERIAL PRIMARY KEY,
  caso_id INTEGER NOT NULL REFERENCES caso(id),
  diagnostico TEXT NOT NULL,
  solucion TEXT NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  agente_id INTEGER NOT NULL REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_caso_estado ON caso(estado);
CREATE INDEX IF NOT EXISTS idx_caso_usuario ON caso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_caso_fecha ON caso(fecha_creacion);
