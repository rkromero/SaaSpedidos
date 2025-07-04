const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

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

app.get('/api/health', (req, res) => {
  console.log('✅ API Health check OK');
  res.status(200).json({ status: 'OK', port: PORT, timestamp: new Date().toISOString() });
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
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 SaaS Gestión Pedidos</h1>
          <div class="success">
            <strong>✅ ¡FUNCIONANDO!</strong><br>
            El servidor está activo y respondiendo correctamente.
          </div>
          <p><strong>Puerto:</strong> ${PORT}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <a href="/api/health" class="link">API Health Check</a>
          <a href="/health" class="link">Simple Health</a>
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
  console.log('🚀 === SERVIDOR ULTRA-SIMPLE INICIADO === 🚀');
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