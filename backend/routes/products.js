const express = require('express');
const { verifyBusinessToken, verifyUserToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Obtener productos de un negocio
router.get('/', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    
    const products = await db.query(
      `SELECT id, name, description, price, category, is_active, created_at
       FROM products 
       WHERE business_id = $1 
       ORDER BY created_at DESC`,
      [business_id]
    );
    
    res.json({
      products: products.rows
    });
    
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener producto por ID
router.get('/:id', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    
    const product = await db.query(
      `SELECT id, name, description, price, category, is_active, created_at
       FROM products 
       WHERE id = $1 AND business_id = $2`,
      [id, business_id]
    );
    
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({
      product: product.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear producto
router.post('/', verifyUserToken, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const { business_id, role } = req.user;
    
    // Solo owners pueden crear productos
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede crear productos' });
    }
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Nombre y precio son requeridos' });
    }
    
    const newProduct = await db.query(
      `INSERT INTO products (business_id, name, description, price, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, price, category, is_active, created_at`,
      [business_id, name, description, price, category]
    );
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct.rows[0]
    });
    
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar producto
router.put('/:id', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, is_active } = req.body;
    const { business_id, role } = req.user;
    
    // Solo owners pueden actualizar productos
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede actualizar productos' });
    }
    
    // Verificar que el producto pertenece al negocio
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE id = $1 AND business_id = $2',
      [id, business_id]
    );
    
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const updatedProduct = await db.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND business_id = $7
       RETURNING id, name, description, price, category, is_active, created_at`,
      [name, description, price, category, is_active, id, business_id]
    );
    
    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar producto
router.delete('/:id', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id, role } = req.user;
    
    // Solo owners pueden eliminar productos
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede eliminar productos' });
    }
    
    // Verificar que el producto pertenece al negocio
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE id = $1 AND business_id = $2',
      [id, business_id]
    );
    
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Soft delete - marcar como inactivo
    await db.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 