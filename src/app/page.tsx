'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TestConnection from '@/components/TestConnection'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📱 PedidosApp
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contacto
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Registrarse Gratis</Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestiona los pedidos de tu{' '}
              <span className="text-blue-600">local comercial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema SaaS multi-tenant que permite a múltiples locales gestionar sus pedidos, 
              productos y usuarios de forma independiente. Perfecto para restaurantes, cafeterías y más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-4 text-lg">
                  🚀 Comenzar Gratis
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  📹 Ver Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Sin tarjeta de crédito • Plan gratuito incluido
            </p>
          </div>
        </div>
      </section>

      {/* Test Connection Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              🚀 Backend en Railway
            </h2>
            <p className="text-lg text-gray-600">
              Prueba la conexión con nuestro backend desplegado en Railway
            </p>
          </div>
          <TestConnection />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tus pedidos
            </h2>
            <p className="text-xl text-gray-600">
              Funciones diseñadas específicamente para locales comerciales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">📱</div>
                <CardTitle>Multi-tenant</CardTitle>
                <CardDescription>
                  Cada local tiene su propio espacio independiente con sus datos seguros
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">📋</div>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>
                  Crea, edita y rastrea pedidos en tiempo real con estados personalizables
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🛍️</div>
                <CardTitle>Catálogo de Productos</CardTitle>
                <CardDescription>
                  Administra tu inventario con precios, categorías y descripciones
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">👥</div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Controla el acceso con roles de dueño y empleados
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">💳</div>
                <CardTitle>Pagos con MercadoPago</CardTitle>
                <CardDescription>
                  Integración completa para procesar pagos de forma segura
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle>Reportes y Métricas</CardTitle>
                <CardDescription>
                  Dashboard con estadísticas de ventas y rendimiento
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Precios simples y transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis y escala según tus necesidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <CardDescription>Por mes • Ideal para empezar</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Hasta 2 usuarios
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    10 productos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    50 pedidos/mes
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Soporte por email
                  </li>
                </ul>
                <Button className="w-full mt-6">Comenzar Gratis</Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Más Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle>Básico</CardTitle>
                <div className="text-3xl font-bold">$29.99</div>
                <CardDescription>Por mes • Para locales en crecimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Hasta 5 usuarios
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    50 productos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    200 pedidos/mes
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Reportes avanzados
                  </li>
                </ul>
                <Button className="w-full mt-6">Comenzar Prueba</Button>
              </CardContent>
            </Card>
            
            <Card className="relative">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">$59.99</div>
                <CardDescription>Por mes • Para locales establecidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Hasta 15 usuarios
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    200 productos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    1000 pedidos/mes
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✅</span>
                    Integraciones avanzadas
                  </li>
                </ul>
                <Button className="w-full mt-6">Comenzar Prueba</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para revolucionar tu negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de locales que ya confían en PedidosApp
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-12 py-4 text-lg">
              Registrar mi Local Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PedidosApp</h3>
              <p className="text-gray-400">
                La solución completa para gestionar pedidos en tu local comercial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Características</li>
                <li>Precios</li>
                <li>Seguridad</li>
                <li>Actualizaciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>API</li>
                <li>Estado del Sistema</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Acerca de</li>
                <li>Blog</li>
                <li>Términos</li>
                <li>Privacidad</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PedidosApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 