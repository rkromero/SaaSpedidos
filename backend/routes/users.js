const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyUserToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Obtener usuarios del negocio
router.get('/', verifyUserToken, requireRole(['owner']), async (req, res) => {
  try {
    const { business_id } = req.user;
    
    const users = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users 
       WHERE business_id = $1 
       ORDER BY created_at DESC`,
      [business_id]
    );
    
    res.json({
      users: users.rows
    });
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear usuario
router.post('/', verifyUserToken, requireRole(['owner']), async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;
    const { business_id } = req.user;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }
    
    // Verificar si el usuario ya existe en este negocio
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 AND business_id = $2',
      [email, business_id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email en este negocio' });
    }
    
    // Verificar límites del plan
    const businessPlan = await db.query(
      `SELECT p.max_users
       FROM businesses b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.id = $1`,
      [business_id]
    );
    
    const currentUsers = await db.query(
      'SELECT COUNT(*) as user_count FROM users WHERE business_id = $1 AND is_active = true',
      [business_id]
    );
    
    if (parseInt(currentUsers.rows[0].user_count) >= businessPlan.rows[0].max_users) {
      return res.status(400).json({ 
        message: 'Has alcanzado el límite de usuarios para tu plan' 
      });
    }
    
    // Solo se puede crear un owner
    if (role === 'owner') {
      return res.status(400).json({ message: 'Solo puede haber un dueño por negocio' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await db.query(
      `INSERT INTO users (business_id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, is_active, created_at`,
      [business_id, name, email, hashedPassword, role]
    );
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: newUser.rows[0]
    });
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario actual
router.get('/profile', verifyUserToken, async (req, res) => {
  try {
    const { id } = req.user;
    
    const user = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, 
              b.name as business_name, p.name as plan_name
       FROM users u
       JOIN businesses b ON u.business_id = b.id
       JOIN plans p ON b.plan_id = p.id
       WHERE u.id = $1`,
      [id]
    );
    
    res.json({
      user: user.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario actual
router.put('/profile', verifyUserToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const { id, business_id } = req.user;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos' });
    }
    
    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 AND business_id = $2 AND id != $3',
      [email, business_id, id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }
    
    let updateQuery = 'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP';
    let params = [name, email];
    let paramCount = 2;
    
    // Si se proporciona nueva contraseña, verificar la actual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Contraseña actual requerida' });
      }
      
      const user = await db.query('SELECT password FROM users WHERE id = $1', [id]);
      const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
      
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += `, password = $${++paramCount}`;
      params.push(hashedPassword);
    }
    
    updateQuery += ` WHERE id = $${++paramCount} RETURNING id, name, email, role, created_at`;
    params.push(id);
    
    const updatedUser = await db.query(updateQuery, params);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar usuario (solo owner)
router.put('/:id', verifyUserToken, requireRole(['owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;
    const { business_id } = req.user;
    
    // No se puede editar el owner
    const targetUser = await db.query(
      'SELECT role FROM users WHERE id = $1 AND business_id = $2',
      [id, business_id]
    );
    
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (targetUser.rows[0].role === 'owner') {
      return res.status(400).json({ message: 'No se puede editar el dueño' });
    }
    
    const updatedUser = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND business_id = $6
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, role, is_active, id, business_id]
    );
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo owner)
router.delete('/:id', verifyUserToken, requireRole(['owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    
    // No se puede eliminar el owner
    const targetUser = await db.query(
      'SELECT role FROM users WHERE id = $1 AND business_id = $2',
      [id, business_id]
    );
    
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (targetUser.rows[0].role === 'owner') {
      return res.status(400).json({ message: 'No se puede eliminar el dueño' });
    }
    
    // Soft delete
    await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({
      message: 'Usuario eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 