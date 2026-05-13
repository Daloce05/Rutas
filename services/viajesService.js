/**
 * Servicio de gestión de Viajes
 * Capa de acceso a datos para la tabla viajes
 */

const pool = require('../config/db');

class ViajesService {
  /**
   * Obtener todos los viajes con sus totales calculados
   */
  async getAllViajes() {
    const query = `
      SELECT 
        id,
        fecha_viaje,
        material_transportado,
        origen,
        destino,
        kilos_transportados,
        valor_flete,
        placa_vehiculo,
        observaciones,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as anticipo,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as total_gastos,
        ((SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) - 
         (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id)) as saldo_final,
        created_at,
        updated_at
      FROM viajes
      ORDER BY fecha_viaje DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener un viaje por ID con totales
   */
  async getViajeById(id) {
    const query = `
      SELECT 
        id,
        fecha_viaje,
        material_transportado,
        origen,
        destino,
        kilos_transportados,
        valor_flete,
        placa_vehiculo,
        observaciones,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as anticipo,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as total_gastos,
        ((SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) - 
         (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id)) as saldo_final,
        created_at,
        updated_at
      FROM viajes
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Crear un nuevo viaje
   */
  async createViaje(viajeData, gastos = []) {
    const client = await pool.connect();

    try {
      const {
        fecha_viaje,
        material_transportado,
        origen,
        destino,
        kilos_transportados,
        valor_flete,
        placa_vehiculo,
        anticipo = 0,
        observaciones = null
      } = viajeData;

      await client.query('BEGIN');

      const insertViajeQuery = `
        INSERT INTO viajes (
          fecha_viaje,
          material_transportado,
          origen,
          destino,
          kilos_transportados,
          valor_flete,
          placa_vehiculo,
          anticipo,
          observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        fecha_viaje,
        material_transportado,
        origen,
        destino,
        kilos_transportados,
        valor_flete,
        placa_vehiculo,
        anticipo,
        observaciones
      ];

      const viajeResult = await client.query(insertViajeQuery, values);
      const viajeCreado = viajeResult.rows[0];

      // Insertar gastos iniciales si se enviaron
      if (Array.isArray(gastos) && gastos.length > 0) {
        const insertGastoQuery = `
          INSERT INTO gastos (viaje_id, tipo_gasto_id, valor, descripcion)
          VALUES ($1, $2, $3, $4)
        `;

        for (const gasto of gastos) {
          await client.query(insertGastoQuery, [
            viajeCreado.id,
            gasto.tipo_gasto_id,
            gasto.valor,
            gasto.descripcion || null
          ]);
        }
      }

      const resumenQuery = `
        SELECT 
          id,
          fecha_viaje,
          material_transportado,
          origen,
          destino,
          kilos_transportados,
          valor_flete,
          placa_vehiculo,
          observaciones,
          (SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as anticipo,
          (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as total_gastos,
          ((SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) - 
           (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id)) as saldo_final,
          created_at,
          updated_at
        FROM viajes
        WHERE id = $1
      `;

      const resumen = await client.query(resumenQuery, [viajeCreado.id]);

      // Traer gastos detallados si se insertaron para devolverlos
      let gastosDetalle = [];
      if (Array.isArray(gastos) && gastos.length > 0) {
        const gastosQuery = `
          SELECT 
            g.id,
            g.valor,
            g.descripcion,
            tg.nombre as tipo_gasto
          FROM gastos g
          INNER JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
          WHERE g.viaje_id = $1
          ORDER BY g.created_at
        `;
        const gastosRes = await client.query(gastosQuery, [viajeCreado.id]);
        gastosDetalle = gastosRes.rows;
      }

      await client.query('COMMIT');

      const viajeConTotales = resumen.rows[0];
      return gastosDetalle.length > 0
        ? { ...viajeConTotales, gastos: gastosDetalle }
        : viajeConTotales;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar un viaje existente
   */
  async updateViaje(id, viajeData) {
    const {
      fecha_viaje,
      material_transportado,
      origen,
      destino,
      kilos_transportados,
      valor_flete,
      placa_vehiculo,
      anticipo,
      observaciones
    } = viajeData;

    const query = `
      UPDATE viajes
      SET 
        fecha_viaje = $1,
        material_transportado = $2,
        origen = $3,
        destino = $4,
        kilos_transportados = $5,
        valor_flete = $6,
        placa_vehiculo = $7,
        anticipo = $8,
        observaciones = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      fecha_viaje,
      material_transportado,
      origen,
      destino,
      kilos_transportados,
      valor_flete,
      placa_vehiculo,
      anticipo,
      observaciones,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar un viaje (y sus gastos en cascada)
   */
  async deleteViaje(id) {
    const query = 'DELETE FROM viajes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtener viaje completo con gastos detallados
   */
  async getViajeCompleto(id) {
    const viajeQuery = `
      SELECT 
        id,
        fecha_viaje,
        material_transportado,
        origen,
        destino,
        kilos_transportados,
        valor_flete,
        placa_vehiculo,
        observaciones,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as anticipo,
        (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) as total_gastos,
        ((SELECT COALESCE(SUM(CASE WHEN tg.nombre = 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id) - 
         (SELECT COALESCE(SUM(CASE WHEN tg.nombre != 'Anticipo' THEN valor ELSE 0 END), 0) FROM gastos g JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id WHERE g.viaje_id = viajes.id)) as saldo_final
      FROM viajes
      WHERE id = $1
    `;

    const gastosQuery = `
      SELECT 
        g.id,
        g.valor,
        g.descripcion,
        tg.nombre as tipo_gasto,
        tg.id as tipo_gasto_id
      FROM gastos g
      INNER JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
      WHERE g.viaje_id = $1
      ORDER BY g.created_at
    `;

    const viajeResult = await pool.query(viajeQuery, [id]);
    const gastosResult = await pool.query(gastosQuery, [id]);

    if (!viajeResult.rows[0]) {
      return null;
    }

    return {
      ...viajeResult.rows[0],
      gastos: gastosResult.rows
    };
  }
}

module.exports = new ViajesService();
