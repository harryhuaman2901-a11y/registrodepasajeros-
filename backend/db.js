const mysql = require('mysql2/promise');

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
console.log(`Entorno detectado en db.js: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',  // Contraseña para MySQL en Laragon
  database: process.env.DB_NAME || 'registro_pasajeros',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 segundos de timeout para la conexión
  // Eliminamos acquireTimeout y timeout que generan advertencias en MySQL2
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 segundos de delay inicial para keep-alive
  ssl: isRender ? {rejectUnauthorized: true} : false // Habilitar SSL en Render
});

// Función para probar la conexión
async function testConnection() {
  let retries = 5;
  let connected = false;
  
  while (retries > 0 && !connected) {
    try {
      console.log(`Intentando conectar a la base de datos (${6-retries}/5)...`);
      const connection = await pool.getConnection();
      console.log('Conexión a la base de datos establecida correctamente');
      connection.release();
      connected = true;
      return true;
    } catch (error) {
      console.error(`Intento ${6-retries}/5 fallido: ${error.message}`);
      retries--;
      if (retries > 0) {
        console.log(`Reintentando en 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
      }
    }
  }
  
  if (!connected) {
    console.error('Error al conectar a la base de datos después de varios intentos');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};