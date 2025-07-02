'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Usuario ya autenticado, redirigir al dashboard
      router.push('/dashboard')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // El useEffect manejará la redirección
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            🏭 SaaS Gestión Pedidos
          </CardTitle>
          <CardDescription className="text-center">
            Sistema multi-tenant para locales y fábricas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Button 
              asChild 
              className="w-full h-12"
              size="lg"
            >
              <a href="/api/auth/login">
                🔐 Iniciar Sesión con Auth0
              </a>
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium mb-2">✨ Características del sistema:</p>
              <ul className="text-xs space-y-1 text-left">
                <li>• 👑 <strong>Super Admin:</strong> Gestiona todo el SaaS</li>
                <li>• 🏪 <strong>Admin Local:</strong> Gestiona su local y productos</li>
                <li>• 👤 <strong>Empleado Local:</strong> Carga pedidos</li>
                <li>• 🏭 <strong>Empleado Fábrica:</strong> Gestiona producción</li>
              </ul>
            </div>

            <div className="text-center text-xs text-gray-500 border-t pt-4">
              <p>🚂 Powered by Railway + Auth0</p>
              <p>🔒 Autenticación segura y escalable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 