/**
 * Controlador de Viajes
 * Manejo de peticiones HTTP para la entidad Viajes
 */

const viajesService = require('../services/viajesService');
const { validarViaje, validarGastoInicial } = require('../utils/validators');

class ViajesController {
  /**
   * GET /api/viajes
   * Obtener todos los viajes
   */
  async getAllViajes(req, res, next) {
    try {
      const viajes = await viajesService.getAllViajes();
      res.json({
        success: true,
        data: viajes,
        count: viajes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/viajes/:id
   * Obtener un viaje por ID
   */
  async getViajeById(req, res, next) {
    try {
      const { id } = req.params;
      const viaje = await viajesService.getViajeById(id);

      if (!viaje) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }

      res.json({
        success: true,
        data: viaje
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/viajes/:id/completo
   * Obtener viaje completo con gastos
   */
  async getViajeCompleto(req, res, next) {
    try {
      const { id } = req.params;
      const viaje = await viajesService.getViajeCompleto(id);

      if (!viaje) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }

      res.json({
        success: true,
        data: viaje
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/viajes
   * Crear un nuevo viaje
   */
  async createViaje(req, res, next) {
    try {
      const validation = validarViaje(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      // Validar gastos iniciales si vienen en la petición
      let gastosIniciales = [];
      if (Array.isArray(req.body.gastos)) {
        const erroresGastos = [];

        req.body.gastos.forEach((gasto, index) => {
          const validacionGasto = validarGastoInicial(gasto);
          if (!validacionGasto.isValid) {
            erroresGastos.push({
              index,
              errors: validacionGasto.errors
            });
          }
        });

        if (erroresGastos.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Error de validación en gastos',
            errors: erroresGastos
          });
        }

        gastosIniciales = req.body.gastos;
      }

      const nuevoViaje = await viajesService.createViaje(req.body, gastosIniciales);

      res.status(201).json({
        success: true,
        message: 'Viaje creado exitosamente',
        data: nuevoViaje
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/viajes/:id
   * Actualizar un viaje existente
   */
  async updateViaje(req, res, next) {
    try {
      const { id } = req.params;

      const validation = validarViaje(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      const viajeActualizado = await viajesService.updateViaje(id, req.body);

      if (!viajeActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Viaje actualizado exitosamente',
        data: viajeActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/viajes/:id
   * Eliminar un viaje
   */
  async deleteViaje(req, res, next) {
    try {
      const { id } = req.params;
      const viajeEliminado = await viajesService.deleteViaje(id);

      if (!viajeEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Viaje eliminado exitosamente',
        data: viajeEliminado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ViajesController();
