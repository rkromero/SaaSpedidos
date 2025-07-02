import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getUserProfile } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Obtener perfil del usuario desde Railway DB
  const profile = await getUserProfile(session.user.sub)

  if (!profile) {
    // Si no existe el perfil, redirigir a completar setup
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {profile.name || profile.email}
          </p>
          <p className="text-sm text-gray-600">
            Rol: <span className="font-medium">{profile.role}</span>
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos de Hoy
              </CardTitle>
              <span className="text-2xl">📦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">43</div>
              <p className="text-xs text-muted-foreground">
                +12% desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos
              </CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350</div>
              <p className="text-xs text-muted-foreground">
                +8% desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos
              </CardTitle>
              <span className="text-2xl">🍞</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                En catálogo
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <a href="/dashboard/orders">
                  📦 Gestionar Pedidos
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/dashboard/products">
                  🍞 Gestionar Productos
                </a>
              </Button>
              {profile.role === 'super_admin' && (
                <Button asChild variant="outline" className="w-full">
                  <a href="/admin">
                    👑 Panel de Administración
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Pedidos</CardTitle>
              <CardDescription>
                Pedidos recientes en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pedido #001</span>
                    <span className="text-xs text-gray-500">hace 2 horas</span>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Pendiente
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pedido #002</span>
                    <span className="text-xs text-gray-500">hace 4 horas</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    En preparación
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pedido #003</span>
                    <span className="text-xs text-gray-500">hace 6 horas</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Entregado
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild variant="outline">
            <a href="/api/auth/logout">🔓 Cerrar Sesión</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 