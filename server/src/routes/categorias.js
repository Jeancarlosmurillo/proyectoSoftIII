const express = require('express');
const router = express.Router();
const db = require('../config/database');

const verificarAdmin = async (usuario_id) => {
  if (!usuario_id) return null;
  const result = await db.query(
    'SELECT rol FROM usuario WHERE id = $1 AND activo = TRUE',
    [usuario_id]
  );
  return result.rows.length > 0 ? result.rows[0].rol : null;
};

router.get('/', async (req, res) => {
  const { area_id } = req.query;
  try {
    let result;
    if (area_id) {
      result = await db.query('SELECT * FROM categoria WHERE activa = TRUE AND area_id = $1', [area_id]);
    } else {
      result = await db.query('SELECT * FROM categoria WHERE activa = TRUE');
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion, area_id, usuario_id } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'nombre: es obligatorio' });
  }
  if (!area_id) {
    return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'area_id: es obligatorio' });
  }

  try {
    const rol = await verificarAdmin(usuario_id);
    if (rol !== 'administrador') {
      return res.status(403).json({ error: 'SIN_PERMISO', mensaje: 'Solo administradores pueden crear categorías' });
    }

    const areaResult = await db.query('SELECT id FROM area WHERE id = $1', [area_id]);
    if (areaResult.rows.length === 0) {
      return res.status(400).json({ error: 'AREA_INVALIDA', mensaje: 'El área no existe' });
    }

    const result = await db.query(
      'INSERT INTO categoria (area_id, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *',
      [area_id, nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'CATEGORIA_DUPLICADA', mensaje: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, area_id, usuario_id } = req.body;

  try {
    const rol = await verificarAdmin(usuario_id);
    if (rol !== 'administrador') {
      return res.status(403).json({ error: 'SIN_PERMISO', mensaje: 'Solo administradores pueden editar categorías' });
    }

    const catResult = await db.query('SELECT * FROM categoria WHERE id = $1', [id]);
    if (catResult.rows.length === 0) {
      return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Categoría no encontrada' });
    }

    let nuevaAreaId = catResult.rows[0].area_id;
    if (area_id) {
      const areaResult = await db.query('SELECT id FROM area WHERE id = $1', [area_id]);
      if (areaResult.rows.length === 0) {
        return res.status(400).json({ error: 'AREA_INVALIDA', mensaje: 'El área no existe' });
      }
      nuevaAreaId = area_id;
    }

    const nuevoNombre = nombre || catResult.rows[0].nombre;
    const nuevaDescripcion = descripcion !== undefined ? descripcion : catResult.rows[0].descripcion;

    const result = await db.query(
      'UPDATE categoria SET nombre = $1, descripcion = $2, area_id = $3 WHERE id = $4 RETURNING *',
      [nuevoNombre, nuevaDescripcion, nuevaAreaId, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'CATEGORIA_DUPLICADA', mensaje: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

router.patch('/:id/activar', async (req, res) => {
  const { id } = req.params;
  const { activa, usuario_id } = req.body;

  try {
    const rol = await verificarAdmin(usuario_id);
    if (rol !== 'administrador') {
      return res.status(403).json({ error: 'SIN_PERMISO', mensaje: 'Solo administradores pueden activar/desactivar categorías' });
    }

    if (activa === undefined) {
      return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'activa: es obligatorio (true/false)' });
    }

    if (activa === false) {
      const casosResult = await db.query('SELECT COUNT(*) FROM caso WHERE categoria_id = $1', [id]);
      if (parseInt(casosResult.rows[0].count) > 0) {
        return res.status(409).json({
          error: 'CATEGORIA_EN_USO',
          mensaje: 'No se puede eliminar una categoría con casos asociados'
        });
      }
    }

    const result = await db.query(
      'UPDATE categoria SET activa = $1 WHERE id = $2 RETURNING *',
      [activa, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NO_ENCONTRADO', mensaje: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
