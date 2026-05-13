/**
 * Rutas de Tipos de Gastos
 */

const express = require('express');
const router = express.Router();
const tiposGastosController = require('../controllers/tiposGastosController');

// Rutas de tipos de gastos
router.get('/', tiposGastosController.getAllTiposGastos.bind(tiposGastosController));
router.get('/:id', tiposGastosController.getTipoGastoById.bind(tiposGastosController));
router.post('/', tiposGastosController.createTipoGasto.bind(tiposGastosController));
router.put('/:id', tiposGastosController.updateTipoGasto.bind(tiposGastosController));
router.delete('/:id', tiposGastosController.deleteTipoGasto.bind(tiposGastosController));

module.exports = router;
