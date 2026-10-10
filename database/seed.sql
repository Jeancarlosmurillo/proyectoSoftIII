DO $$
DECLARE
  v_area_id INT;
BEGIN
  IF (SELECT COUNT(*) FROM area) = 0 THEN
    INSERT INTO area (nombre, descripcion) VALUES
    ('Hardware', 'Equipos de cómputo y periféricos'),
    ('Software', 'Aplicaciones y programas institucionales'),
    ('Red y conectividad', 'Internet, Wi-Fi y redes'),
    ('Cuentas y acceso', 'Contraseñas, correo y permisos'),
    ('Plataformas académicas', 'Campus virtual y sistemas académicos');
  END IF;

  IF (SELECT COUNT(*) FROM categoria) = 0 THEN
    INSERT INTO categoria (area_id, nombre, descripcion)
    SELECT a.id, c.nombre, c.descripcion
    FROM area a
    JOIN (VALUES
      ('Hardware', 'Computador', 'Equipo de cómputo'),
      ('Hardware', 'Periférico', 'Teclado, mouse, proyector'),
      ('Hardware', 'Impresora', 'Equipos de impresión'),
      ('Software', 'Instalación', 'Instalación de software'),
      ('Software', 'Error', 'Errores de aplicaciones'),
      ('Software', 'Actualización', 'Actualización de software'),
      ('Red y conectividad', 'Wi-Fi', 'Red inalámbrica'),
      ('Red y conectividad', 'Internet', 'Conexión a Internet'),
      ('Red y conectividad', 'Red cableada', 'Red Ethernet'),
      ('Cuentas y acceso', 'Contraseña', 'Recuperación de contraseña'),
      ('Cuentas y acceso', 'Bloqueo', 'Cuenta bloqueada'),
      ('Cuentas y acceso', 'Correo', 'Correo institucional'),
      ('Cuentas y acceso', 'Permisos', 'Acceso a recursos'),
      ('Plataformas académicas', 'Campus virtual', 'Plataforma de aprendizaje'),
      ('Plataformas académicas', 'Sistema académico', 'Sistema de gestión académica')
    ) AS c(area_nombre, nombre, descripcion) ON a.nombre = c.area_nombre;
  END IF;

  IF (SELECT COUNT(*) FROM usuario) = 0 THEN
    INSERT INTO usuario (nombre, correo, rol) VALUES
    ('Ana Solicitante', 'ana@uni.edu', 'solicitante'),
    ('Carlos Agente', 'carlos@uni.edu', 'agente'),
    ('Maria Validador', 'maria@uni.edu', 'validador'),
    ('Pedro Admin', 'pedro@uni.edu', 'administrador');
  END IF;
END $$;
