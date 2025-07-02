import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AdminLayout } from '@/components/admin/layout'
import { AdminStats } from '@/components/admin/stats'
import { TenantsTable } from '@/components/admin/tenants-table'

export default async function AdminPage() {
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

  if (!profile || profile.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return (
    <AdminLayout user={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Vista general del sistema SaaS
          </p>
        </div>
        
        <AdminStats />
        
        <div className="space-y-6">
          <TenantsTable />
        </div>
      </div>
    </AdminLayout>
  )
} 