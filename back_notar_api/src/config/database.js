const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del archivo .env

// Crea un "pool" de conexiones a la base de datos.
// Esto es más eficiente que crear una conexión por cada consulta.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones a Supabase
  }
});

// Función para probar que la conexión funciona
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos de Supabase!');
    client.release(); // Libera el cliente de vuelta al pool
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1); // Si no se puede conectar, se detiene la aplicación
  }
};

module.exports = { pool, testConnection };
