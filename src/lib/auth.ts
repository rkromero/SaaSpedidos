import { getSession } from '@auth0/nextjs-auth0'
import { query } from './database'

// Obtener sesión del usuario actual
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

// Obtener perfil del usuario desde Railway DB
export async function getUserProfile(userId: string) {
  try {
    const result = await query(
      'SELECT * FROM profiles WHERE auth0_id = $1',
      [userId]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Crear o actualizar perfil de usuario
export async function upsertUserProfile(auth0User: any) {
  try {
    const { sub: auth0_id, email, name } = auth0User
    
    const result = await query(`
      INSERT INTO profiles (auth0_id, email, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, 'empleado_local', NOW(), NOW())
      ON CONFLICT (auth0_id) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING *
    `, [auth0_id, email, name])
    
    return result.rows[0]
  } catch (error) {
    console.error('Error upserting user profile:', error)
    return null
  }
}

// Verificar si el usuario tiene acceso a un tenant
export async function checkUserTenantAccess(userId: string, tenantId: string) {
  try {
    const result = await query(
      'SELECT * FROM profiles WHERE auth0_id = $1 AND (tenant_id = $2 OR role = $3 OR role = $4)',
      [userId, tenantId, 'super_admin', 'empleado_fabrica']
    )
    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking tenant access:', error)
    return false
  }
} 