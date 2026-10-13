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
      ('Plataformas académicas', 'Sistema académico', 'Sistema de gestión académica'),
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
    ) AS c(area_nombre, nombre, descripcion) ON a.nombre = c.area_nombre;
  END IF;

  INSERT INTO usuario (nombre, correo, rol) VALUES
  ('Ana Solicitante', 'ana@uni.edu', 'solicitante'),
  ('Luisa Estudiante', 'luisa@uni.edu', 'solicitante'),
  ('Diego Docente', 'diego@uni.edu', 'solicitante'),
  ('Carlos Agente', 'carlos@uni.edu', 'agente'),
  ('Valentina Agente', 'valentina@uni.edu', 'agente'),
  ('Andrés Agente', 'andres@uni.edu', 'agente'),
  ('Maria Validador', 'maria@uni.edu', 'validador'),
  ('Sofía Validadora', 'sofia@uni.edu', 'validador'),
  ('Pedro Admin', 'pedro@uni.edu', 'administrador')
  ON CONFLICT (correo) DO NOTHING;

  IF (SELECT COUNT(*) FROM caso) = 0 THEN
    INSERT INTO caso (tipo, titulo, descripcion, prioridad, estado, usuario_id, categoria_id, agente_id, fecha_creacion, fecha_asignacion, fecha_cierre)
    SELECT c.tipo, c.titulo, c.descripcion, c.prioridad, c.estado,
           u_solic.id, cat.id, u_agente.id,
           c.fecha_creacion, c.fecha_asignacion, c.fecha_cierre
    FROM (VALUES
      ('Incidente', 'Wi-Fi no funciona en edificio A', 'No puedo conectarme al Wi-Fi institucional desde el edificio A', 'P1', 'Pendiente', 'Wi-Fi', 'carlos@uni.edu', NOW() - INTERVAL '2 hours', NULL, NULL),
      ('Solicitud', 'Instalar Visual Studio', 'Necesito que instalen Visual Studio en mi equipo institucional', 'P2', 'Pendiente', 'Instal', NULL, NOW() - INTERVAL '1 day', NULL, NULL),
      ('Incidente', 'Correo no envía adjuntos', 'El correo institucional no permite enviar archivos mayores a 5MB', 'P2', 'En análisis', 'Correo', 'carlos@uni.edu', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL),
      ('Solicitud', 'Acceso a carpeta compartida', 'Solicito acceso a la carpeta compartida del departamento', 'P3', 'En análisis', 'Permisos', 'carlos@uni.edu', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL),
      ('Incidente', 'Computador no enciende', 'Mi computador de oficina no enciende desde ayer', 'P1', 'En atención', 'Computador', 'carlos@uni.edu', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL),
      ('Incidente', 'Impresora no imprime', 'La impresora del piso 3 no responde a ninguna impresión', 'P2', 'En atención', 'Impresora', 'carlos@uni.edu', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL),
      ('Solicitud', 'Cambio de contraseña', 'Necesito cambiar mi contraseña del correo institucional', 'P3', 'En atención', 'Contraseña', 'carlos@uni.edu', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NULL),
      ('Incidente', 'Error en campus virtual', 'La plataforma muestra error 500 al ingresar a cursos', 'P1', 'En validación', 'Campus virtual', 'carlos@uni.edu', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NULL),
      ('Solicitud', 'Antivirus desactualizado', 'El antivirus de mi equipo está desactualizado', 'P2', 'En validación', 'Instal', 'carlos@uni.edu', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NULL),
      ('Incidente', 'Pantalla azul', 'Mi equipo muestra pantalla azul al iniciar', 'P1', 'Cerrada', 'Computador', 'carlos@uni.edu', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days'),
      ('Incidente', 'Teclado no responde', 'El teclado de mi equipo no responde', 'P2', 'Cerrada', 'Perif', 'carlos@uni.edu', NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
      ('Solicitud', 'Instalar Zoom', 'Necesito instalar Zoom en mi equipo', 'P3', 'Cerrada', 'Instal', 'carlos@uni.edu', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '4 days'),
      ('Incidente', 'Internet lento', 'La red cableada está muy lenta desde ayer', 'P2', 'Cerrada', 'Red cableada', 'carlos@uni.edu', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days'),
      ('Incidente', 'Proyector no funciona', 'El proyector del aula 201 no muestra imagen', 'P3', 'Cerrada', 'Perif', 'carlos@uni.edu', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '6 days'),
      ('Solicitud', 'Permisos de red', 'Necesito permisos para acceder a la red inalámbrica', 'P2', 'Cerrada', 'Permisos', 'carlos@uni.edu', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days')
    ) AS c(tipo, titulo, descripcion, prioridad, estado, categoria_nombre, agente_correo, fecha_creacion, fecha_asignacion, fecha_cierre)
    JOIN usuario u_solic ON u_solic.correo = 'ana@uni.edu'
    JOIN categoria cat ON cat.nombre LIKE c.categoria_nombre || '%'
    LEFT JOIN usuario u_agente ON u_agente.correo = c.agente_correo;

    WITH distribucion AS (
      SELECT id,
             ROW_NUMBER() OVER (ORDER BY id) AS posicion
      FROM caso
    )
    UPDATE caso c
    SET usuario_id = CASE (d.posicion % 3)
      WHEN 1 THEN (SELECT id FROM usuario WHERE correo = 'ana@uni.edu')
      WHEN 2 THEN (SELECT id FROM usuario WHERE correo = 'luisa@uni.edu')
      ELSE (SELECT id FROM usuario WHERE correo = 'diego@uni.edu')
    END,
    agente_id = CASE
      WHEN c.estado = 'Pendiente' THEN NULL
      WHEN d.posicion % 3 = 1 THEN (SELECT id FROM usuario WHERE correo = 'carlos@uni.edu')
      WHEN d.posicion % 3 = 2 THEN (SELECT id FROM usuario WHERE correo = 'valentina@uni.edu')
      ELSE (SELECT id FROM usuario WHERE correo = 'andres@uni.edu')
    END
    FROM distribucion d
    WHERE c.id = d.id;

    INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id, fecha)
    SELECT c.id, 'Caso creado', NULL, 'Pendiente', u_solic.id, c.fecha_creacion
    FROM caso c
    JOIN usuario u_solic ON u_solic.id = c.usuario_id
    WHERE c.estado != 'Pendiente';

    INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id, fecha)
    SELECT c.id, 'Agente asignado', NULL, c.estado, u.id, c.fecha_asignacion
    FROM caso c
    JOIN usuario u ON u.id = c.agente_id
    WHERE c.agente_id IS NOT NULL AND c.fecha_asignacion IS NOT NULL;

    INSERT INTO atencion (caso_id, diagnostico, solucion, agente_id, fecha)
    SELECT c.id, 'Diagnóstico técnico del equipo', 'Se resolvió el problema técnico', c.agente_id, c.fecha_asignacion + INTERVAL '1 day'
    FROM caso c
    WHERE c.estado IN ('En validación', 'Cerrada');
  END IF;
END $$;
