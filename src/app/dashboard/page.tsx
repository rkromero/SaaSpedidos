'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  stats: {
    total_products: number
    total_users: number
    total_orders: number
    total_revenue: number
  }
  recentOrders: Array<{
    id: number
    customer_name: string
    total_amount: number
    status: string
    created_at: string
  }>
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
  }>
  topProducts: Array<{
    name: string
    total_sold: number
    total_revenue: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/business/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Error al cargar el dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de tu negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Productos</CardDescription>
            <CardTitle className="text-3xl">{data.stats.total_products}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              📦 Productos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-3xl">{data.stats.total_users}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              👥 Equipo de trabajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pedidos</CardDescription>
            <CardTitle className="text-3xl">{data.stats.total_orders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              📋 Pedidos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos Totales</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(data.stats.total_revenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              💰 Ventas acumuladas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos 10 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay pedidos recientes
                </p>
              ) : (
                data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Pedidos</CardTitle>
            <CardDescription>Distribución por estados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ordersByStatus.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay datos de pedidos
                </p>
              ) : (
                data.ordersByStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {status.status === 'pending' ? '⏳ Pendientes' :
                       status.status === 'processing' ? '🔄 En Proceso' :
                       status.status === 'ready' ? '✅ Listos' :
                       status.status === 'completed' ? '📦 Completados' :
                       status.status === 'cancelled' ? '❌ Cancelados' :
                       status.status}
                    </span>
                    <span className="text-2xl font-bold">{status.count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos por cantidad vendida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.total_sold} unidades vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.total_revenue)}</p>
                    <p className="text-sm text-gray-500">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Tareas comunes para tu negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/orders/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="text-2xl mb-2">➕</div>
              <p className="text-sm font-medium">Nuevo Pedido</p>
            </a>
            <a
              href="/dashboard/products"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-medium">Ver Productos</p>
            </a>
            <a
              href="/dashboard/orders"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm font-medium">Ver Pedidos</p>
            </a>
            <a
              href="/dashboard/users"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium">Gestionar Usuarios</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 