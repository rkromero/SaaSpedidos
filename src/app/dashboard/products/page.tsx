import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getUserProfile } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ProductsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const profile = await getUserProfile(session.user.sub)

  if (!profile) {
    redirect('/auth/login')
  }

  // Solo admin_local puede gestionar productos
  if (profile.role !== 'admin_local') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de productos de tu local - {profile.name || profile.email}
            </p>
          </div>
          <Button>
            ➕ Nuevo Producto
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <span className="text-2xl">🍞</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                En tu catálogo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Precio Promedio
              </CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24.50</div>
              <p className="text-xs text-muted-foreground">
                Precio medio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Más Vendido
              </CardTitle>
              <span className="text-2xl">🔥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Pan Integral</div>
              <p className="text-xs text-muted-foreground">
                45 ventas este mes
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              Todos los productos disponibles en tu local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                🏗️ <strong>Próximamente:</strong> Tabla completa con gestión de productos
              </div>
              
              {/* Productos de ejemplo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🍞</span>
                    <div>
                      <p className="font-medium">Pan Integral</p>
                      <p className="text-sm text-gray-500">Peso: 500g | Precio: $12.50</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      ✏️ Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🥖</span>
                    <div>
                      <p className="font-medium">Baguette Francesa</p>
                      <p className="text-sm text-gray-500">Peso: 300g | Precio: $8.75</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      ✏️ Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🧁</span>
                    <div>
                      <p className="font-medium">Cupcake de Vainilla</p>
                      <p className="text-sm text-gray-500">Peso: 80g | Precio: $15.00</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      ✏️ Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      🗑️ Eliminar
                    </Button>
                  </div>
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