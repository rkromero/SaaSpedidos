import pool from '../src/lib/database'

async function seedData() {
  console.log('🌱 Iniciando seeding en Railway PostgreSQL...')

  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    // 1. Crear tenants (locales)
    console.log('📦 Creando locales...')
    const tenantsResult = await client.query(`
      INSERT INTO tenants (name, address, phone) VALUES 
      ('Panadería El Sol', 'Av. Principal 123, Ciudad', '+1234567890'),
      ('Pastelería Luna', 'Calle Secundaria 456, Ciudad', '+1234567891'),
      ('Cafetería Estrella', 'Plaza Central 789, Ciudad', '+1234567892')
      RETURNING id, name
    `)
    
    const tenants = tenantsResult.rows
    console.log(`✅ ${tenants.length} locales creados`)

    // 2. Crear productos para cada tenant
    console.log('🍞 Creando productos...')
    
    for (const tenant of tenants) {
      let products: Array<[string, number | null, number]> = []
      
      if (tenant.name === 'Panadería El Sol') {
        products = [
          ['Pan Francés', 0.5, 2.50],
          ['Pan Integral', 0.6, 3.00],
          ['Croissant', 0.08, 1.50],
          ['Bagel', 0.1, 2.00]
        ]
      } else if (tenant.name === 'Pastelería Luna') {
        products = [
          ['Torta de Chocolate', 1.0, 15.00],
          ['Cupcake Vainilla', 0.15, 3.50],
          ['Pie de Manzana', 0.8, 12.00],
          ['Donut Glaseado', 0.12, 2.25]
        ]
      } else if (tenant.name === 'Cafetería Estrella') {
        products = [
          ['Café Americano', null, 4.00],
          ['Cappuccino', null, 5.50],
          ['Muffin Arándanos', 0.2, 4.25],
          ['Sándwich Club', 0.3, 8.50]
        ]
      }

      for (const [name, weight, price] of products) {
        await client.query(`
          INSERT INTO products (name, weight, price, tenant_id) 
          VALUES ($1, $2, $3, $4)
        `, [name, weight, price, tenant.id])
      }
    }

    console.log('✅ Productos creados exitosamente')

    await client.query('COMMIT')
    
    // 3. Instrucciones para crear usuarios
    console.log('\n👥 Para crear usuarios de ejemplo:')
    console.log('1. Ve al Dashboard de Supabase > Authentication > Users')
    console.log('2. Crea los siguientes usuarios:')
    console.log('   - admin@saas.com (super_admin) - sin tenant')
    console.log('   - admin1@panaderia.com (admin_local) - tenant: Panadería El Sol')
    console.log('   - empleado1@panaderia.com (empleado_local) - tenant: Panadería El Sol')
    console.log('   - fabrica@empresa.com (empleado_fabrica) - sin tenant')
    console.log('\n3. Luego ejecuta el script de roles para asignar permisos')

    console.log('\n🎉 Seeding completado exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error durante el seeding:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar seeding
seedData() 