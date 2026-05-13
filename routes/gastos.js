/**
 * Rutas de Gastos
 */

const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');

// Rutas de gastos
router.get('/:id', gastosController.getGastoById.bind(gastosController));
router.post('/', gastosController.createGasto.bind(gastosController));
router.put('/:id', gastosController.updateGasto.bind(gastosController));
router.delete('/:id', gastosController.deleteGasto.bind(gastosController));

module.exports = router;
