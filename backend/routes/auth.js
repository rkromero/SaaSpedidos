const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Registro de negocio
router.post('/business/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }
    
    // Verificar si el negocio ya existe
    const existingBusiness = await db.query(
      'SELECT id FROM businesses WHERE email = $1',
      [email]
    );
    
    if (existingBusiness.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un negocio con ese email' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar negocio (plan Free por defecto)
    const newBusiness = await db.query(
      `INSERT INTO businesses (name, email, password, phone, address, plan_id)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING id, name, email, phone, address, plan_id`,
      [name, email, hashedPassword, phone, address]
    );
    
    // Crear usuario owner por defecto
    await db.query(
      `INSERT INTO users (business_id, name, email, password, role)
       VALUES ($1, $2, $3, $4, 'owner')`,
      [newBusiness.rows[0].id, name, email, hashedPassword]
    );
    
    // Generar token
    const token = generateToken({
      id: newBusiness.rows[0].id,
      email: newBusiness.rows[0].email,
      type: 'business'
    });
    
    res.status(201).json({
      message: 'Negocio registrado exitosamente',
      business: newBusiness.rows[0],
      token
    });
    
  } catch (error) {
    console.error('Error al registrar negocio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Login de negocio
router.post('/business/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    // Buscar negocio
    const business = await db.query(
      'SELECT id, name, email, password, status FROM businesses WHERE email = $1',
      [email]
    );
    
    if (business.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, business.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    if (business.rows[0].status !== 'active') {
      return res.status(403).json({ message: 'Negocio inactivo' });
    }
    
    // Generar token
    const token = generateToken({
      id: business.rows[0].id,
      email: business.rows[0].email,
      type: 'business'
    });
    
    res.json({
      message: 'Login exitoso',
      business: {
        id: business.rows[0].id,
        name: business.rows[0].name,
        email: business.rows[0].email
      },
      token
    });
    
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/user/login', async (req, res) => {
  try {
    const { email, password, businessId } = req.body;
    
    if (!email || !password || !businessId) {
      return res.status(400).json({ message: 'Email, contraseña y ID de negocio son requeridos' });
    }
    
    // Buscar usuario
    const user = await db.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.business_id, b.name as business_name
       FROM users u
       JOIN businesses b ON u.business_id = b.id
       WHERE u.email = $1 AND u.business_id = $2 AND u.is_active = true`,
      [email, businessId]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = generateToken({
      id: user.rows[0].id,
      email: user.rows[0].email,
      businessId: user.rows[0].business_id,
      type: 'user'
    });
    
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
        businessName: user.rows[0].business_name
      },
      token
    });
    
  } catch (error) {
    console.error('Error al hacer login de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Login de admin
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    // Buscar admin
    const admin = await db.query(
      'SELECT id, name, email, password, role FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (admin.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, admin.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = generateToken({
      id: admin.rows[0].id,
      email: admin.rows[0].email,
      type: 'admin'
    });
    
    res.json({
      message: 'Login exitoso',
      admin: {
        id: admin.rows[0].id,
        name: admin.rows[0].name,
        email: admin.rows[0].email,
        role: admin.rows[0].role
      },
      token
    });
    
  } catch (error) {
    console.error('Error al hacer login de admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      message: 'Token válido',
      user: decoded
    });
    
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router; 