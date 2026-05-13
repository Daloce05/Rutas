/**
 * Rutas de Viajes
 */

const express = require('express');
const router = express.Router();
const viajesController = require('../controllers/viajesController');

// Rutas de viajes
router.get('/', viajesController.getAllViajes.bind(viajesController));
router.get('/:id', viajesController.getViajeById.bind(viajesController));
router.get('/:id/completo', viajesController.getViajeCompleto.bind(viajesController));
router.post('/', viajesController.createViaje.bind(viajesController));
router.put('/:id', viajesController.updateViaje.bind(viajesController));
router.delete('/:id', viajesController.deleteViaje.bind(viajesController));

module.exports = router;
