const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await db.query("SELECT id, nombre, rol, activo FROM usuario WHERE activo = TRUE AND correo NOT LIKE '%@test.com' ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
