import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useHaptics } from '../../hooks/useHaptics';

const EnhancedTabBar = ({ user }) => {
  const location = useLocation();
  const { navigateTo } = useNavigation();
  const { light: playHapticFeedback } = useHaptics();
  const [activeTabIndicator, setActiveTabIndicator] = useState({ width: 0, left: 0 });

  // Configuración de pestañas basada en el rol del usuario
  const getTabItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Inicio', 
        path: '/dashboard',
        icon: 'home',
        roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
      },
      {
        id: 'productos',
        label: 'Productos',
        path: '/dashboard/productos',
        icon: 'package',
        roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
      },
      {
        id: 'pedidos',
        label: 'Pedidos',
        path: '/dashboard/pedidos',
        icon: 'clipboard',
        roles: ['DUEÑO_NEGOCIO', 'FRANQUICIADO', 'EMPLEADO']
      },
      {
        id: 'carrito',
        label: 'Carrito',
        path: '/carrito',
        icon: 'cart',
        roles: ['FRANQUICIADO', 'EMPLEADO'],
        badge: 3 // Ejemplo de badge
      }
    ];

    // Agregar pestaña de admin para dueños de negocio
    if (user?.rol === 'DUEÑO_NEGOCIO') {
      baseItems.push({
        id: 'admin',
        label: 'Admin',
        path: '/admin',
        icon: 'settings',
        roles: ['DUEÑO_NEGOCIO']
      });
    }

    return baseItems.filter(item => item.roles.includes(user?.rol));
  };

  const tabItems = getTabItems();

  // Verificar si una pestaña está activa
  const isActive = useCallback((path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Manejar click en pestaña
  const handleTabClick = (item) => {
    if (!isActive(item.path)) {
      playHapticFeedback();
      navigateTo(item.path);
    }
  };

  // Obtener icono SVG
  const getIcon = (iconName, isActive = false) => {
    const iconClass = `tab-icon ${isActive ? 'active' : ''}`;
    
    switch (iconName) {
      case 'home':
        return (
          <svg className={iconClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'package':
        return (
          <svg className={iconClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11V7" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className={iconClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'cart':
        return (
          <svg className={iconClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={iconClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 0 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <div className={`${iconClass} flex items-center justify-center`}>
            <span className="text-xl">❓</span>
          </div>
        );
    }
  };

  // Calcular posición del indicador activo
  useEffect(() => {
    const activeIndex = tabItems.findIndex(item => isActive(item.path));
    if (activeIndex !== -1) {
      const tabWidth = 100 / tabItems.length;
      setActiveTabIndicator({
        width: tabWidth,
        left: activeIndex * tabWidth
      });
    }
  }, [location.pathname, tabItems, isActive]);

  return (
    <div className="enhanced-tab-bar">
      {/* Indicador de pestaña activa */}
      <div 
        className="tab-indicator"
        style={{
          width: `${activeTabIndicator.width}%`,
          left: `${activeTabIndicator.left}%`
        }}
      />

      {/* Pestañas */}
      <div className="tab-container">
        {tabItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`tab-item ${active ? 'active' : ''}`}
              disabled={active}
            >
              {/* Icono con badge opcional */}
              <div className="tab-icon-container">
                {getIcon(item.icon, active)}
                {item.badge && (
                  <div className="tab-badge">
                    <span className="tab-badge-text">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="tab-label">
                {item.label}
              </span>

              {/* Efecto de ripple para feedback táctil */}
              <div className="tab-ripple" />
            </button>
          );
        })}
      </div>

      {/* Sombra superior sutil */}
      <div className="tab-shadow" />
    </div>
  );
};

export default EnhancedTabBar; 