const express = require('express');
const router = express.Router();
const indicadoresController = require('../controllers/indicadoresController');

router.get('/', indicadoresController.obtenerIndicadores);

module.exports = router;
