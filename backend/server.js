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
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? "*" : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false
  }
});

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
      api: 'http://localhost:8080/api'
    });
  });
}

// Ruta raíz para el backend
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SaaS Gestión Pedidos API', 
    status: 'running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

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

// Socket.io para tiempo real
io.on('connection', (socket) => {
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
});

const PORT = process.env.PORT || 3000;

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor SaaS Gestión Pedidos...');
    console.log('🔧 process.env.PORT:', process.env.PORT);
    console.log('🔧 Puerto final:', PORT);
    console.log('🔧 Entorno:', process.env.NODE_ENV);
    console.log('🔧 Timestamp:', new Date().toISOString());
    
    await db.initialize();
    console.log('✅ Base de datos inicializada');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`✅ Entorno: ${process.env.NODE_ENV}`);
      console.log(`✅ Servidor listo para recibir conexiones`);
      console.log(`✅ Timestamp: ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
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