import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import pool from '../src/lib/database'

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' })

async function runMigrations() {
  console.log('🔄 Ejecutando migraciones en Railway PostgreSQL...')
  console.log(`📍 Conectando a: ${process.env.DATABASE_URL?.substring(0, 50)}...`)

  try {
    // Leer el archivo de migración
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20240101000001_initial_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    // Dividir por statements (separados por ';')
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Ejecutando: ${statement.substring(0, 50)}...`)
          await client.query(statement)
        }
      }
      
      await client.query('COMMIT')
      console.log('✅ Migraciones ejecutadas exitosamente!')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar migraciones
runMigrations() 