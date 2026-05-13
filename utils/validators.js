/**
 * Utilidades de validación de datos
 */

const validarViaje = (data) => {
  const errors = [];

  if (!data.fecha_viaje) {
    errors.push('La fecha del viaje es obligatoria');
  }

  if (!data.material_transportado || data.material_transportado.trim() === '') {
    errors.push('El material transportado es obligatorio');
  }

  if (!data.origen || data.origen.trim() === '') {
    errors.push('El origen es obligatorio');
  }

  if (!data.destino || data.destino.trim() === '') {
    errors.push('El destino es obligatorio');
  }

  if (!data.kilos_transportados || data.kilos_transportados <= 0) {
    errors.push('Los kilos transportados deben ser mayores a 0');
  }

  if (data.valor_flete === undefined || data.valor_flete < 0) {
    errors.push('El valor del flete debe ser mayor o igual a 0');
  }

  if (!data.placa_vehiculo || data.placa_vehiculo.trim() === '') {
    errors.push('La placa del vehículo es obligatoria');
  }

  if (data.anticipo !== undefined && data.anticipo < 0) {
    errors.push('El anticipo no puede ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validarGasto = (data) => {
  const errors = [];

  if (!data.viaje_id) {
    errors.push('El ID del viaje es obligatorio');
  }

  if (!data.tipo_gasto_id) {
    errors.push('El tipo de gasto es obligatorio');
  }

  const valor = Number(data.valor);
  if (data.valor === undefined || data.valor === null || !Number.isFinite(valor)) {
    errors.push('El valor del gasto es obligatorio y debe ser numérico');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validación de gasto cuando se envía junto con la creación del viaje
const validarGastoInicial = (data) => {
  const errors = [];

  if (!data.tipo_gasto_id) {
    errors.push('El tipo de gasto es obligatorio');
  }

  const valor = Number(data.valor);
  if (data.valor === undefined || data.valor === null || !Number.isFinite(valor)) {
    errors.push('El valor del gasto es obligatorio y debe ser numérico');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validarTipoGasto = (data) => {
  const errors = [];

  if (!data.nombre || data.nombre.trim() === '') {
    errors.push('El nombre del tipo de gasto es obligatorio');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validarViaje,
  validarGasto,
  validarTipoGasto,
  validarGastoInicial
};
