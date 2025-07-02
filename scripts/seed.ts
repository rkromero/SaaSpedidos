import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedData() {
  console.log('🌱 Iniciando seeding de datos...')

  try {
    // 1. Crear tenants (locales)
    console.log('📦 Creando locales...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .insert([
        {
          name: 'Panadería El Sol',
          address: 'Av. Principal 123, Ciudad',
          phone: '+1234567890'
        },
        {
          name: 'Pastelería Luna',
          address: 'Calle Secundaria 456, Ciudad',
          phone: '+1234567891'
        },
        {
          name: 'Cafetería Estrella',
          address: 'Plaza Central 789, Ciudad',
          phone: '+1234567892'
        }
      ])
      .select()

    if (tenantsError) {
      throw tenantsError
    }

    console.log(`✅ ${tenants.length} locales creados`)

    // 2. Crear productos para cada tenant
    console.log('🍞 Creando productos...')
    
    const products = []
    for (const tenant of tenants) {
      products.push(
        // Productos para Panadería El Sol
        ...(tenant.name === 'Panadería El Sol' ? [
          { name: 'Pan Francés', weight: 0.5, price: 2.50, tenant_id: tenant.id },
          { name: 'Pan Integral', weight: 0.6, price: 3.00, tenant_id: tenant.id },
          { name: 'Croissant', weight: 0.08, price: 1.50, tenant_id: tenant.id },
          { name: 'Bagel', weight: 0.1, price: 2.00, tenant_id: tenant.id }
        ] : []),
        
        // Productos para Pastelería Luna
        ...(tenant.name === 'Pastelería Luna' ? [
          { name: 'Torta de Chocolate', weight: 1.0, price: 15.00, tenant_id: tenant.id },
          { name: 'Cupcake Vainilla', weight: 0.15, price: 3.50, tenant_id: tenant.id },
          { name: 'Pie de Manzana', weight: 0.8, price: 12.00, tenant_id: tenant.id },
          { name: 'Donut Glaseado', weight: 0.12, price: 2.25, tenant_id: tenant.id }
        ] : []),
        
        // Productos para Cafetería Estrella
        ...(tenant.name === 'Cafetería Estrella' ? [
          { name: 'Café Americano', weight: null, price: 4.00, tenant_id: tenant.id },
          { name: 'Cappuccino', weight: null, price: 5.50, tenant_id: tenant.id },
          { name: 'Muffin Arándanos', weight: 0.2, price: 4.25, tenant_id: tenant.id },
          { name: 'Sándwich Club', weight: 0.3, price: 8.50, tenant_id: tenant.id }
        ] : [])
      )
    }

    const { error: productsError } = await supabase
      .from('products')
      .insert(products)

    if (productsError) {
      throw productsError
    }

    console.log(`✅ ${products.length} productos creados`)

    // 3. Crear usuarios de ejemplo (manualmente a través de Supabase Dashboard)
    console.log('👥 Para crear usuarios de ejemplo:')
    console.log('1. Ve al Dashboard de Supabase > Authentication > Users')
    console.log('2. Crea los siguientes usuarios:')
    console.log('   - admin@saas.com (super_admin) - sin tenant')
    console.log('   - admin1@panaderia.com (admin_local) - tenant: Panadería El Sol')
    console.log('   - empleado1@panaderia.com (empleado_local) - tenant: Panadería El Sol')
    console.log('   - admin2@pasteleria.com (admin_local) - tenant: Pastelería Luna')
    console.log('   - empleado2@pasteleria.com (empleado_local) - tenant: Pastelería Luna')
    console.log('   - fabrica@empresa.com (empleado_fabrica) - sin tenant')
    console.log('3. Luego actualiza la tabla profiles con los roles correspondientes')

    console.log('🎉 Seeding completado exitosamente!')

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    process.exit(1)
  }
}

// Ejecutar seeding
seedData() 