const express = require('express');
const { verifyBusinessToken, verifyUserToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Obtener información del negocio actual
router.get('/profile', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    
    const business = await db.query(
      `SELECT b.id, b.name, b.email, b.phone, b.address, b.status, b.created_at,
              p.name as plan_name, p.price as plan_price, p.max_users, p.max_products, p.max_orders_per_month
       FROM businesses b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.id = $1`,
      [business_id]
    );
    
    if (business.rows.length === 0) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }
    
    // Obtener estadísticas de uso
    const stats = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM users WHERE business_id = $1 AND is_active = true) as current_users,
         (SELECT COUNT(*) FROM products WHERE business_id = $1 AND is_active = true) as current_products,
         (SELECT COUNT(*) FROM orders WHERE business_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_this_month
      `,
      [business_id]
    );
    
    res.json({
      business: {
        ...business.rows[0],
        usage: stats.rows[0]
      }
    });
    
  } catch (error) {
    console.error('Error al obtener perfil del negocio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar información del negocio
router.put('/profile', verifyUserToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const { business_id, role } = req.user;
    
    // Solo el owner puede actualizar el negocio
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede actualizar la información del negocio' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    const updatedBusiness = await db.query(
      `UPDATE businesses 
       SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, phone, address, email, created_at`,
      [name, phone, address, business_id]
    );
    
    res.json({
      message: 'Información del negocio actualizada exitosamente',
      business: updatedBusiness.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los planes disponibles
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.query(
      `SELECT id, name, price, max_users, max_products, max_orders_per_month, features
       FROM plans 
       ORDER BY price ASC`
    );
    
    res.json({
      plans: plans.rows
    });
    
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Dashboard del negocio
router.get('/dashboard', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    
    // Stats generales
    const stats = await db.query(
      `SELECT 
         COUNT(DISTINCT p.id) as total_products,
         COUNT(DISTINCT u.id) as total_users,
         COUNT(DISTINCT o.id) as total_orders,
         COALESCE(SUM(o.total_amount), 0) as total_revenue
       FROM businesses b
       LEFT JOIN products p ON b.id = p.business_id AND p.is_active = true
       LEFT JOIN users u ON b.id = u.business_id AND u.is_active = true
       LEFT JOIN orders o ON b.id = o.business_id
       WHERE b.id = $1`,
      [business_id]
    );
    
    // Pedidos recientes
    const recentOrders = await db.query(
      `SELECT id, customer_name, total_amount, status, created_at
       FROM orders 
       WHERE business_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [business_id]
    );
    
    // Pedidos por estado
    const ordersByStatus = await db.query(
      `SELECT status, COUNT(*) as count
       FROM orders 
       WHERE business_id = $1 
       GROUP BY status`,
      [business_id]
    );
    
    // Ingresos por día (últimos 7 días)
    const dailyRevenue = await db.query(
      `SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue
       FROM orders 
       WHERE business_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [business_id]
    );
    
    // Productos más vendidos
    const topProducts = await db.query(
      `SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.business_id = $1
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [business_id]
    );
    
    res.json({
      stats: stats.rows[0],
      recentOrders: recentOrders.rows,
      ordersByStatus: ordersByStatus.rows,
      dailyRevenue: dailyRevenue.rows,
      topProducts: topProducts.rows
    });
    
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener configuración del negocio
router.get('/settings', verifyUserToken, async (req, res) => {
  try {
    const { business_id, role } = req.user;
    
    // Solo el owner puede ver la configuración
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede ver la configuración' });
    }
    
    const business = await db.query(
      `SELECT b.id, b.name, b.email, b.phone, b.address, b.plan_id, b.status,
              p.name as plan_name, p.price as plan_price, p.max_users, p.max_products, p.max_orders_per_month
       FROM businesses b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.id = $1`,
      [business_id]
    );
    
    res.json({
      business: business.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Verificar límites del plan
router.get('/limits', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    
    const limits = await db.query(
      `SELECT 
         p.max_users, p.max_products, p.max_orders_per_month,
         (SELECT COUNT(*) FROM users WHERE business_id = $1 AND is_active = true) as current_users,
         (SELECT COUNT(*) FROM products WHERE business_id = $1 AND is_active = true) as current_products,
         (SELECT COUNT(*) FROM orders WHERE business_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as current_orders
       FROM businesses b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.id = $1`,
      [business_id]
    );
    
    const limit = limits.rows[0];
    
    res.json({
      limits: {
        users: {
          max: limit.max_users,
          current: parseInt(limit.current_users),
          available: limit.max_users - parseInt(limit.current_users)
        },
        products: {
          max: limit.max_products,
          current: parseInt(limit.current_products),
          available: limit.max_products - parseInt(limit.current_products)
        },
        orders: {
          max: limit.max_orders_per_month,
          current: parseInt(limit.current_orders),
          available: limit.max_orders_per_month - parseInt(limit.current_orders)
        }
      }
    });
    
  } catch (error) {
    console.error('Error al obtener límites:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 