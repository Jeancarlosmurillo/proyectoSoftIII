const express = require('express');
const router = express.Router();
const db = require('../config/database');

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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
