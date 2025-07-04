const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Función para ejecutar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
}

// Logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check ultra-simple
app.get('/health', (req, res) => {
  console.log('✅ Health check OK');
  res.status(200).send('OK');
});

app.get('/api/health', async (req, res) => {
  console.log('✅ API Health check solicitado');
  try {
    // Test conexión a BD
    await query('SELECT 1');
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected',
      port: PORT, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('❌ Error en health check con BD:', error);
    res.status(200).json({ 
      status: 'OK', 
      database: 'Disconnected',
      port: PORT, 
      timestamp: new Date().toISOString() 
    });
  }
});

// Test de base de datos
app.get('/api/db-test', async (req, res) => {
  console.log('🔍 Test de base de datos solicitado');
  try {
    const result = await query('SELECT NOW() as timestamp, \'Hello from DB\' as message');
    res.status(200).json({ 
      status: 'success',
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en test de BD:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Página principal
app.get('/', (req, res) => {
  console.log('✅ Página principal solicitada');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SaaS Gestión Pedidos</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial; margin: 40px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
          h1 { color: #333; text-align: center; }
          .success { background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .link { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px; }
          .progress { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 SaaS Gestión Pedidos</h1>
          <div class="success">
            <strong>✅ ¡FUNCIONANDO!</strong><br>
            El servidor está activo y respondiendo correctamente.
          </div>
          <div class="progress">
            <strong>🔄 RESTAURANDO FUNCIONALIDADES</strong><br>
            <p>✅ Paso 1: Base de datos - EN PROCESO</p>
            <p>⏳ Paso 2: API endpoints</p>
            <p>⏳ Paso 3: Frontend Next.js</p>
            <p>⏳ Paso 4: Socket.io</p>
          </div>
          <p><strong>Puerto:</strong> ${PORT}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <a href="/api/health" class="link">API Health Check</a>
          <a href="/health" class="link">Simple Health</a>
          <a href="/api/db-test" class="link">🔍 Test Base de Datos</a>
        </div>
      </body>
    </html>
  `);
});

// Cualquier otra ruta
app.get('*', (req, res) => {
  console.log(`✅ Ruta solicitada: ${req.path}`);
  res.status(200).json({ 
    message: 'SaaS Gestión Pedidos API',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 === SERVIDOR CON BASE DE DATOS INICIADO === 🚀');
  console.log(`✅ Puerto: ${PORT}`);
  console.log(`✅ Entorno: ${process.env.NODE_ENV}`);
  console.log(`✅ Timestamp: ${new Date().toISOString()}`);
  console.log('✅ Servidor listo para recibir conexiones');
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = app; 