import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardLayout } from '@/components/dashboard/layout'
import { ProductsTable } from '@/components/products/products-table'
import { CreateProductButton } from '@/components/products/create-product-button'

export default async function ProductsPage() {
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

  // Solo admin_local puede gestionar productos
  if (profile.role !== 'admin_local') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de productos de tu local
            </p>
          </div>
          <CreateProductButton />
        </div>
        
        <ProductsTable tenantId={profile.tenant_id!} />
      </div>
    </DashboardLayout>
  )
} 