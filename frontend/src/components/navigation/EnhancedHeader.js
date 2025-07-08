import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const EnhancedHeader = ({ user, onLogout }) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Títulos por ruta
  const getTitleByRoute = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard/productos':
        return 'Productos';
      case '/dashboard/pedidos':
        return 'Pedidos';
      case '/carrito':
        return 'Carrito';
      case '/admin':
        return 'Administración';
      default:
        return 'Dashboard';
    }
  };

  const title = getTitleByRoute(location.pathname);

  useEffect(() => {
    // Cerrar menú al cambiar de ruta
    setShowUserMenu(false);
  }, [location.pathname]);

  return (
    <div className="enhanced-header">
      <div className="header-main">
        <div className="header-left">
          {/* Título */}
          <h1 className="header-title">{title}</h1>
        </div>

        <div className="header-right">
          {/* Menú de usuario */}
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span className="user-avatar-text">
                  {user?.nombre?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="user-name">{user?.nombre || 'Usuario'}</span>
              <svg className={`user-menu-arrow ${showUserMenu ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown del menú de usuario */}
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-info">
                  <div className="user-menu-name">{user?.nombre || 'Usuario'}</div>
                  <div className="user-menu-email">{user?.email || 'Sin email'}</div>
                  <div className="user-menu-role">{user?.tipo || user?.rol || 'Usuario'}</div>
                </div>
                
                <button className="user-menu-logout" onClick={onLogout}>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeader; 