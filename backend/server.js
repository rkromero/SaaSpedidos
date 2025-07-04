const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// Importar base de datos
const db = require('./config/database');

const app = express();
const server = http.createServer(app);

// Desactivar Socket.io temporalmente para debugging
/*const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? "*" : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false
  }
});*/

// Mock io para que no falle el código
const io = { 
  on: () => {},
  emit: () => {}
};

// Middleware - Configuración simplificada para Railway
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
}
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? "*" : "http://localhost:3000",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Hacer io disponible en todas las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Rutas de API importantes (ANTES del manejo de archivos estáticos)
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check solicitado');
  try {
    // Respuesta simple y directa
    res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check adicional más simple
app.get('/health', (req, res) => {
  console.log('🔍 Health check simple solicitado');
  res.status(200).send('OK');
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'SaaS Gestión Pedidos API', 
    status: 'running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Configurando servidor de archivos estáticos...');
  
  // Servir archivos estáticos de Next.js
  app.use('/_next', express.static(path.join(__dirname, '../.next')));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Manejar todas las rutas no-API sirviendo una página simple
  app.get('*', (req, res, next) => {
    // Si es una ruta de API, continúa con el siguiente middleware
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    console.log('📄 Sirviendo página para:', req.path);
    
    // Para otras rutas, servir una página HTML simple
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SaaS Gestión Pedidos</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .status { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .api-link { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .api-link:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 SaaS Gestión Pedidos</h1>
            <div class="status">
              <strong>✅ Servidor funcionando correctamente</strong><br>
              <p>El backend está activo y la API está disponible.</p>
            </div>
            <p>Puedes acceder a:</p>
            <ul>
              <li><a href="/api/health" class="api-link">API Health Check</a></li>
              <li><a href="/api" class="api-link">API Info</a></li>
            </ul>
            <p><strong>Estado:</strong> Listo para recibir peticiones</p>
            <p><strong>Entorno:</strong> ${process.env.NODE_ENV}</p>
            <p><strong>Puerto:</strong> ${PORT}</p>
          </div>
        </body>
      </html>
    `);
  });
} else {
  // En desarrollo, solo servir una página simple de información
  app.get('/', (req, res) => {
    res.json({ 
      message: 'SaaS Gestión Pedidos - Servidor de desarrollo',
      status: 'running',
      environment: process.env.NODE_ENV,
      frontend: 'http://localhost:3000',
      api: 'http://localhost:3000/api'
    });
  });
}

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Socket.io para tiempo real (DESACTIVADO TEMPORALMENTE)
/*io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  // Unirse a sala de negocio
  socket.on('join-business', (businessId) => {
    socket.join(`business-${businessId}`);
    console.log(`Usuario ${socket.id} se unió a business-${businessId}`);
  });
  
  // Unirse a sala de admin
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log(`Usuario ${socket.id} se unió a admin`);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});*/

// FORZAR USO DEL PUERTO CORRECTO DE RAILWAY
const PORT = process.env.PORT || 3000;

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log('🚀 === NUEVA VERSIÓN DESPLEGADA === 🚀');
    console.log('🚀 Iniciando servidor SaaS Gestión Pedidos...');
    console.log('🔧 process.env.PORT:', process.env.PORT);
    console.log('🔧 Puerto final:', PORT);
    console.log('🔧 Entorno:', process.env.NODE_ENV);
    console.log('🔧 Timestamp:', new Date().toISOString());
    
    if (!process.env.PORT) {
      console.log('⚠️  ADVERTENCIA: process.env.PORT no está definido, usando puerto 3000');
    }
    
    // Inicializar base de datos
    await db.initialize();
    console.log('✅ Base de datos inicializada');
    
    // Iniciar servidor
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ === SERVIDOR CORRIENDO EN PUERTO ${PORT} === ✅`);
      console.log(`✅ Entorno: ${process.env.NODE_ENV}`);
      console.log(`✅ Servidor listo para recibir conexiones`);
      console.log(`✅ URL Health Check: http://localhost:${PORT}/api/health`);
      console.log(`✅ Timestamp: ${new Date().toISOString()}`);
    });
    
    // Manejar cierre graceful
    process.on('SIGTERM', () => {
      console.log('🔴 Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('🔴 Servidor cerrado');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app; 