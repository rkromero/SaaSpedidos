import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EnhancedTabBar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pestañas simplificadas
  const tabItems = [
    { 
      id: 'dashboard', 
      label: 'Inicio', 
      path: '/dashboard',
      icon: '🏠'
    },
    {
      id: 'productos',
      label: 'Productos',
      path: '/dashboard/productos',
      icon: '📦'
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      path: '/dashboard/pedidos',
      icon: '📋'
    },
    {
      id: 'carrito',
      label: 'Carrito',
      path: '/carrito',
      icon: '🛒'
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: '⚙️'
    }
  ];

  // Verificar si una pestaña está activa
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  // Manejar click en pestaña
  const handleTabClick = (item) => {
    navigate(item.path);
  };

  return (
    <div className="enhanced-tab-bar">
      <div className="tab-container">
        {tabItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`tab-item ${active ? 'active' : ''}`}
            >
              <div className="tab-icon-container">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <span className="tab-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedTabBar; 