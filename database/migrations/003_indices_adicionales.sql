CREATE INDEX IF NOT EXISTS idx_caso_tipo ON caso(tipo);
CREATE INDEX IF NOT EXISTS idx_caso_prioridad ON caso(prioridad);
CREATE INDEX IF NOT EXISTS idx_caso_categoria ON caso(categoria_id);
