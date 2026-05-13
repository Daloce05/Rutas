/**
 * Controlador de Gastos
 * Manejo de peticiones HTTP para la entidad Gastos
 */

const gastosService = require('../services/gastosService');
const { validarGasto } = require('../utils/validators');

class GastosController {
  /**
   * GET /api/viajes/:viajeId/gastos
   * Obtener todos los gastos de un viaje
   */
  async getGastosByViaje(req, res, next) {
    try {
      const { viajeId } = req.params;
      const gastos = await gastosService.getGastosByViaje(viajeId);

      res.json({
        success: true,
        data: gastos,
        count: gastos.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/gastos/:id
   * Obtener un gasto por ID
   */
  async getGastoById(req, res, next) {
    try {
      const { id } = req.params;
      const gasto = await gastosService.getGastoById(id);

      if (!gasto) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        data: gasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/gastos
   * Crear un nuevo gasto
   */
  async createGasto(req, res, next) {
    try {
      const validation = validarGasto(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      const nuevoGasto = await gastosService.createGasto(req.body);

      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        data: nuevoGasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/gastos/:id
   * Actualizar un gasto existente
   */
  async updateGasto(req, res, next) {
    try {
      const { id } = req.params;

      const validation = validarGasto(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      const gastoActualizado = await gastosService.updateGasto(id, req.body);

      if (!gastoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: gastoActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/gastos/:id
   * Eliminar un gasto
   */
  async deleteGasto(req, res, next) {
    try {
      const { id } = req.params;
      const gastoEliminado = await gastosService.deleteGasto(id);

      if (!gastoEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Gasto eliminado exitosamente',
        data: gastoEliminado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GastosController();
