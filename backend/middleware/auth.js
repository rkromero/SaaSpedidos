const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Clave secreta hardcodeada para MVP
const JWT_SECRET = 'mi-clave-secreta-super-segura-2024';

// Middleware para verificar token de negocio
async function verifyBusinessToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si es un negocio
    if (decoded.type !== 'business') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Verificar si el negocio existe
    const business = await db.query(
      'SELECT id, name, email, status FROM businesses WHERE id = $1',
      [decoded.id]
    );
    
    if (business.rows.length === 0) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }
    
    if (business.rows[0].status !== 'active') {
      return res.status(403).json({ message: 'Negocio inactivo' });
    }
    
    req.business = business.rows[0];
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Middleware para verificar token de usuario
async function verifyUserToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si es un usuario
    if (decoded.type !== 'user') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Verificar si el usuario existe
    const user = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.business_id, b.name as business_name
       FROM users u
       JOIN businesses b ON u.business_id = b.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Middleware para verificar token de admin
async function verifyAdminToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si es un admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Verificar si el admin existe
    const admin = await db.query(
      'SELECT id, name, email, role FROM admin_users WHERE id = $1',
      [decoded.id]
    );
    
    if (admin.rows.length === 0) {
      return res.status(404).json({ message: 'Admin no encontrado' });
    }
    
    req.admin = admin.rows[0];
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Middleware para verificar roles de usuario
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    
    next();
  };
}

// Función para generar token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  verifyBusinessToken,
  verifyUserToken,
  verifyAdminToken,
  requireRole,
  generateToken,
  JWT_SECRET
}; 