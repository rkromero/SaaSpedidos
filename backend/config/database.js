const { Pool } = require('pg');
const path = require('path');

// Cargar .env desde la raíz del proyecto
const envPath = path.resolve(__dirname, '../../.env');
console.log('🔍 Buscando .env en:', envPath);
require('dotenv').config({ path: envPath });

// Debug: Verificar que la variable se carga
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'CARGADA' : 'NO ENCONTRADA');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

// Configuración de la base de datos para Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Función para ejecutar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
}

// Función para inicializar la base de datos
async function initialize() {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Probar conexión
    await query('SELECT 1');
    console.log('✅ Conexión a base de datos exitosa');
    
    // Crear tablas si no existen
    await createTables();
    console.log('✅ Tablas creadas/verificadas exitosamente');
    
    // Seed inicial
    await seedDatabase();
    console.log('✅ Datos iniciales verificados');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    console.error('❌ Stack trace:', error.stack);
    throw error;
  }
}

// Función para crear todas las tablas
async function createTables() {
  const queries = [
    // Tabla de planes
    `CREATE TABLE IF NOT EXISTS plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      max_users INTEGER NOT NULL,
      max_products INTEGER NOT NULL,
      max_orders_per_month INTEGER NOT NULL,
      features JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de negocios (tenants)
    `CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      plan_id INTEGER REFERENCES plans(id),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de usuarios
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'employee',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(business_id, email)
    )`,
    
    // Tabla de productos
    `CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de pedidos
    `CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id),
      user_id INTEGER REFERENCES users(id),
      customer_name VARCHAR(255),
      customer_phone VARCHAR(50),
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de items de pedido
    `CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de pagos
    `CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id),
      order_id INTEGER REFERENCES orders(id),
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(100),
      payment_status VARCHAR(50) DEFAULT 'pending',
      external_payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabla de admin (para el backoffice)
    `CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Índices para mejorar rendimiento
    `CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id)`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
  ];
  
  for (const queryText of queries) {
    await query(queryText);
  }
}

// Función para insertar datos iniciales
async function seedDatabase() {
  try {
    // Insertar planes
    await query(`
      INSERT INTO plans (name, price, max_users, max_products, max_orders_per_month, features)
      VALUES 
        ('Free', 0, 2, 10, 50, '{"support": "email"}'),
        ('Básico', 29.99, 5, 50, 200, '{"support": "email", "reports": true}'),
        ('Pro', 59.99, 15, 200, 1000, '{"support": "priority", "reports": true, "integrations": true}')
      ON CONFLICT DO NOTHING
    `);
    
    // Insertar admin por defecto
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await query(`
      INSERT INTO admin_users (email, password, name, role)
      VALUES ('admin@saas.com', $1, 'Administrador', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);
    
    console.log('Base de datos seeded exitosamente');
  } catch (error) {
    console.error('Error al seed la base de datos:', error);
  }
}

module.exports = {
  query,
  initialize,
  seedDatabase,
  pool
}; 