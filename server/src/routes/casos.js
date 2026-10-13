const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

router.post('/', casosController.crearCaso);
router.get('/', casosController.listarCasos);
router.get('/:id', casosController.obtenerCaso);
router.get('/:id/historial', casosController.obtenerHistorial);
router.patch('/:id', casosController.editarCaso);
router.delete('/:id', casosController.eliminarCaso);
router.post('/:id/asignar', casosController.asignarCaso);
router.post('/:id/desasignar', casosController.desasignarCaso);
router.post('/:id/atencion', casosController.registrarAtencion);
router.post('/:id/analisis', casosController.registrarAnalisis);
router.post('/:id/validacion', casosController.validarCaso);
router.patch('/:id/estado', casosController.cambiarEstado);

module.exports = router;
