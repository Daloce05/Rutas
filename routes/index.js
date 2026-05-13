/**
 * Índice de Rutas
 * Centraliza todas las rutas de la aplicación
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const viajesRoutes = require('./viajes');
const gastosRoutes = require('./gastos');
const tiposGastosRoutes = require('./tiposGastos');
const gastosController = require('../controllers/gastosController');
const pdfController = require('../controllers/pdfController');

// Rutas de viajes
router.use('/viajes', viajesRoutes);

// Ruta especial para gastos por viaje
router.get('/viajes/:viajeId/gastos', gastosController.getGastosByViaje.bind(gastosController));

// Ruta especial para generar PDF de viaje
router.get('/viajes/:id/pdf', pdfController.generarPDFViaje.bind(pdfController));

// Rutas de gastos
router.use('/gastos', gastosRoutes);

// Rutas de tipos de gastos
router.use('/tipos-gastos', tiposGastosRoutes);

// Ruta de autenticación simple
router.use('/', authRoutes);

module.exports = router;
