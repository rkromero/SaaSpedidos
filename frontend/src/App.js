import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';
import OfflineNotification from './components/native/OfflineNotification';
import InstallPWAButton from './components/native/InstallPWAButton';
import EnhancedLayout from './components/navigation/EnhancedLayout';
import { usePWA } from './hooks/usePWA';
import { useSwipeGesture } from './hooks/useGestures';
import { useHaptics } from './hooks/useHaptics';
import './App.css';

// Componente de navegación inferior
const BottomNavigation = ({ user, currentPath, onNavigate }) => {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Inicio', 
      path: '/dashboard',
      icon: '🏠',
      roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
    },
    {
      id: 'productos',
      label: 'Productos',
      path: '/dashboard/productos',
      icon: '📦',
      roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      path: '/dashboard/pedidos',
      icon: '📋',
      roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
    },
    {
      id: 'carrito',
      label: 'Carrito',
      path: '/carrito',
      icon: '🛒',
      roles: ['FRANQUICIADO', 'EMPLEADO']
    },
    ...(user?.rol === 'DUEÑO_NEGOCIO' ? [{
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: '⚙️',
      roles: ['DUEÑO_NEGOCIO']
    }] : [])
  ];

  const filteredItems = navItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  const isActive = (path) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="bottom-nav">
      <div className="flex justify-around items-center h-full">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente de header móvil
const MobileHeader = ({ user, onLogout, title }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="header-mobile">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
          {title || 'SaaS Pedidos'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.nombre}
            </span>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-ios shadow-ios-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.nombre}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{user?.rol}</p>
              </div>
              
              {/* Botón para instalar PWA */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <InstallPWAButton 
                  text="Instalar App"
                  className="w-full text-sm"
                />
              </div>
              
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente wrapper para rutas autenticadas
const AuthenticatedLayout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [title, setTitle] = useState('SaaS Pedidos');

  useEffect(() => {
    // Actualizar título basado en la ruta
    const path = location.pathname;
    if (path.includes('/dashboard/productos')) {
      setTitle('Productos');
    } else if (path.includes('/dashboard/pedidos')) {
      setTitle('Pedidos');
    } else if (path.includes('/dashboard/metricas')) {
      setTitle('Métricas');
    } else if (path.includes('/carrito')) {
      setTitle('Carrito');
    } else if (path.includes('/admin')) {
      setTitle('Administración');
    } else {
      setTitle('Dashboard');
    }
  }, [location]);

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="h-screen-ios flex flex-col bg-gray-50">
      <MobileHeader user={user} onLogout={onLogout} title={title} />
      
      <div className="main-content overflow-y-auto">
        {children}
      </div>
      
      <BottomNavigation 
        user={user} 
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado
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