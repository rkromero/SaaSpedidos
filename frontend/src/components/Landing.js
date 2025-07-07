import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

function Landing() {
  const [formData, setFormData] = useState({
    nombreNegocio: '',
    nombreDueño: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.post(`${baseURL}/api/auth/registro-negocio`, formData);
      setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      setFormData({
        nombreNegocio: '',
        nombreDueño: '',
        email: '',
        password: '',
        telefono: '',
        direccion: ''
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al registrar el negocio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Gestiona tu Franquicia con Facilidad</h1>
          <p className="hero-subtitle">
            Sistema completo para dueños de franquicias. Gestiona productos, 
            franquiciados y pedidos desde una sola plataforma.
          </p>
          <div className="hero-buttons">
            <a href="#caracteristicas" className="btn btn-secondary">Conoce más</a>
            <a href="#registro" className="btn btn-primary">Registra tu Negocio</a>
          </div>
        </div>
        <div className="hero-image">
          <div className="mockup">
            <div className="mockup-header"></div>
            <div className="mockup-content">
              <div className="mockup-item"></div>
              <div className="mockup-item"></div>
              <div className="mockup-item"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="features">
        <h2>¿Por qué elegir nuestro sistema?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Gestión de Productos</h3>
            <p>Carga productos con nombre, precio y peso. Control total de tu inventario.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestión de Franquiciados</h3>
            <p>Crea cuentas para tus franquiciados y controla sus accesos al sistema.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Sistema de Pedidos</h3>
            <p>Tus franquiciados pueden armar pedidos fácilmente seleccionando productos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Reportes en Tiempo Real</h3>
            <p>Monitorea ventas, productos más vendidos y rendimiento de franquiciados.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Acceso desde Cualquier Lugar</h3>
            <p>Sistema web responsive que funciona en computadoras, tablets y móviles.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Seguridad Garantizada</h3>
            <p>Datos protegidos con encriptación y respaldos automáticos.</p>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="how-it-works">
        <h2>¿Cómo funciona?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Registra tu Negocio</h3>
            <p>Completa el formulario y crea tu cuenta de dueño de franquicia.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Carga tus Productos</h3>
            <p>Agrega productos con nombre, precio y peso desde tu panel de administración.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Invita Franquiciados</h3>
            <p>Crea cuentas para tus franquiciados y dales acceso al sistema.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Gestiona Pedidos</h3>
            <p>Tus franquiciados pueden armar pedidos y tú los gestionas desde tu panel.</p>
          </div>
        </div>
      </section>

      {/* Registro */}
      <section id="registro" className="register">
        <div className="register-content">
          <h2>Registra tu Negocio</h2>
          <p>Comienza a gestionar tu franquicia en minutos</p>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="nombreNegocio">Nombre del Negocio *</label>
              <input
                type="text"
                id="nombreNegocio"
                name="nombreNegocio"
                value={formData.nombreNegocio}
                onChange={handleChange}
                required
                placeholder="Ej: Mi Franquicia S.A."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nombreDueño">Nombre del Dueño *</label>
              <input
                type="text"
                id="nombreDueño"
                name="nombreDueño"
                value={formData.nombreDueño}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección de tu negocio"
              />
            </div>
            
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Negocio'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SaaS Pedidos</h3>
            <p>La solución completa para gestionar tu franquicia</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <Link to="/login">Iniciar Sesión</Link>
            <a href="#caracteristicas">Características</a>
            <a href="#registro">Registro</a>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>Email: info@saaspedidos.com</p>
            <p>Tel: +54 11 1234-5678</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SaaS Pedidos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing; 