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

  IF (SELECT COUNT(*) FROM caso) = 0 THEN
    INSERT INTO caso (tipo, titulo, descripcion, prioridad, estado, usuario_id, categoria_id, agente_id, fecha_creacion, fecha_asignacion, fecha_cierre)
    SELECT c.tipo, c.titulo, c.descripcion, c.prioridad, c.estado,
           u_solic.id, cat.id, u_agente.id,
           c.fecha_creacion, c.fecha_asignacion, c.fecha_cierre
    FROM (VALUES
      ('Incidente', 'Wi-Fi no funciona en edificio A', 'No puedo conectarme al Wi-Fi institucional desde el edificio A', 'P1', 'Pendiente', 1, 7, NULL, NOW() - INTERVAL '2 hours', NULL, NULL),
      ('Solicitud', 'Instalar Visual Studio', 'Necesito que instalen Visual Studio en mi equipo institucional', 'P2', 'Pendiente', 1, 4, NULL, NOW() - INTERVAL '1 day', NULL, NULL),
      ('Incidente', 'Correo no envía adjuntos', 'El correo institucional no permite enviar archivos mayores a 5MB', 'P2', 'En análisis', 1, 12, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL),
      ('Solicitud', 'Acceso a carpeta compartida', 'Solicito acceso a la carpeta compartida del departamento', 'P3', 'En análisis', 1, 14, 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL),
      ('Incidente', 'Computador no enciende', 'Mi computador de oficina no enciende desde ayer', 'P1', 'En atención', 1, 1, 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL),
      ('Incidente', 'Impresora no imprime', 'La impresora del piso 3 no responde a ninguna impresión', 'P2', 'En atención', 1, 3, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL),
      ('Solicitud', 'Cambio de contraseña', 'Necesito cambiar mi contraseña del correo institucional', 'P3', 'En atención', 1, 10, 2, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NULL),
      ('Incidente', 'Error en campus virtual', 'La plataforma muestra error 500 al ingresar a cursos', 'P1', 'En validación', 1, 15, 2, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NULL),
      ('Solicitud', 'Antivirus desactualizado', 'El antivirus de mi equipo está desactualizado', 'P2', 'En validación', 1, 4, 2, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NULL),
      ('Incidente', 'Pantalla azul', 'Mi equipo muestra pantalla azul al iniciar', 'P1', 'Cerrada', 1, 1, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days'),
      ('Incidente', 'Teclado no responde', 'El teclado de mi equipo no responde', 'P2', 'Cerrada', 1, 2, 2, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
      ('Solicitud', 'Instalar Zoom', 'Necesito instalar Zoom en mi equipo', 'P3', 'Cerrada', 1, 4, 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '4 days'),
      ('Incidente', 'Internet lento', 'La red cableada está muy lenta desde ayer', 'P2', 'Cerrada', 1, 9, 2, NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days'),
      ('Incidente', 'Proyector no funciona', 'El proyector del aula 201 no muestra imagen', 'P3', 'Cerrada', 1, 2, 2, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '6 days'),
      ('Solicitud', 'Permisos de red', 'Necesito permisos para acceder a la red inalámbrica', 'P2', 'Cerrada', 1, 14, 2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days')
    ) AS c(tipo, titulo, descripcion, prioridad, estado, solicitante_pos, cat_id, agente_id, fecha_creacion, fecha_asignacion, fecha_cierre)
    JOIN usuario u_solic ON u_solic.correo = 'ana@uni.edu'
    JOIN categoria cat ON cat.id = c.cat_id
    LEFT JOIN usuario u_agente ON u_agente.id = c.agente_id;

    INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id, fecha)
    SELECT c.id, 'Caso creado', NULL, 'Pendiente', u_solic.id, c.fecha_creacion
    FROM caso c
    JOIN usuario u_solic ON u_solic.id = c.usuario_id
    WHERE c.estado != 'Pendiente';

    INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id, fecha)
    SELECT c.id, 'Agente asignado', NULL, c.estado, 2, c.fecha_asignacion
    FROM caso c
    WHERE c.agente_id IS NOT NULL AND c.fecha_asignacion IS NOT NULL;

    INSERT INTO atencion (caso_id, diagnostico, solucion, agente_id, fecha)
    SELECT c.id, 'Diagnóstico técnico del equipo', 'Se resolvió el problema técnico', 2, c.fecha_asignacion + INTERVAL '1 day'
    FROM caso c
    WHERE c.estado IN ('En validación', 'Cerrada');
  END IF;
END $$;
