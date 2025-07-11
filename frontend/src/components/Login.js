import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      console.log('Attempting login to:', `${baseURL}/api/auth/login`);
      
      const response = await axios.post(`${baseURL}/api/auth/login`, formData);
      console.log('Login successful:', response.data);
      
      const { user, token } = response.data;
      
      // Validar que recibimos los datos necesarios
      if (!user || !token) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      console.log('User data:', user);
      console.log('Token received:', token ? 'Yes' : 'No');
      
      addToast('¡Bienvenido! Sesión iniciada correctamente', 'success');
      onLogin(user, token);
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      addToast(err.response?.data?.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen-ios bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-ios-lg">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SaaS Pedidos</h1>
          <p className="text-primary-100 text-lg">Accede a tu cuenta</p>
        </div>

        {/* Login Form */}
        <div className="card-ios bg-white/95 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="input-ios"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                  className="input-ios"
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-ios-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-ios mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/" 
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Registra tu negocio
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-white/20 rounded-ios backdrop-blur-sm">
          <p className="text-white text-sm font-medium mb-2">Credenciales de prueba:</p>
          <div className="space-y-1 text-primary-100 text-xs">
            <p>• admin@test.com / admin123 (Dueño)</p>
            <p>• franquicia@test.com / franquicia123 (Franquiciado)</p>
            <p>• empleado@test.com / empleado123 (Empleado)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 