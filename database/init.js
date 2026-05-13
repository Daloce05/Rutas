/**
 * Inicialización automática de la base de datos
 * Crea las tablas y datos semilla si no existen (seguro para producción)
 */

const pool = require('../config/db');

async function initDB() {
  const client = await pool.connect();
  try {
    // Crear tablas si no existen
    await client.query(`
      CREATE TABLE IF NOT EXISTS tipos_gastos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS viajes (
        id SERIAL PRIMARY KEY,
        fecha_viaje DATE NOT NULL,
        material_transportado VARCHAR(255) NOT NULL,
        origen VARCHAR(255) NOT NULL,
        destino VARCHAR(255) NOT NULL,
        kilos_transportados DECIMAL(10, 2) NOT NULL CHECK (kilos_transportados > 0),
        valor_flete DECIMAL(12, 2) NOT NULL CHECK (valor_flete >= 0),
        placa_vehiculo VARCHAR(20) NOT NULL,
        anticipo DECIMAL(12, 2) DEFAULT 0 CHECK (anticipo >= 0),
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        viaje_id INTEGER NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
        tipo_gasto_id INTEGER NOT NULL REFERENCES tipos_gastos(id) ON DELETE RESTRICT,
        valor DECIMAL(12, 2) NOT NULL CHECK (valor >= 0),
        descripcion VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índices si no existen
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha_viaje DESC);
      CREATE INDEX IF NOT EXISTS idx_viajes_placa ON viajes(placa_vehiculo);
      CREATE INDEX IF NOT EXISTS idx_gastos_viaje ON gastos(viaje_id);
      CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos(tipo_gasto_id);
    `);

    // Crear función y trigger para updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Triggers (se ignoran si ya existen)
    for (const [trigger, table] of [
      ['update_tipos_gastos_updated_at', 'tipos_gastos'],
      ['update_viajes_updated_at', 'viajes'],
      ['update_gastos_updated_at', 'gastos'],
    ]) {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = '${trigger}'
          ) THEN
            CREATE TRIGGER ${trigger}
            BEFORE UPDATE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END $$;
      `);
    }

    // Insertar tipos de gastos por defecto si la tabla está vacía
    const { rows } = await client.query('SELECT COUNT(*) FROM tipos_gastos');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tipos_gastos (nombre, descripcion) VALUES
          ('Anticipo',  'Anticipo entregado al conductor (saldo positivo)'),
          ('APCM',      'Combustible'),
          ('Cargue',    'Gastos de cargue de mercancía'),
          ('Descargue', 'Gastos de descargue de mercancía'),
          ('Peajes',    'Peajes de carretera'),
          ('Llantas',   'Compra o reparación de llantas'),
          ('Aceite',    'Cambio de aceite y lubricantes'),
          ('Lavada',    'Lavado del vehículo'),
          ('Taller',    'Reparaciones mecánicas'),
          ('Parqueo',   'Estacionamiento'),
          ('Otros',     'Gastos varios no clasificados');
      `);
      console.log('✅ Tipos de gastos iniciales insertados');
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = initDB;
