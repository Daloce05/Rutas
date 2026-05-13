/**
 * Controlador de Tipos de Gastos
 * Manejo de peticiones HTTP para la entidad Tipos de Gastos
 */

const tiposGastosService = require('../services/tiposGastosService');
const { validarTipoGasto } = require('../utils/validators');

class TiposGastosController {
  /**
   * GET /api/tipos-gastos
   * Obtener todos los tipos de gastos
   */
  async getAllTiposGastos(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tiposGastos = await tiposGastosService.getAllTiposGastos(includeInactive);

      res.json({
        success: true,
        data: tiposGastos,
        count: tiposGastos.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tipos-gastos/:id
   * Obtener un tipo de gasto por ID
   */
  async getTipoGastoById(req, res, next) {
    try {
      const { id } = req.params;
      const tipoGasto = await tiposGastosService.getTipoGastoById(id);

      if (!tipoGasto) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de gasto no encontrado'
        });
      }

      res.json({
        success: true,
        data: tipoGasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tipos-gastos
   * Crear un nuevo tipo de gasto
   */
  async createTipoGasto(req, res, next) {
    try {
      const validation = validarTipoGasto(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      const nuevoTipoGasto = await tiposGastosService.createTipoGasto(req.body);

      res.status(201).json({
        success: true,
        message: 'Tipo de gasto creado exitosamente',
        data: nuevoTipoGasto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tipos-gastos/:id
   * Actualizar un tipo de gasto existente
   */
  async updateTipoGasto(req, res, next) {
    try {
      const { id } = req.params;

      const validation = validarTipoGasto(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validation.errors
        });
      }

      const tipoGastoActualizado = await tiposGastosService.updateTipoGasto(id, req.body);

      if (!tipoGastoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de gasto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tipo de gasto actualizado exitosamente',
        data: tipoGastoActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tipos-gastos/:id
   * Eliminar (desactivar) un tipo de gasto
   */
  async deleteTipoGasto(req, res, next) {
    try {
      const { id } = req.params;
      // Verificar si está en uso
      const inUse = await tiposGastosService.isTipoGastoInUse(id);
      const result = await tiposGastosService.deleteTipoGasto(id, inUse);

      if (!result.tipoGasto) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de gasto no encontrado'
        });
      }

      if (result.eliminado) {
        res.json({
          success: true,
          message: 'Tipo de gasto eliminado permanentemente',
          data: result.tipoGasto
        });
      } else {
        res.json({
          success: true,
          message: 'Tipo de gasto desactivado porque está en uso',
          data: result.tipoGasto
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TiposGastosController();
