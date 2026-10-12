const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM area WHERE activa = TRUE');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'INTERNO', mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
