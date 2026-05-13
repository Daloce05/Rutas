-- =====================================================
-- Sistema de Gestión de Viajes de Carga
-- Esquema de Base de Datos PostgreSQL
-- =====================================================

-- Eliminar tablas si existen (para desarrollo)
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS viajes CASCADE;
DROP TABLE IF EXISTS tipos_gastos CASCADE;

-- =====================================================
-- Tabla: tipos_gastos
-- Descripción: Catálogo de tipos de gastos dinámico
-- =====================================================
CREATE TABLE tipos_gastos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabla: viajes
-- Descripción: Registro principal de viajes de carga
-- =====================================================
CREATE TABLE viajes (
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

-- =====================================================
-- Tabla: gastos
-- Descripción: Gastos asociados a cada viaje
-- =====================================================
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    viaje_id INTEGER NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
    tipo_gasto_id INTEGER NOT NULL REFERENCES tipos_gastos(id) ON DELETE RESTRICT,
    valor DECIMAL(12, 2) NOT NULL CHECK (valor >= 0),
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_viaje FOREIGN KEY (viaje_id) REFERENCES viajes(id),
    CONSTRAINT fk_tipo_gasto FOREIGN KEY (tipo_gasto_id) REFERENCES tipos_gastos(id)
);

-- =====================================================
-- Índices para optimización de consultas
-- =====================================================
CREATE INDEX idx_viajes_fecha ON viajes(fecha_viaje DESC);
CREATE INDEX idx_viajes_placa ON viajes(placa_vehiculo);
CREATE INDEX idx_gastos_viaje ON gastos(viaje_id);
CREATE INDEX idx_gastos_tipo ON gastos(tipo_gasto_id);

-- =====================================================
-- Función para actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_tipos_gastos_updated_at BEFORE UPDATE ON tipos_gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON viajes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Vista: viajes_con_totales
-- Descripción: Vista con cálculos agregados por viaje
-- =====================================================
CREATE OR REPLACE VIEW viajes_con_totales AS
SELECT 
    v.id,
    v.fecha_viaje,
    v.material_transportado,
    v.origen,
    v.destino,
    v.kilos_transportados,
    v.valor_flete,
    v.placa_vehiculo,
    v.anticipo,
    v.observaciones,
    COALESCE(SUM(g.valor), 0) as total_gastos,
    v.valor_flete - COALESCE(SUM(g.valor), 0) as saldo_conductor,
    v.valor_flete - COALESCE(SUM(g.valor), 0) - v.anticipo as saldo_final,
    v.created_at,
    v.updated_at
FROM viajes v
LEFT JOIN gastos g ON v.id = g.viaje_id
GROUP BY v.id, v.fecha_viaje, v.material_transportado, v.origen, v.destino,
         v.kilos_transportados, v.valor_flete, v.placa_vehiculo, v.anticipo,
         v.observaciones, v.created_at, v.updated_at;

-- =====================================================
-- Comentarios en tablas
-- =====================================================
COMMENT ON TABLE tipos_gastos IS 'Catálogo de tipos de gastos dinámico';
COMMENT ON TABLE viajes IS 'Registro principal de viajes de carga';
COMMENT ON TABLE gastos IS 'Gastos asociados a cada viaje';
COMMENT ON VIEW viajes_con_totales IS 'Vista con cálculos automáticos de totales y saldos';
