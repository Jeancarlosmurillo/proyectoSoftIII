INSERT INTO categoria (area_id, nombre, descripcion)
SELECT a.id, datos.nombre, datos.descripcion
FROM area a
JOIN (
  VALUES
    ('Hardware', 'Proyector', 'Proyectores y equipos audiovisuales'),
    ('Hardware', 'Escáner', 'Digitalización de documentos'),
    ('Software', 'Licencias', 'Activación y renovación de licencias'),
    ('Software', 'Integración', 'Compatibilidad entre aplicaciones'),
    ('Red y conectividad', 'VPN', 'Acceso remoto a la red institucional'),
    ('Red y conectividad', 'Telefonía IP', 'Telefonía y extensiones institucionales'),
    ('Cuentas y acceso', 'Autenticación multifactor', 'Configuración de segundo factor'),
    ('Cuentas y acceso', 'Roles y permisos', 'Permisos sobre sistemas y recursos'),
    ('Plataformas académicas', 'Matrícula', 'Procesos de matrícula académica'),
    ('Plataformas académicas', 'Notas y calificaciones', 'Consulta y registro de calificaciones')
) AS datos(area_nombre, nombre, descripcion) ON a.nombre = datos.area_nombre
ON CONFLICT (nombre) DO NOTHING;
