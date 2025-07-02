const express = require('express');
const { verifyAdminToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Dashboard administrativo
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    // Estadísticas generales
    const generalStats = await db.query(
      `SELECT 
         COUNT(DISTINCT b.id) as total_businesses,
         COUNT(DISTINCT u.id) as total_users,
         COUNT(DISTINCT o.id) as total_orders,
         COALESCE(SUM(o.total_amount), 0) as total_revenue
       FROM businesses b
       LEFT JOIN users u ON b.id = u.business_id
       LEFT JOIN orders o ON b.id = o.business_id`
    );
    
    // Negocios por plan
    const businessesByPlan = await db.query(
      `SELECT p.name, COUNT(b.id) as count
       FROM plans p
       LEFT JOIN businesses b ON p.id = b.plan_id
       GROUP BY p.id, p.name
       ORDER BY p.price`
    );
    
    // Crecimiento mensual
    const monthlyGrowth = await db.query(
      `SELECT 
         DATE_TRUNC('month', created_at) as month,
         COUNT(*) as new_businesses
       FROM businesses 
       WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC`
    );
    
    // Ingresos mensuales
    const monthlyRevenue = await db.query(
      `SELECT 
         DATE_TRUNC('month', o.created_at) as month,
         COALESCE(SUM(o.total_amount), 0) as revenue
       FROM orders o
       WHERE o.created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', o.created_at)
       ORDER BY month DESC`
    );
    
    // Top negocios por ingresos
    const topBusinesses = await db.query(
      `SELECT b.name, b.email, COUNT(o.id) as total_orders, COALESCE(SUM(o.total_amount), 0) as total_revenue
       FROM businesses b
       LEFT JOIN orders o ON b.id = o.business_id
       GROUP BY b.id, b.name, b.email
       ORDER BY total_revenue DESC
       LIMIT 10`
    );
    
    res.json({
      generalStats: generalStats.rows[0],
      businessesByPlan: businessesByPlan.rows,
      monthlyGrowth: monthlyGrowth.rows,
      monthlyRevenue: monthlyRevenue.rows,
      topBusinesses: topBusinesses.rows
    });
    
  } catch (error) {
    console.error('Error en dashboard admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los negocios
router.get('/businesses', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.id, b.name, b.email, b.phone, b.status, b.created_at,
             p.name as plan_name, p.price as plan_price,
             COUNT(u.id) as user_count,
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM businesses b
      LEFT JOIN plans p ON b.plan_id = p.id
      LEFT JOIN users u ON b.id = u.business_id AND u.is_active = true
      LEFT JOIN orders o ON b.id = o.business_id
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      query += ` WHERE b.name ILIKE $${++paramCount} OR b.email ILIKE $${++paramCount}`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` GROUP BY b.id, p.name, p.price ORDER BY b.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const businesses = await db.query(query, params);
    
    res.json({
      businesses: businesses.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: businesses.rows.length
      }
    });
    
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Detalles de un negocio específico
router.get('/businesses/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const business = await db.query(
      `SELECT b.*, p.name as plan_name, p.price as plan_price
       FROM businesses b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (business.rows.length === 0) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }
    
    // Usuarios del negocio
    const users = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE business_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    
    // Estadísticas del negocio
    const stats = await db.query(
      `SELECT 
         COUNT(DISTINCT p.id) as total_products,
         COUNT(DISTINCT o.id) as total_orders,
         COALESCE(SUM(o.total_amount), 0) as total_revenue
       FROM businesses b
       LEFT JOIN products p ON b.id = p.business_id AND p.is_active = true
       LEFT JOIN orders o ON b.id = o.business_id
       WHERE b.id = $1`,
      [id]
    );
    
    res.json({
      business: business.rows[0],
      users: users.rows,
      stats: stats.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener detalles del negocio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Cambiar estado de un negocio
router.put('/businesses/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const updatedBusiness = await db.query(
      `UPDATE businesses 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, status`,
      [status, id]
    );
    
    if (updatedBusiness.rows.length === 0) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }
    
    res.json({
      message: 'Estado del negocio actualizado',
      business: updatedBusiness.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los pedidos (vista global)
router.get('/orders', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, business_id, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.id, o.customer_name, o.total_amount, o.status, o.created_at,
             b.name as business_name, b.email as business_email,
             u.name as created_by
      FROM orders o
      JOIN businesses b ON o.business_id = b.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (business_id) {
      query += ` AND o.business_id = $${++paramCount}`;
      params.push(business_id);
    }
    
    if (status) {
      query += ` AND o.status = $${++paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const orders = await db.query(query, params);
    
    res.json({
      orders: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Métricas avanzadas
router.get('/metrics', verifyAdminToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '365 days'";
        break;
    }
    
    // Métricas de crecimiento
    const growthMetrics = await db.query(
      `SELECT 
         COUNT(DISTINCT b.id) as new_businesses,
         COUNT(DISTINCT u.id) as new_users,
         COUNT(DISTINCT o.id) as new_orders,
         COALESCE(SUM(o.total_amount), 0) as period_revenue
       FROM businesses b
       LEFT JOIN users u ON b.id = u.business_id
       LEFT JOIN orders o ON b.id = o.business_id
       WHERE 1=1 ${dateFilter.replace('created_at', 'b.created_at')}`
    );
    
    // Retención de negocios
    const retention = await db.query(
      `SELECT 
         COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_businesses,
         COUNT(DISTINCT b.id) as total_businesses,
         ROUND(
           COUNT(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) * 100.0 / 
           NULLIF(COUNT(DISTINCT b.id), 0), 2
         ) as retention_rate
       FROM businesses b
       LEFT JOIN orders o ON b.id = o.business_id`
    );
    
    res.json({
      growth: growthMetrics.rows[0],
      retention: retention.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 