import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const Landing = () => {
  const [formData, setFormData] = useState({
    nombreNegocio: '',
    nombreDueño: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      await axios.post(`${baseURL}/api/auth/registro-negocio`, formData);
      showToast('¡Negocio registrado exitosamente! Revisa tu email para confirmar.', 'success');
      setFormData({
        nombreNegocio: '',
        nombreDueño: '',
        email: '',
        password: '',
        telefono: '',
        direccion: ''
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Error al registrar el negocio', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="h-screen-ios bg-gradient-to-br from-primary-50 to-white overflow-y-auto">
      {/* Header móvil */}
      <header className="header-mobile">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SaaS Pedidos</span>
        </div>
        <Link to="/login" className="btn-ios-ghost px-4 py-2 text-sm">
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-ios-lg">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Revoluciona tu negocio
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistema completo de gestión de pedidos para franquicias
          </p>
          <button 
            onClick={() => document.getElementById('registro').scrollIntoView({ behavior: 'smooth' })}
            className="btn-ios-primary w-full mb-4"
          >
            Comenzar Gratis
          </button>
          <Link to="/login" className="btn-ios-ghost w-full">
            Ver Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Todo lo que necesitas
            </h2>
            <p className="text-gray-600">
              Herramientas para hacer crecer tu franquicia
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="card-ios bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gestión Centralizada</h3>
                  <p className="text-sm text-gray-600">
                    Administra productos, franquiciados y pedidos desde un solo lugar
                  </p>
                </div>
              </div>
            </div>

            <div className="card-ios bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tiempo Real</h3>
                  <p className="text-sm text-gray-600">
                    Pedidos instantáneos con notificaciones automáticas
                  </p>
                </div>
              </div>
            </div>

            <div className="card-ios bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Reportes detallados para decisiones basadas en datos
                  </p>
                </div>
              </div>
            </div>

            <div className="card-ios bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Seguridad</h3>
                  <p className="text-sm text-gray-600">
                    Protección total de datos con autenticación JWT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Casos de éxito
            </h2>
            <p className="text-gray-600">
              Franquicias que ya transformaron su negocio
            </p>
          </div>

          <div className="space-y-4">
            <div className="card-ios">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">María González</h4>
                  <p className="text-sm text-gray-600">Restaurante El Buen Sabor</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                "Desde que implementamos SaaS Pedidos, nuestros pedidos aumentaron 40%"
              </p>
              <div className="flex text-yellow-400 mt-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
            </div>

            <div className="card-ios">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Carlos Rodríguez</h4>
                  <p className="text-sm text-gray-600">Café Express</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                "Plataforma intuitiva. Nuestros 15 franquiciados pueden hacer pedidos sin problemas"
              </p>
              <div className="flex text-yellow-400 mt-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registro" className="px-4 py-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Comienza hoy mismo
            </h2>
            <p className="text-primary-100">
              Únete a cientos de franquicias exitosas
            </p>
          </div>

          <div className="card-ios bg-white/95 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  name="nombreNegocio"
                  value={formData.nombreNegocio}
                  onChange={handleChange}
                  required
                  className="input-ios"
                  placeholder="Ej: Restaurante El Buen Sabor"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Dueño *
                </label>
                <input
                  type="text"
                  name="nombreDueño"
                  value={formData.nombreDueño}
                  onChange={handleChange}
                  required
                  className="input-ios"
                  placeholder="Tu nombre completo"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-ios"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-ios"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-ios"
                  placeholder="+54 9 11 1234-5678"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="input-ios"
                  placeholder="Dirección del negocio"
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-ios-primary w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-ios mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  'Registrar Negocio'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-lg font-bold">SaaS Pedidos</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Transformando franquicias con tecnología
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Soporte
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 