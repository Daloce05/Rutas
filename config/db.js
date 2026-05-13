const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const hasDiscreteDbConfig =
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME;

if (!databaseUrl && !hasDiscreteDbConfig) {
  throw new Error(
    'Falta configuración de base de datos en .env. Usa DATABASE_URL o define DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME.'
  );
}

if (databaseUrl) {
  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch (error) {
    throw new Error('DATABASE_URL tiene un formato inválido. Debe ser una URL PostgreSQL válida.');
  }

  if (!parsedUrl.hostname || parsedUrl.hostname === 'base') {
    throw new Error('DATABASE_URL apunta a un host inválido (base). Revisa la URL de conexión de Supabase en Render.');
  }
}

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        // Supabase requiere TLS en conexiones externas
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión de PostgreSQL:', err);
});

module.exports = pool;
