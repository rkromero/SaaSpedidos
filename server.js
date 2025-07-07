const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Pedidos funcionando correctamente' });
});

// Rutas para Espacios
app.get('/api/espacios', async (req, res) => {
  try {
    const espacios = await prisma.espacio.findMany({
      where: { activo: true },
      include: {
        productos: {
          where: { activo: true }
        }
      }
    });
    res.json(espacios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/espacios', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const espacio = await prisma.espacio.create({
      data: { nombre, descripcion }
    });
    res.status(201).json(espacio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para Productos
app.get('/api/productos/:espacioId', async (req, res) => {
  try {
    const { espacioId } = req.params;
    const productos = await prisma.producto.findMany({
      where: { 
        espacioId,
        activo: true 
      }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria, espacioId } = req.body;
    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen,
        categoria,
        espacioId
      }
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para Usuarios
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const usuario = await prisma.usuario.create({
      data: { nombre, email, telefono }
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para Pedidos
app.post('/api/pedidos', async (req, res) => {
  try {
    const { espacioId, usuarioId, productos, notas } = req.body;
    
    // Generar número de pedido
    const numero = `PED-${Date.now()}`;
    
    // Calcular total
    let total = 0;
    const detalles = [];
    
    for (const item of productos) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      });
      
      if (!producto) {
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
    
    // Crear pedido con detalles
    const pedido = await prisma.pedido.create({
      data: {
        numero,
        total,
        notas,
        espacioId,
        usuarioId,
        detalles: {
          create: detalles
        }
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        },
        usuario: true,
        espacio: true
      }
    });
    
    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pedidos/:espacioId', async (req, res) => {
  try {
    const { espacioId } = req.params;
    const pedidos = await prisma.pedido.findMany({
      where: { espacioId },
      include: {
        detalles: {
          include: {
            producto: true
          }
        },
        usuario: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado del pedido
app.patch('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado }
    });
    
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores de Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 