'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar negocio')
      }

      // Guardar token y datos del negocio
      localStorage.setItem('token', data.token)
      localStorage.setItem('userType', 'business')
      localStorage.setItem('business', JSON.stringify(data.business))

      setSuccess(true)
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar negocio')
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardHeader>
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-green-600">¡Registro Exitoso!</CardTitle>
              <CardDescription>
                Tu negocio ha sido registrado correctamente. Redirigiendo al dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
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
            Registra tu Negocio
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta y comienza a gestionar pedidos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Negocio</CardTitle>
            <CardDescription>
              Completa los datos para registrar tu local comercial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre del Negocio *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Mi Restaurante"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@mirestaurante.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña *
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
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Negocio'}
              </Button>
            </form>

            {/* Features Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">✨ Incluye con el Plan Gratuito:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Hasta 2 usuarios</li>
                <li>• 10 productos</li>
                <li>• 50 pedidos por mes</li>
                <li>• Soporte por email</li>
              </ul>
            </div>

            {/* Links */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Iniciar sesión
                </Link>
              </p>
              <p className="text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-500">
                  ← Volver al inicio
                </Link>
              </p>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Términos de Servicio
              </a>
              {' '}y{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Política de Privacidad
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 