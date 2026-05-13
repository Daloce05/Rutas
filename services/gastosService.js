/**
 * Servicio de gestión de Gastos
 * Capa de acceso a datos para la tabla gastos
 */

const pool = require('../config/db');

class GastosService {
  /**
   * Obtener todos los gastos de un viaje
   */
  async getGastosByViaje(viajeId) {
    const query = `
      SELECT 
        g.id,
        g.viaje_id,
        g.tipo_gasto_id,
        g.valor,
        g.descripcion,
        tg.nombre as tipo_gasto_nombre,
        g.created_at,
        g.updated_at
      FROM gastos g
      INNER JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
      WHERE g.viaje_id = $1
      ORDER BY g.created_at
    `;
    const result = await pool.query(query, [viajeId]);
    return result.rows;
  }

  /**
   * Obtener un gasto por ID
   */
  async getGastoById(id) {
    const query = `
      SELECT 
        g.id,
        g.viaje_id,
        g.tipo_gasto_id,
        g.valor,
        g.descripcion,
        tg.nombre as tipo_gasto_nombre,
        g.created_at,
        g.updated_at
      FROM gastos g
      INNER JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
      WHERE g.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Crear un nuevo gasto
   */
  async createGasto(gastoData) {
    const { viaje_id, tipo_gasto_id, valor, descripcion = null } = gastoData;

    const query = `
      INSERT INTO gastos (viaje_id, tipo_gasto_id, valor, descripcion)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [viaje_id, tipo_gasto_id, valor, descripcion];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Actualizar un gasto existente
   */
  async updateGasto(id, gastoData) {
    const { tipo_gasto_id, valor, descripcion } = gastoData;

    const query = `
      UPDATE gastos
      SET 
        tipo_gasto_id = $1,
        valor = $2,
        descripcion = $3
      WHERE id = $4
      RETURNING *
    `;

    const values = [tipo_gasto_id, valor, descripcion, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar un gasto
   */
  async deleteGasto(id) {
    const query = 'DELETE FROM gastos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtener total de gastos por viaje
   */
  async getTotalGastosByViaje(viajeId) {
    const query = `
      SELECT COALESCE(SUM(valor), 0) as total
      FROM gastos
      WHERE viaje_id = $1
    `;
    const result = await pool.query(query, [viajeId]);
    return parseFloat(result.rows[0].total);
  }
}

module.exports = new GastosService();
