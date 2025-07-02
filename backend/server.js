const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');

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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
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

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
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

const PORT = 3001;

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await db.initialize();
    console.log('Base de datos inicializada');
    
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 