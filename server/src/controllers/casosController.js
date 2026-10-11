const db = require('../config/database');

const TRANSICIONES_VALIDAS = {
  'Pendiente': ['En análisis'],
  'En análisis': ['En atención'],
  'En atención': ['En validación'],
  'En validación': ['Cerrada', 'En atención'],
  'Cerrada': []
};

const ROLES_PERMITIDOS_CAMBIO_ESTADO = ['agente', 'administrador'];

const casosController = {
  crearCaso: async (req, res) => {
    const { tipo, titulo, descripcion, prioridad, usuario_id, categoria_id } = req.body;

    const errores = [];
    if (!tipo || !['Incidente', 'Solicitud'].includes(tipo)) {
      errores.push('tipo: debe ser "Incidente" o "Solicitud"');
    }
    if (!titulo || titulo.trim() === '') {
      errores.push('titulo: es obligatorio');
    }
    if (!descripcion || descripcion.length < 10) {
      errores.push('descripcion: debe tener al menos 10 caracteres');
    }
    if (!prioridad || !['P1', 'P2', 'P3'].includes(prioridad)) {
      errores.push('prioridad: debe ser P1, P2 o P3');
    }
    if (!usuario_id) {
      errores.push('usuario_id: es obligatorio');
    }
    if (!categoria_id) {
      errores.push('categoria_id: es obligatorio');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: errores.join('; ') });
    }

    try {
      const catResult = await db.query(
        'SELECT id FROM categoria WHERE id = $1 AND activa = TRUE',
        [categoria_id]
      );
      if (catResult.rows.length === 0) {
        return res.status(400).json({
          error: 'CATEGORIA_INVALIDA',
          mensaje: 'La categoría no existe o está inactiva'
        });
      }

      const result = await db.query(
        `INSERT INTO caso (tipo, titulo, descripcion, prioridad, usuario_id, categoria_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [tipo, titulo, descripcion, prioridad, usuario_id, categoria_id]
      );

      await db.query(
        `INSERT INTO historial (caso_id, evento, estado_nuevo, usuario_id)
         VALUES ($1, 'Caso creado', 'Pendiente', $2)`,
        [result.rows[0].id, usuario_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    }
  },

  listarCasos: async (req, res) => {
    const { usuario_id, estado, tipo, prioridad } = req.query;

    let sql = 'SELECT * FROM caso WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (usuario_id) {
      sql += ` AND usuario_id = $${paramIndex++}`;
      params.push(usuario_id);
    }
    if (estado) {
      sql += ` AND estado = $${paramIndex++}`;
      params.push(estado);
    }
    if (tipo) {
      sql += ` AND tipo = $${paramIndex++}`;
      params.push(tipo);
    }
    if (prioridad) {
      sql += ` AND prioridad = $${paramIndex++}`;
      params.push(prioridad);
    }

    sql += ' ORDER BY fecha_creacion DESC';

    try {
      const result = await db.query(sql, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    }
  },

  obtenerCaso: async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM caso WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const atencionResult = await db.query(
        'SELECT * FROM atencion WHERE caso_id = $1 ORDER BY fecha DESC',
        [req.params.id]
      );

      const caso = result.rows[0];
      if (atencionResult.rows.length > 0) {
        caso.atencion = atencionResult.rows[0];
      }

      res.json(caso);
    } catch (error) {
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    }
  },

  obtenerHistorial: async (req, res) => {
    try {
      const casoResult = await db.query('SELECT id FROM caso WHERE id = $1', [req.params.id]);
      if (casoResult.rows.length === 0) {
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const result = await db.query(
        'SELECT * FROM historial WHERE caso_id = $1 ORDER BY fecha ASC',
        [req.params.id]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    }
  },

  asignarCaso: async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'usuario_id: es obligatorio' });
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const casoResult = await client.query('SELECT * FROM caso WHERE id = $1 FOR UPDATE', [id]);
      if (casoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const caso = casoResult.rows[0];

      if (caso.agente_id) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'CASO_YA_ASIGNADO',
          mensaje: 'El caso ya tiene un agente asignado'
        });
      }

      const usuarioResult = await client.query(
        'SELECT rol FROM usuario WHERE id = $1 AND activo = TRUE',
        [usuario_id]
      );
      if (usuarioResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: 'NO_AUTORIZADO', mensaje: 'Usuario no válido' });
      }

      const rol = usuarioResult.rows[0].rol;
      if (rol !== 'agente') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'SIN_PERMISO',
          mensaje: 'Solo agentes pueden asignarse casos'
        });
      }

      await client.query(
        'UPDATE caso SET agente_id = $1, fecha_asignacion = CURRENT_TIMESTAMP WHERE id = $2',
        [usuario_id, id]
      );

      await client.query(
        `INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id)
         VALUES ($1, 'Agente asignado', $2, $2, $3)`,
        [id, caso.estado, usuario_id]
      );

      await client.query('COMMIT');

      const result = await db.query('SELECT * FROM caso WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  registrarAtencion: async (req, res) => {
    const { id } = req.params;
    const { diagnostico, solucion, usuario_id } = req.body;

    if (!diagnostico || diagnostico.trim() === '') {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'diagnostico: es obligatorio' });
    }
    if (!solucion || solucion.trim() === '') {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'solucion: es obligatorio' });
    }
    if (!usuario_id) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'usuario_id: es obligatorio' });
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const casoResult = await client.query('SELECT * FROM caso WHERE id = $1 FOR UPDATE', [id]);
      if (casoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const caso = casoResult.rows[0];

      if (caso.estado !== 'En atención') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'ESTADO_INVALIDO',
          mensaje: 'El caso debe estar en estado "En atención" para registrar atención'
        });
      }

      if (caso.agente_id !== usuario_id) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'SIN_PERMISO',
          mensaje: 'Solo el agente asignado puede registrar la atención'
        });
      }

      const result = await client.query(
        `INSERT INTO atencion (caso_id, diagnostico, solucion, agente_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, diagnostico, solucion, usuario_id]
      );

      await client.query('COMMIT');

      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  validarCaso: async (req, res) => {
    const { id } = req.params;
    const { accion, comentario, usuario_id } = req.body;

    if (!accion || !['aprobar', 'devolver'].includes(accion)) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'accion: debe ser "aprobar" o "devolver"' });
    }
    if (!usuario_id) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'usuario_id: es obligatorio' });
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const casoResult = await client.query('SELECT * FROM caso WHERE id = $1 FOR UPDATE', [id]);
      if (casoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const caso = casoResult.rows[0];

      if (caso.estado !== 'En validación') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'ESTADO_INVALIDO',
          mensaje: 'El caso debe estar en estado "En validación" para ser validado'
        });
      }

      const usuarioResult = await client.query(
        'SELECT rol FROM usuario WHERE id = $1 AND activo = TRUE',
        [usuario_id]
      );
      if (usuarioResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: 'NO_AUTORIZADO', mensaje: 'Usuario no válido' });
      }

      const rol = usuarioResult.rows[0].rol;
      if (rol !== 'validador') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'SIN_PERMISO',
          mensaje: 'Solo validadores pueden validar casos'
        });
      }

      let nuevoEstado;
      let evento;
      if (accion === 'aprobar') {
        nuevoEstado = 'Cerrada';
        evento = comentario ? `Validación aprobada: ${comentario}` : 'Validación aprobada';
      } else {
        nuevoEstado = 'En atención';
        evento = comentario ? `Validación devuelta: ${comentario}` : 'Validación devuelta';
      }

      if (nuevoEstado === 'Cerrada') {
        await client.query(
          'UPDATE caso SET estado = $1, fecha_cierre = CURRENT_TIMESTAMP WHERE id = $2',
          [nuevoEstado, id]
        );
      } else {
        await client.query(
          'UPDATE caso SET estado = $1, fecha_cierre = NULL WHERE id = $2',
          [nuevoEstado, id]
        );
      }

      await client.query(
        `INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, evento, caso.estado, nuevoEstado, usuario_id]
      );

      await client.query('COMMIT');

      const result = await db.query('SELECT * FROM caso WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  },

  cambiarEstado: async (req, res) => {
    const { id } = req.params;
    const { estado, usuario_id } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'estado: es obligatorio' });
    }
    if (!usuario_id) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'usuario_id: es obligatorio' });
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const casoResult = await client.query('SELECT * FROM caso WHERE id = $1 FOR UPDATE', [id]);
      if (casoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Caso no encontrado' });
      }

      const caso = casoResult.rows[0];

      if (caso.estado === 'Cerrada') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'ESTADO_CONFLICTO',
          mensaje: 'Un caso cerrado no puede modificarse'
        });
      }

      const usuarioResult = await client.query(
        'SELECT rol FROM usuario WHERE id = $1 AND activo = TRUE',
        [usuario_id]
      );
      if (usuarioResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: 'NO_AUTORIZADO', mensaje: 'Usuario no válido' });
      }

      const rol = usuarioResult.rows[0].rol;
      if (!ROLES_PERMITIDOS_CAMBIO_ESTADO.includes(rol)) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'SIN_PERMISO',
          mensaje: 'Solo agentes o administradores pueden cambiar el estado de un caso'
        });
      }

      if (caso.estado === 'En validación') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'TRANSICION_INVALIDA',
          mensaje: 'Las transiciones desde "En validación" deben hacerse por el endpoint de validación'
        });
      }

      const transiciones = TRANSICIONES_VALIDAS[caso.estado];
      if (!transiciones || !transiciones.includes(estado)) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'TRANSICION_INVALIDA',
          mensaje: `Transición inválida de "${caso.estado}" a "${estado}"`
        });
      }

      if (estado === 'Cerrada') {
        const atencionResult = await client.query(
          'SELECT id FROM atencion WHERE caso_id = $1',
          [id]
        );
        if (atencionResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            error: 'SIN_ATENCION',
            mensaje: 'No se puede cerrar un caso sin una atención registrada'
          });
        }
      }

      await client.query('UPDATE caso SET estado = $1 WHERE id = $2', [estado, id]);

      await client.query(
        `INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id)
         VALUES ($1, 'Cambio de estado', $2, $3, $4)`,
        [id, caso.estado, estado, usuario_id]
      );

      await client.query('COMMIT');

      const result = await db.query('SELECT * FROM caso WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  }
};

module.exports = casosController;
