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
  // Servir archivos estáticos de Next.js
  app.use('/_next', express.static(path.join(__dirname, '../.next')));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Manejar todas las rutas no-API sirviendo el HTML de Next.js
  app.get('*', (req, res, next) => {
    // Si es una ruta de API, continúa con el siguiente middleware
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Para otras rutas, servir el index.html
    res.sendFile(path.join(__dirname, '../.next/server/pages/index.html'), (err) => {
      if (err) {
        console.error('Error sirviendo archivo:', err);
        res.status(500).send('Error interno del servidor');
      }
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

const PORT = process.env.PORT || 8080;

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await db.initialize();
    console.log('Base de datos inicializada');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
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