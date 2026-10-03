const db = require('../config/database');

const TRANSICIONES_VALIDAS = {
  'Pendiente': ['En analisis'],
  'En analisis': ['En atencion', 'Pendiente'],
  'En atencion': ['En validacion'],
  'En validacion': ['Cerrada', 'En atencion'],
  'Cerrada': []
};

const casosController = {
  crearCaso: async (req, res) => {
    const { tipo, titulo, descripcion, prioridad, usuario_id, categoria_id } = req.body;

    const errores = [];
    if (!tipo || !['Incidente', 'Solicitud'].includes(tipo)) {
      errores.push('Tipo debe ser Incidente o Solicitud');
    }
    if (!titulo || titulo.trim() === '') {
      errores.push('Título es obligatorio');
    }
    if (!descripcion || descripcion.length < 10) {
      errores.push('Descripción debe tener al menos 10 caracteres');
    }
    if (!prioridad || !['P1', 'P2', 'P3'].includes(prioridad)) {
      errores.push('Prioridad debe ser P1, P2 o P3');
    }
    if (!usuario_id) {
      errores.push('usuario_id es obligatorio');
    }
    if (!categoria_id) {
      errores.push('categoria_id es obligatorio');
    }

    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }

    try {
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  },

  obtenerCaso: async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM caso WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Caso no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  cambiarEstado: async (req, res) => {
    const { id } = req.params;
    const { estado, usuario_id } = req.body;

    try {
      const casoResult = await db.query('SELECT * FROM caso WHERE id = $1', [id]);
      if (casoResult.rows.length === 0) {
        return res.status(404).json({ error: 'Caso no encontrado' });
      }

      const caso = casoResult.rows[0];
      const transiciones = TRANSICIONES_VALIDAS[caso.estado];

      if (!transiciones || !transiciones.includes(estado)) {
        return res.status(400).json({
          error: `Transición inválida de ${caso.estado} a ${estado}`
        });
      }

      await db.query('UPDATE caso SET estado = $1 WHERE id = $2', [estado, id]);

      await db.query(
        `INSERT INTO historial (caso_id, evento, estado_anterior, estado_nuevo, usuario_id)
         VALUES ($1, 'Cambio de estado', $2, $3, $4)`,
        [id, caso.estado, estado, usuario_id]
      );

      const result = await db.query('SELECT * FROM caso WHERE id = $1', [id]);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = casosController;
