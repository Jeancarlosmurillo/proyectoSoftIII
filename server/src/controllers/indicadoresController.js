const db = require('../config/database');

const indicadoresController = {
  obtenerIndicadores: async (req, res) => {
    try {
      const porEstado = await db.query(
        'SELECT estado, COUNT(*) as total FROM caso GROUP BY estado'
      );

      const porTipo = await db.query(
        'SELECT tipo, COUNT(*) as total FROM caso GROUP BY tipo'
      );

      const porPrioridad = await db.query(
        'SELECT prioridad, COUNT(*) as total FROM caso GROUP BY prioridad'
      );

      const tiempoAtencion = await db.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (fecha_cierre - fecha_creacion))/3600) as promedio_horas
         FROM caso WHERE estado = 'Cerrada' AND fecha_cierre IS NOT NULL`
      );

      const tiempoAsignacion = await db.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (fecha_asignacion - fecha_creacion))/3600) as promedio_horas
         FROM caso WHERE fecha_asignacion IS NOT NULL`
      );

      res.json({
        casos_por_estado: porEstado.rows,
        casos_por_tipo: porTipo.rows,
        casos_por_prioridad: porPrioridad.rows,
        tiempo_promedio_atencion_horas: tiempoAtencion.rows[0].promedio_horas,
        tiempo_promedio_asignacion_horas: tiempoAsignacion.rows[0].promedio_horas
      });
    } catch (error) {
      res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
    }
  }
};

module.exports = indicadoresController;
