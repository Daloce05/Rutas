/**
 * Middleware para manejo de errores centralizado
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error de base de datos
  if (err.code) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        message: 'El registro ya existe'
      });
    }
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida'
      });
    }
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
