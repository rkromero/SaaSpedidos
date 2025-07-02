import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getUserProfile } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function OrdersPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const profile = await getUserProfile(session.user.sub)

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gestiona todos los pedidos del sistema - {profile.name || profile.email}
            </p>
          </div>
          {(profile.role === 'admin_local' || profile.role === 'empleado_local') && (
            <Button>
              ➕ Nuevo Pedido
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Pendientes
              </CardTitle>
              <span className="text-2xl">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Esperando procesamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Preparación
              </CardTitle>
              <span className="text-2xl">👨‍🍳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Siendo procesados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entregados Hoy
              </CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Completados exitosamente
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              {profile.role === 'empleado_fabrica' 
                ? 'Todos los pedidos del sistema' 
                : 'Pedidos de tu local'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                🏗️ <strong>Próximamente:</strong> Tabla completa con gestión de pedidos
              </div>
              
              {/* Pedidos de ejemplo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📦</span>
                    <div>
                      <p className="font-medium">Pedido #001</p>
                      <p className="text-sm text-gray-500">Panadería El Sol - $45.50</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    Pendiente
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📦</span>
                    <div>
                      <p className="font-medium">Pedido #002</p>
                      <p className="text-sm text-gray-500">Pizzería Roma - $78.20</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    En preparación
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📦</span>
                    <div>
                      <p className="font-medium">Pedido #003</p>
                      <p className="text-sm text-gray-500">Café Central - $23.75</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Entregado
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild variant="outline">
            <a href="/dashboard">← Volver al Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 