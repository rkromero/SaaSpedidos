import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardLayout } from '@/components/dashboard/layout'
import { OrdersTable } from '@/components/orders/orders-table'
import { CreateOrderButton } from '@/components/orders/create-order-button'

export default async function OrdersPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gestiona todos los pedidos del sistema
            </p>
          </div>
          {(profile.role === 'admin_local' || profile.role === 'empleado_local') && (
            <CreateOrderButton />
          )}
        </div>
        
        <OrdersTable role={profile.role} tenantId={profile.tenant_id} />
      </div>
    </DashboardLayout>
  )
} 