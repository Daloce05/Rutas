-- =====================================================
-- Datos iniciales: Tipos de gastos predefinidos
-- =====================================================

INSERT INTO tipos_gastos (nombre, descripcion) VALUES
    ('Anticipo', 'Anticipo entregado al conductor (saldo positivo)'),
    ('APCM', 'Combustible'),
    ('Cargue', 'Gastos de cargue de mercancía'),
    ('Descargue', 'Gastos de descargue de mercancía'),
    ('Peajes', 'Peajes de carretera'),
    ('Llantas', 'Compra o reparación de llantas'),
    ('Aceite', 'Cambio de aceite y lubricantes'),
    ('Lavada', 'Lavado del vehículo'),
    ('Taller', 'Reparaciones mecánicas'),
    ('Parqueo', 'Estacionamiento'),
    ('Otros', 'Gastos varios no clasificados');

-- =====================================================
-- Datos de ejemplo (opcional para pruebas)
-- =====================================================

-- Ejemplo de viaje con tipos Anticipo y Saldo del Conductor
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
) VALUES (
    '2026-01-15',
    'Cemento',
    'Bogotá',
    'Medellín',
    15000.00,
    2500000.00,
    'ABC123',
    0.00,
    'Viaje de prueba del sistema'
);

-- Ejemplo de gastos: Anticipo y gastos operativos
INSERT INTO gastos (viaje_id, tipo_gasto_id, valor, descripcion) VALUES
    (1, 1, 800000.00, 'Anticipo inicial al conductor'),
    (1, 2, 450000.00, 'Combustible ruta Bogotá-Medellín'),
    (1, 3, 120000.00, 'Cargue en bodega Bogotá'),
    (1, 4, 100000.00, 'Descargue en Medellín'),
    (1, 5, 85000.00, 'Peajes varios');
