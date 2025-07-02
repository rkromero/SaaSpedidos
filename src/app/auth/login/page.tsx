'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type LoginType = 'business' | 'user' | 'admin'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>('business')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = `/api/auth/${loginType}/login`
      const body = loginType === 'user' 
        ? { ...formData, businessId: parseInt(formData.businessId) }
        : { email: formData.email, password: formData.password }

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      // Guardar token en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userType', loginType)
      
      // Guardar información del usuario/negocio
      if (loginType === 'business') {
        localStorage.setItem('business', JSON.stringify(data.business))
      } else if (loginType === 'user') {
        localStorage.setItem('user', JSON.stringify(data.user))
      } else if (loginType === 'admin') {
        localStorage.setItem('admin', JSON.stringify(data.admin))
      }

      // Redirigir según el tipo de usuario
      if (loginType === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 mb-8 block">
            📱 PedidosApp
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta para gestionar pedidos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Acceso</CardTitle>
            <CardDescription>Selecciona cómo quieres acceder</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login Type Selector */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Button
                type="button"
                variant={loginType === 'business' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLoginType('business')}
              >
                Negocio
              </Button>
              <Button
                type="button"
                variant={loginType === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLoginType('user')}
              >
                Usuario
              </Button>
              <Button
                type="button"
                variant={loginType === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLoginType('admin')}
              >
                Admin
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>

              {loginType === 'user' && (
                <div>
                  <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
                    ID del Negocio
                  </label>
                  <Input
                    id="businessId"
                    name="businessId"
                    type="number"
                    required
                    value={formData.businessId}
                    onChange={handleInputChange}
                    placeholder="123"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solicita este ID a tu administrador
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Credenciales de Demo:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin@saas.com / admin123</p>
                <p><strong>Negocio:</strong> Se crea al registrarse</p>
                <p><strong>Usuario:</strong> Se crea desde el panel del negocio</p>
              </div>
            </div>

            {/* Links */}
            <div className="text-center mt-6 space-y-2">
              {loginType === 'business' && (
                <p className="text-sm">
                  ¿No tienes cuenta?{' '}
                  <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
                    Registra tu negocio
                  </Link>
                </p>
              )}
              <p className="text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-500">
                  ← Volver al inicio
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 