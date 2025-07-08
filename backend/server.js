const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-super-seguro';

const allowedOrigins = [
  'https://frontend-production-ff86.up.railway.app',
  'http://localhost:3000'
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Pedidos funcionando correctamente' });
});

// ===== AUTENTICACIÓN =====

// Registro de negocio
app.post('/api/auth/registro-negocio', async (req, res) => {
  try {
    const { nombreNegocio, nombreDueño, email, password, telefono, direccion } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario dueño
    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombreDueño,
        email,
        password: hashedPassword,
        telefono,
        tipo: 'DUEÑO'
      }
    });

    // Crear negocio
    const negocio = await prisma.negocio.create({
      data: {
        nombre: nombreNegocio,
        direccion,
        telefono,
        email,
        dueñoId: usuario.id
      }
    });

    // Generar token
    const token = jwt.sign(
      { userId: usuario.id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Negocio registrado exitosamente',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo: usuario.tipo
      },
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar el negocio' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        negocioDueño: true,
        negocioFranquiciado: true
      }
    });

    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo: user.tipo
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// ===== NEGOCIOS =====

// Obtener mi negocio
app.get('/api/negocios/mi-negocio', authenticateToken, async (req, res) => {
  try {
    let negocio;
    
    if (req.user.tipo === 'DUEÑO') {
      negocio = await prisma.negocio.findUnique({
        where: { dueñoId: req.user.id }
      });
    } else {
      negocio = await prisma.negocio.findUnique({
        where: { id: req.user.negocioId }
      });
    }

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    res.json(negocio);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el negocio' });
  }
});

// Estadísticas del negocio
app.get('/api/negocios/stats', authenticateToken, async (req, res) => {
  try {
    const negocioId = req.user.tipo === 'DUEÑO' 
      ? (await prisma.negocio.findUnique({ where: { dueñoId: req.user.id } }))?.id
      : req.user.negocioId;

    if (!negocioId) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    const [totalProductos, totalFranquiciados, pedidosPendientes, ventasMes] = await Promise.all([
      prisma.producto.count({ where: { negocioId, activo: true } }),
      prisma.usuario.count({ where: { negocioId, tipo: 'FRANQUICIADO', activo: true } }),
      prisma.pedido.count({ where: { negocioId, estado: 'NUEVO_PEDIDO' } }),
      prisma.pedido.aggregate({
        where: {
          negocioId,
          estado: { in: ['EN_FABRICACION', 'ENTREGADO'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { total: true }
      })
    ]);

    res.json({
      totalProductos,
      totalFranquiciados,
      pedidosPendientes,
      ventasMes: ventasMes._sum.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// ===== PRODUCTOS =====

// Obtener productos de mi negocio
app.get('/api/productos/mi-negocio', authenticateToken, async (req, res) => {
  try {
    const negocioId = req.user.tipo === 'DUEÑO' 
      ? (await prisma.negocio.findUnique({ where: { dueñoId: req.user.id } }))?.id
      : req.user.negocioId;

    const productos = await prisma.producto.findMany({
      where: { negocioId, activo: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear producto
app.post('/api/productos', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Solo los dueños pueden crear productos' });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { dueñoId: req.user.id }
    });

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    const { nombre, descripcion, precio, peso, categoria } = req.body;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        peso: peso ? parseFloat(peso) : null,
        categoria,
        negocioId: negocio.id
      }
    });

    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Actualizar producto
app.put('/api/productos/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Solo los dueños pueden editar productos' });
    }

    const { id } = req.params;
    const { nombre, descripcion, precio, peso, categoria } = req.body;

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        peso: peso ? parseFloat(peso) : null,
        categoria
      }
    });

    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto
app.delete('/api/productos/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Solo los dueños pueden eliminar productos' });
    }

    const { id } = req.params;

    await prisma.producto.update({
      where: { id },
      data: { activo: false }
    });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// ===== USUARIOS/FRANQUICIADOS =====

// Obtener franquiciados
app.get('/api/usuarios/franquiciados', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { dueñoId: req.user.id }
    });

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    const franquiciados = await prisma.usuario.findMany({
      where: { 
        negocioId: negocio.id,
        tipo: 'FRANQUICIADO'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(franquiciados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener franquiciados' });
  }
});

// Crear franquiciado
app.post('/api/usuarios/franquiciados', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Solo los dueños pueden crear franquiciados' });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { dueñoId: req.user.id }
    });

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    const { nombre, email, telefono, password } = req.body;

    // Validar que se proporcione la contraseña
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Usar la contraseña proporcionada
    const hashedPassword = await bcrypt.hash(password, 10);

    const franquiciado = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        telefono,
        tipo: 'FRANQUICIADO',
        negocioId: negocio.id
      }
    });

    // TODO: Enviar email con credenciales
    console.log(`Nuevo franquiciado creado: ${email}`);

    res.status(201).json({
      message: 'Franquiciado creado exitosamente',
      franquiciado: {
        id: franquiciado.id,
        nombre: franquiciado.nombre,
        email: franquiciado.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear franquiciado' });
  }
});

// Cambiar estado de usuario
app.put('/api/usuarios/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { id } = req.params;
    const { activo } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo }
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
});

// Cambiar contraseña
app.put('/api/usuarios/:id/change-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    // Validar que se proporcione la contraseña
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el usuario existe y es del mismo negocio
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { negocioFranquiciado: true }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el usuario pertenece al negocio del dueño
    const negocio = await prisma.negocio.findUnique({
      where: { dueñoId: req.user.id }
    });

    if (!negocio || usuario.negocioId !== negocio.id) {
      return res.status(403).json({ message: 'No tienes permisos para cambiar la contraseña de este usuario' });
    }

    // Cambiar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword }
    });

    console.log(`Contraseña cambiada para usuario ${usuario.email}`);

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
});

// Resetear contraseña
app.post('/api/usuarios/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { id } = req.params;

    // Generar nueva contraseña
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // TODO: Enviar email con nueva contraseña
    console.log(`Contraseña reseteada para usuario ${id}: ${newPassword}`);

    res.json({ message: 'Contraseña reseteada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
});

// ===== PEDIDOS =====

// Obtener mis pedidos (franquiciado)
app.get('/api/pedidos/mis-pedidos', authenticateToken, async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: req.user.id },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Obtener todos los pedidos del negocio (dueño)
app.get('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { dueñoId: req.user.id }
    });

    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { negocioId: negocio.id },
      include: {
        detalles: {
          include: {
            producto: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Crear pedido
app.post('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    const { productos, notas } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener al menos un producto' });
    }

    // Generar número de pedido
    const numero = `PED-${Date.now()}`;
    
    // Calcular total - no verificar stock ya que es para fabricación
    let total = 0;
    const detalles = [];
    
    for (const item of productos) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      });
      
      if (!producto || !producto.activo) {
        throw new Error(`Producto ${item.productoId} no encontrado`);
      }
      
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      
      detalles.push({
        cantidad: item.cantidad,
        precio: producto.precio,
        subtotal,
        productoId: item.productoId
      });
    }
    
    // Crear pedido con estado inicial "NUEVO_PEDIDO"
    const pedido = await prisma.pedido.create({
      data: {
        numero,
        total,
        notas,
        estado: 'NUEVO_PEDIDO',
        negocioId: req.user.negocioId,
        usuarioId: req.user.id,
        detalles: {
          create: detalles
        }
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    
    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar estado del pedido
app.put('/api/pedidos/:id/estado', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'DUEÑO') {
      return res.status(403).json({ message: 'Solo los dueños pueden cambiar estados' });
    }

    const { id } = req.params;
    const { estado } = req.body;
    
    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['NUEVO_PEDIDO', 'EN_FABRICACION', 'ENTREGADO'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado }
    });
    
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
});

// ===== CARRILLO =====

// Obtener carrito (simulado en sesión)
app.get('/api/carrito', authenticateToken, async (req, res) => {
  // Por simplicidad, el carrito se maneja en el frontend
  // En una implementación real, se guardaría en la base de datos
  res.json({ items: [] });
});

// Agregar al carrito
app.post('/api/carrito/agregar', authenticateToken, async (req, res) => {
  // Por simplicidad, solo validamos que el producto existe
  try {
    const { productoId, cantidad } = req.body;
    
    const producto = await prisma.producto.findUnique({
      where: { id: productoId }
    });
    
    if (!producto || !producto.activo) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
});

// Actualizar carrito
app.put('/api/carrito/actualizar', authenticateToken, async (req, res) => {
  res.json({ message: 'Carrito actualizado' });
});

// Eliminar del carrito
app.delete('/api/carrito/eliminar/:productoId', authenticateToken, async (req, res) => {
  res.json({ message: 'Producto eliminado del carrito' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores de Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 