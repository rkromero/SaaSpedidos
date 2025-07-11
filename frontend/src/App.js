import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { setupAuthInterceptor, isTokenValid } from './utils/authInterceptor';

import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';
import OfflineNotification from './components/native/OfflineNotification';
import EnhancedLayout from './components/navigation/EnhancedLayout';
import './App.css';
// EMERGENCY FIX: Configure axios globally
import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';

// Add global request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    console.log('🎫 Token:', token ? 'Present' : 'Missing');
    return config;
  },
  (error) => Promise.reject(error)
);

// Add global response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Request failed:', error.response?.status, error.config?.url);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Authentication failed, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



// Los componentes antiguos se han movido a EnhancedLayout

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar interceptor de autenticación
    setupAuthInterceptor(handleLogout);
    
    // Verificar si hay un usuario logueado y token válido
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App h-screen-ios overflow-hidden">
            {/* Notificación offline */}
            <OfflineNotification />
            
            <Routes>
              {/* Rutas públicas */}
              <Route 
                path="/" 
                element={user ? <Navigate to="/dashboard" /> : <Landing />} 
              />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
              />
              
              {/* Rutas autenticadas */}
              <Route 
                path="/dashboard/*" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <Dashboard user={user} />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/carrito" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <Carrito />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/admin" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <AdminPanel />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            
            <ToastContainer />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App; 