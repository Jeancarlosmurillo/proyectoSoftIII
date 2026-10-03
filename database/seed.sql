INSERT INTO area (nombre, descripcion) VALUES
('Hardware', 'Equipos de cómputo y periféricos'),
('Software', 'Aplicaciones y programas institucionales'),
('Red y conectividad', 'Internet, Wi-Fi y redes'),
('Cuentas y acceso', 'Contraseñas, correo y permisos'),
('Plataformas académicas', 'Campus virtual y sistemas académicos');

INSERT INTO categoria (area_id, nombre, descripcion) VALUES
(1, 'Computador', 'Equipo de cómputo'),
(1, 'Periférico', 'Teclado, mouse, proyector'),
(1, 'Impresora', 'Equipos de impresión'),
(2, 'Instalación', 'Instalación de software'),
(2, 'Error', 'Errores de aplicaciones'),
(2, 'Actualización', 'Actualización de software'),
(3, 'Wi-Fi', 'Red inalámbrica'),
(3, 'Internet', 'Conexión a Internet'),
(3, 'Red cableada', 'Red Ethernet'),
(4, 'Contraseña', 'Recuperación de contraseña'),
(4, 'Bloqueo', 'Cuenta bloqueada'),
(4, 'Correo', 'Correo institucional'),
(4, 'Permisos', 'Acceso a recursos'),
(5, 'Campus virtual', 'Plataforma de aprendizaje'),
(5, 'Sistema académico', 'Sistema de gestión académica');

INSERT INTO usuario (nombre, correo, rol) VALUES
('Ana Solicitante', 'ana@uni.edu', 'solicitante'),
('Carlos Agente', 'carlos@uni.edu', 'agente'),
('Maria Validador', 'maria@uni.edu', 'validador'),
('Pedro Admin', 'pedro@uni.edu', 'administrador');
