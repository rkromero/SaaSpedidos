const express = require('express');
const { verifyUserToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Obtener pedidos de un negocio
router.get('/', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.id, o.customer_name, o.customer_phone, o.total_amount, o.status, o.notes, 
             o.created_at, u.name as created_by,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'total_price', oi.total_price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.business_id = $1
    `;
    
    const params = [business_id];
    let paramCount = 1;
    
    if (status) {
      query += ` AND o.status = $${++paramCount}`;
      params.push(status);
    }
    
    query += ` GROUP BY o.id, u.name ORDER BY o.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const orders = await db.query(query, params);
    
    res.json({
      orders: orders.rows
    });
    
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedido por ID
router.get('/:id', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    
    const order = await db.query(
      `SELECT o.id, o.customer_name, o.customer_phone, o.total_amount, o.status, o.notes, 
              o.created_at, u.name as created_by,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'product_name', p.name,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
                    'total_price', oi.total_price
                  )
                ) FILTER (WHERE oi.id IS NOT NULL), '[]'
              ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND o.business_id = $2
       GROUP BY o.id, u.name`,
      [id, business_id]
    );
    
    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    res.json({
      order: order.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear pedido
router.post('/', verifyUserToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer_name, customer_phone, items, notes } = req.body;
    const { business_id, id: user_id } = req.user;
    
    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ message: 'Nombre del cliente e items son requeridos' });
    }
    
    // Calcular total
    let total_amount = 0;
    for (const item of items) {
      const product = await client.query(
        'SELECT price FROM products WHERE id = $1 AND business_id = $2 AND is_active = true',
        [item.product_id, business_id]
      );
      
      if (product.rows.length === 0) {
        throw new Error(`Producto con ID ${item.product_id} no encontrado`);
      }
      
      total_amount += product.rows[0].price * item.quantity;
    }
    
    // Crear pedido
    const newOrder = await client.query(
      `INSERT INTO orders (business_id, user_id, customer_name, customer_phone, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, customer_name, customer_phone, total_amount, status, notes, created_at`,
      [business_id, user_id, customer_name, customer_phone, total_amount, notes]
    );
    
    const orderId = newOrder.rows[0].id;
    
    // Crear items del pedido
    const orderItems = [];
    for (const item of items) {
      const product = await client.query(
        'SELECT price FROM products WHERE id = $1 AND business_id = $2',
        [item.product_id, business_id]
      );
      
      const unit_price = product.rows[0].price;
      const total_price = unit_price * item.quantity;
      
      const orderItem = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, quantity, unit_price, total_price`,
        [orderId, item.product_id, item.quantity, unit_price, total_price]
      );
      
      orderItems.push(orderItem.rows[0]);
    }
    
    await client.query('COMMIT');
    
    const orderWithItems = {
      ...newOrder.rows[0],
      items: orderItems
    };
    
    // Emitir evento de tiempo real
    req.io.to(`business-${business_id}`).emit('new-order', orderWithItems);
    req.io.to('admin').emit('new-order', { businessId: business_id, order: orderWithItems });
    
    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: orderWithItems
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pedido:', error);
    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// Actualizar estado de pedido
router.put('/:id/status', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { business_id, role } = req.user;
    
    const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    // Solo owners pueden cambiar a cancelled
    if (status === 'cancelled' && role !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede cancelar pedidos' });
    }
    
    // Verificar que el pedido pertenece al negocio
    const existingOrder = await db.query(
      'SELECT id, status FROM orders WHERE id = $1 AND business_id = $2',
      [id, business_id]
    );
    
    if (existingOrder.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    const updatedOrder = await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND business_id = $3
       RETURNING id, customer_name, total_amount, status, created_at`,
      [status, id, business_id]
    );
    
    // Emitir evento de tiempo real
    req.io.to(`business-${business_id}`).emit('order-updated', updatedOrder.rows[0]);
    req.io.to('admin').emit('order-updated', { businessId: business_id, order: updatedOrder.rows[0] });
    
    res.json({
      message: 'Estado del pedido actualizado',
      order: updatedOrder.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de pedidos
router.get('/stats/summary', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }
    
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_orders,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
         COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
         COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
         COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders 
       WHERE business_id = $1 ${dateFilter}`,
      [business_id]
    );
    
    res.json({
      stats: stats.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 