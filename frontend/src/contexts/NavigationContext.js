import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation debe usarse dentro de un NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Configuración de rutas y breadcrumbs
  const routeConfig = {
    '/dashboard': {
      title: 'Dashboard',
      breadcrumbs: [{ label: 'Inicio', path: '/dashboard' }],
      searchable: true,
      actions: []
    },
    '/dashboard/productos': {
      title: 'Productos',
      breadcrumbs: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Productos', path: '/dashboard/productos' }
      ],
      searchable: true,
      actions: [
        { id: 'add_product', label: 'Agregar', icon: '➕', action: 'add_product' }
      ]
    },
    '/dashboard/pedidos': {
      title: 'Pedidos',
      breadcrumbs: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Pedidos', path: '/dashboard/pedidos' }
      ],
      searchable: true,
      actions: [
        { id: 'new_order', label: 'Nuevo Pedido', icon: '📋', action: 'new_order' }
      ]
    },
    '/dashboard/metricas': {
      title: 'Métricas',
      breadcrumbs: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Métricas', path: '/dashboard/metricas' }
      ],
      searchable: false,
      actions: [
        { id: 'export', label: 'Exportar', icon: '📊', action: 'export_metrics' }
      ]
    },
    '/carrito': {
      title: 'Carrito',
      breadcrumbs: [{ label: 'Carrito', path: '/carrito' }],
      searchable: true,
      actions: [
        { id: 'clear_cart', label: 'Limpiar', icon: '🗑️', action: 'clear_cart' }
      ]
    },
    '/admin': {
      title: 'Administración',
      breadcrumbs: [{ label: 'Administración', path: '/admin' }],
      searchable: true,
      actions: [
        { id: 'settings', label: 'Configuración', icon: '⚙️', action: 'settings' }
      ]
    }
  };

  // Obtener configuración actual basada en la ruta
  const getCurrentRouteConfig = () => {
    const path = location.pathname;
    return routeConfig[path] || {
      title: 'SaaS Pedidos',
      breadcrumbs: [],
      searchable: false,
      actions: []
    };
  };

  // Actualizar historial de navegación
  useEffect(() => {
    const currentPath = location.pathname;
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      const lastPath = newHistory[newHistory.length - 1];
      
      if (lastPath !== currentPath) {
        newHistory.push(currentPath);
        // Mantener solo los últimos 10 elementos
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      
      return newHistory;
    });

    // Limpiar búsqueda al cambiar de ruta
    setSearchQuery('');
    setIsSearchActive(false);
    setSearchResults([]);
  }, [location.pathname]);

  // Función para ir hacia atrás
  const goBack = () => {
    if (navigationHistory.length > 1) {
      const previousPath = navigationHistory[navigationHistory.length - 2];
      navigate(previousPath);
    } else {
      navigate('/dashboard');
    }
  };

  // Función para navegar a una ruta específica
  const navigateTo = (path) => {
    navigate(path);
  };

  // Función para manejar acciones del header
  const handleAction = (actionId) => {
    const config = getCurrentRouteConfig();
    const action = config.actions.find(a => a.id === actionId);
    
    if (action) {
      console.log(`Ejecutando acción: ${action.action}`);
      // Aquí podrías ejecutar diferentes acciones basadas en el ID
      // Por ejemplo, abrir modales, navegar a rutas específicas, etc.
    }
  };

  // Función para realizar búsqueda
  const performSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Aquí implementarías la lógica de búsqueda real
    // Por ahora, simularemos algunos resultados
    const mockResults = [
      { id: 1, title: `Resultado para "${query}"`, path: '/dashboard/productos', type: 'producto' },
      { id: 2, title: `Pedido con "${query}"`, path: '/dashboard/pedidos', type: 'pedido' },
    ];

    setSearchResults(mockResults);
  };

  // Función para alternar búsqueda
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Verificar si se puede ir hacia atrás
  const canGoBack = navigationHistory.length > 1;

  const value = {
    // Estado
    currentRoute: getCurrentRouteConfig(),
    navigationHistory,
    searchQuery,
    searchResults,
    isSearchActive,
    canGoBack,
    
    // Funciones
    goBack,
    navigateTo,
    handleAction,
    performSearch,
    toggleSearch,
    setSearchQuery,
    setIsSearchActive
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}; 