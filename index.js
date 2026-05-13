require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const initDB = require('./database/init');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar CORS
app.use(cors());

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión de Viajes de Carga - Sistema en línea' });
});

// Rutas de la API
app.use('/api', routes);

// Ruta para verificar conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Conexión exitosa a PostgreSQL',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al conectar con PostgreSQL',
      error: error.message 
    });
  }
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Inicializar BD y luego iniciar servidor
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚚 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📄 API disponible en http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend disponible en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo inicializar la base de datos. Servidor no iniciado.', err);
    process.exit(1);
  });
