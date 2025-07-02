const express = require('express');
const { verifyUserToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Configuración de MercadoPago (con fallback hardcodeado para MVP)
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890-MERCADOPAGO-ACCESS-TOKEN';
const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY || 'TEST-MERCADOPAGO-PUBLIC-KEY';

// Obtener configuración de MercadoPago para el frontend
router.get('/config', async (req, res) => {
  try {
    res.json({
      publicKey: MERCADOPAGO_PUBLIC_KEY,
      currency: 'ARS'
    });
  } catch (error) {
    console.error('Error al obtener configuración de pagos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear preferencia de pago
router.post('/create-preference', verifyUserToken, async (req, res) => {
  try {
    const { order_id, items, payer } = req.body;
    const { business_id } = req.user;
    
    // Verificar que el pedido pertenece al negocio
    const order = await db.query(
      'SELECT id, total_amount, customer_name FROM orders WHERE id = $1 AND business_id = $2',
      [order_id, business_id]
    );
    
    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Simular creación de preferencia de MercadoPago
    const preference = {
      id: `PREF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: items.map(item => ({
        id: item.id.toString(),
        title: item.title,
        currency_id: 'ARS',
        picture_url: item.picture_url || '',
        description: item.description || '',
        category_id: item.category_id || 'others',
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price)
      })),
      payer: {
        name: payer.name || order.rows[0].customer_name,
        email: payer.email || `customer-${order_id}@example.com`
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: `${req.protocol}://${req.get('host')}/api/payments/success`,
        failure: `${req.protocol}://${req.get('host')}/api/payments/failure`,
        pending: `${req.protocol}://${req.get('host')}/api/payments/pending`
      },
      auto_return: 'approved',
      external_reference: order_id.toString(),
      notification_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Registrar el intento de pago
    await db.query(
      `INSERT INTO payments (business_id, order_id, amount, payment_method, payment_status, external_payment_id)
       VALUES ($1, $2, $3, 'mercadopago', 'pending', $4)`,
      [business_id, order_id, order.rows[0].total_amount, preference.id]
    );
    
    res.json({
      preference_id: preference.id,
      init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`,
      preference: preference
    });
    
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Webhook de MercadoPago
router.post('/webhook', async (req, res) => {
  try {
    const { id, live_mode, type, date_created, application_id, user_id, version, api_version } = req.body;
    
    console.log('Webhook recibido:', req.body);
    
    if (type === 'payment') {
      // Simular obtención de información del pago desde MercadoPago
      const paymentInfo = {
        id: id,
        status: 'approved', // approved, rejected, pending, cancelled
        status_detail: 'accredited',
        payment_method_id: 'visa',
        payment_type_id: 'credit_card',
        transaction_amount: 1000,
        external_reference: '123' // order_id
      };
      
      // Actualizar el estado del pago
      await db.query(
        `UPDATE payments 
         SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE external_payment_id LIKE $2`,
        [paymentInfo.status, `%${paymentInfo.external_reference}%`]
      );
      
      // Si el pago fue aprobado, actualizar el estado del pedido
      if (paymentInfo.status === 'approved') {
        await db.query(
          `UPDATE orders 
           SET status = 'paid', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [paymentInfo.external_reference]
        );
      }
    }
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
});

// Éxito en el pago
router.get('/success', async (req, res) => {
  try {
    const { collection_id, collection_status, external_reference } = req.query;
    
    // Actualizar el estado del pago
    if (collection_status === 'approved') {
      await db.query(
        `UPDATE payments 
         SET payment_status = 'approved', updated_at = CURRENT_TIMESTAMP
         WHERE external_payment_id = $1`,
        [collection_id]
      );
      
      await db.query(
        `UPDATE orders 
         SET status = 'paid', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [external_reference]
      );
    }
    
    res.redirect(`http://localhost:3000/dashboard/orders/${external_reference}?payment=success`);
    
  } catch (error) {
    console.error('Error en éxito de pago:', error);
    res.redirect('http://localhost:3000/dashboard/orders?payment=error');
  }
});

// Fallo en el pago
router.get('/failure', async (req, res) => {
  try {
    const { collection_id, external_reference } = req.query;
    
    // Actualizar el estado del pago
    await db.query(
      `UPDATE payments 
       SET payment_status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE external_payment_id = $1`,
      [collection_id]
    );
    
    res.redirect(`http://localhost:3000/dashboard/orders/${external_reference}?payment=failure`);
    
  } catch (error) {
    console.error('Error en fallo de pago:', error);
    res.redirect('http://localhost:3000/dashboard/orders?payment=error');
  }
});

// Pago pendiente
router.get('/pending', async (req, res) => {
  try {
    const { collection_id, external_reference } = req.query;
    
    // Actualizar el estado del pago
    await db.query(
      `UPDATE payments 
       SET payment_status = 'pending', updated_at = CURRENT_TIMESTAMP
       WHERE external_payment_id = $1`,
      [collection_id]
    );
    
    res.redirect(`http://localhost:3000/dashboard/orders/${external_reference}?payment=pending`);
    
  } catch (error) {
    console.error('Error en pago pendiente:', error);
    res.redirect('http://localhost:3000/dashboard/orders?payment=error');
  }
});

// Obtener historial de pagos
router.get('/history', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { limit = 50, offset = 0 } = req.query;
    
    const payments = await db.query(
      `SELECT p.id, p.amount, p.payment_method, p.payment_status, p.created_at,
              o.id as order_id, o.customer_name, o.total_amount as order_total
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.business_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [business_id, limit, offset]
    );
    
    res.json({
      payments: payments.rows
    });
    
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Estadísticas de pagos
router.get('/stats', verifyUserToken, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND DATE(p.created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }
    
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_payments,
         COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as approved_payments,
         COUNT(CASE WHEN payment_status = 'rejected' THEN 1 END) as rejected_payments,
         COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
         COALESCE(SUM(CASE WHEN payment_status = 'approved' THEN amount END), 0) as total_revenue
       FROM payments p
       WHERE business_id = $1 ${dateFilter}`,
      [business_id]
    );
    
    res.json({
      stats: stats.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 