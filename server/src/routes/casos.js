const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

router.post('/', casosController.crearCaso);
router.get('/', casosController.listarCasos);
router.get('/:id', casosController.obtenerCaso);
router.get('/:id/historial', casosController.obtenerHistorial);
router.patch('/:id/estado', casosController.cambiarEstado);

module.exports = router;
