import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { setupAuthInterceptor } from './utils/authInterceptor';

import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';
import OfflineNotification from './components/native/OfflineNotification';
import EnhancedLayout from './components/navigation/EnhancedLayout';
import './App.css';
import './v5BuildInfo.js';
// EMERGENCY FIX: Configure axios globally
import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';

// Los componentes antiguos se han movido a EnhancedLayout

function App() {
  const [user, setUser] = useState(null);
  const [negocio, setNegocio] = useState(null);
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

  // Fetch negocio ONCE in App.js, pass as prop
  useEffect(() => {
    const fetchNegocio = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
        console.log('🔄 Fetching negocio ONCE in App.js...');
        const response = await axios.get(`${baseURL}/api/negocios/mi-negocio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Negocio fetched successfully in App.js');
        setNegocio(response.data);
      } catch (err) {
        console.error('❌ Error fetching negocio in App:', err);
      }
    };

    if (user) {
      fetchNegocio();
    }
  }, [user]); // Only when user changes

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
                      <Dashboard user={user} negocio={negocio} />
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