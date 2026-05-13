const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada. Define esta variable en Render con la URL de Supabase.');
}

let parsedUrl;
try {
  parsedUrl = new URL(databaseUrl);
} catch (error) {
  throw new Error('DATABASE_URL tiene un formato inválido. Debe ser una URL PostgreSQL válida.');
}

if (!parsedUrl.hostname || parsedUrl.hostname === 'base') {
  throw new Error('DATABASE_URL apunta a un host inválido (base). Revisa la URL de conexión de Supabase en Render.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    // Supabase requiere TLS en conexiones externas
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
