import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getUserProfile } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard/layout'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentOrders } from '@/components/dashboard/recent-orders'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Obtener perfil del usuario desde Railway DB
  const profile = await getUserProfile(session.user.sub)

  if (!profile) {
    // Si no existe el perfil, redirigir a completar setup
    redirect('/auth/setup')
  }

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {profile.name || profile.email}
          </p>
        </div>
        
        <DashboardStats role={profile.role} tenantId={profile.tenant_id} />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentOrders role={profile.role} tenantId={profile.tenant_id} />
        </div>
      </div>
    </DashboardLayout>
  )
} 