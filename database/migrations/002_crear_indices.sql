CREATE INDEX IF NOT EXISTS idx_caso_estado ON caso(estado);
CREATE INDEX IF NOT EXISTS idx_caso_usuario ON caso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_caso_fecha ON caso(fecha_creacion);
