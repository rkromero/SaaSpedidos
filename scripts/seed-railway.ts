import { config } from 'dotenv'
import pool from '../src/lib/database'

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' })

async function seedData() {
  console.log('🌱 Iniciando seeding de datos en Railway...')
  console.log(`📍 Conectando a: ${process.env.DATABASE_URL?.substring(0, 50)}...`)

  try {
    // 1. Crear tenants (locales)
    console.log('📦 Creando locales...')
    const tenantsResult = await pool.query(`
      INSERT INTO tenants (name, address, phone) VALUES
      ('Panadería El Sol', 'Av. Principal 123, Ciudad', '+1234567890'),
      ('Pastelería Luna', 'Calle Secundaria 456, Ciudad', '+1234567891'),
      ('Cafetería Estrella', 'Plaza Central 789, Ciudad', '+1234567892')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `)

    console.log(`✅ ${tenantsResult.rowCount} locales creados/verificados`)

    // 2. Obtener IDs de los tenants
    const allTenants = await pool.query('SELECT id, name FROM tenants ORDER BY name')
    const tenants = allTenants.rows

    if (tenants.length === 0) {
      throw new Error('No se encontraron tenants')
    }

    // 3. Crear productos para cada tenant
    console.log('🍞 Creando productos...')
    
    const panaderia = tenants.find(t => t.name === 'Panadería El Sol')
    const pasteleria = tenants.find(t => t.name === 'Pastelería Luna')
    const cafeteria = tenants.find(t => t.name === 'Cafetería Estrella')

    const products = [
      // Productos para Panadería El Sol
      ...(panaderia ? [
        { name: 'Pan Francés', weight: 0.5, price: 2.50, tenant_id: panaderia.id },
        { name: 'Pan Integral', weight: 0.6, price: 3.00, tenant_id: panaderia.id },
        { name: 'Croissant', weight: 0.08, price: 1.50, tenant_id: panaderia.id },
        { name: 'Bagel', weight: 0.1, price: 2.00, tenant_id: panaderia.id }
      ] : []),
      
      // Productos para Pastelería Luna
      ...(pasteleria ? [
        { name: 'Torta de Chocolate', weight: 1.0, price: 15.00, tenant_id: pasteleria.id },
        { name: 'Cupcake Vainilla', weight: 0.15, price: 3.50, tenant_id: pasteleria.id },
        { name: 'Pie de Manzana', weight: 0.8, price: 12.00, tenant_id: pasteleria.id },
        { name: 'Donut Glaseado', weight: 0.12, price: 2.25, tenant_id: pasteleria.id }
      ] : []),
      
      // Productos para Cafetería Estrella
      ...(cafeteria ? [
        { name: 'Café Americano', weight: null, price: 4.00, tenant_id: cafeteria.id },
        { name: 'Cappuccino', weight: null, price: 5.50, tenant_id: cafeteria.id },
        { name: 'Muffin Arándanos', weight: 0.2, price: 4.25, tenant_id: cafeteria.id },
        { name: 'Sándwich Club', weight: 0.3, price: 8.50, tenant_id: cafeteria.id }
      ] : [])
    ]

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, weight, price, tenant_id) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name, tenant_id) DO NOTHING
      `, [product.name, product.weight, product.price, product.tenant_id])
    }

    console.log(`✅ ${products.length} productos creados/verificados`)

    // 4. Crear algunos pedidos de ejemplo
    console.log('📦 Creando pedidos de ejemplo...')
    
    if (panaderia) {
      const orderResult = await pool.query(`
        INSERT INTO orders (tenant_id, status, total_amount, created_by) 
        VALUES ($1, 'pendiente', 8.00, 'ejemplo_user_auth0_id')
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [panaderia.id])

      if (orderResult.rows.length > 0) {
        const orderId = orderResult.rows[0].id
        
        await pool.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          SELECT $1, p.id, 2, p.price, (2 * p.price)
          FROM products p 
          WHERE p.name = 'Pan Francés' AND p.tenant_id = $2
          ON CONFLICT DO NOTHING
        `, [orderId, panaderia.id])
      }
    }

    console.log('✅ Pedidos de ejemplo creados')

    console.log('🎉 Seeding completado exitosamente!')
    console.log('')
    console.log('📋 Próximos pasos:')
    console.log('1. Crear usuarios en Auth0')
    console.log('2. Asignar roles usando scripts/assign-roles.sql')
    console.log('3. Testear la aplicación')

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar seeding
seedData() 