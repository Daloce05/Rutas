/**
 * Servicio de gestión de Tipos de Gastos
 * Capa de acceso a datos para la tabla tipos_gastos
 */

const pool = require('../config/db');

class TiposGastosService {
  /**
   * Obtener todos los tipos de gastos activos
   */
  async getAllTiposGastos(includeInactive = false) {
    let query = 'SELECT * FROM tipos_gastos';
    
    if (!includeInactive) {
      query += ' WHERE activo = true';
    }
    
    query += ' ORDER BY nombre';
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener un tipo de gasto por ID
   */
  async getTipoGastoById(id) {
    const query = 'SELECT * FROM tipos_gastos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Crear un nuevo tipo de gasto
   */
  async createTipoGasto(tipoGastoData) {
    const { nombre, descripcion = null, activo = true } = tipoGastoData;

    const query = `
      INSERT INTO tipos_gastos (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [nombre, descripcion, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Actualizar un tipo de gasto existente
   */
  async updateTipoGasto(id, tipoGastoData) {
    const { nombre, descripcion, activo } = tipoGastoData;

    const query = `
      UPDATE tipos_gastos
      SET 
        nombre = $1,
        descripcion = $2,
        activo = $3
      WHERE id = $4
      RETURNING *
    `;

    const values = [nombre, descripcion, activo, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar un tipo de gasto: si está en uso, desactiva; si no, elimina físicamente
   */
  async deleteTipoGasto(id, inUse) {
    if (inUse) {
      // Desactivar si está en uso
      const query = `
        UPDATE tipos_gastos
        SET activo = false
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return { tipoGasto: result.rows[0], eliminado: false };
    } else {
      // Eliminar físicamente si no está en uso
      const query = 'DELETE FROM tipos_gastos WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return { tipoGasto: result.rows[0], eliminado: true };
    }
  }

  /**
   * Verificar si un tipo de gasto está en uso
   */
  async isTipoGastoInUse(id) {
    const query = 'SELECT COUNT(*) as count FROM gastos WHERE tipo_gasto_id = $1';
    const result = await pool.query(query, [id]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = new TiposGastosService();
