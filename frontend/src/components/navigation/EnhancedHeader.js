import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import InstallPWAButton from '../native/InstallPWAButton';

const EnhancedHeader = ({ user, onLogout }) => {
  const {
    currentRoute,
    canGoBack,
    goBack,
    navigateTo,
    handleAction,
    isSearchActive,
    toggleSearch,
    searchQuery,
    setSearchQuery,
    performSearch,
    searchResults
  } = useNavigation();

  const [showMenu, setShowMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);

  // Focus en el input de búsqueda cuando se activa
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Manejar búsqueda
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
    setShowSearchResults(query.length > 0);
  };

  // Manejar click en resultado de búsqueda
  const handleSearchResultClick = (result) => {
    navigateTo(result.path);
    toggleSearch();
    setShowSearchResults(false);
  };

  // Renderizar breadcrumbs
  const renderBreadcrumbs = () => {
    if (!currentRoute.breadcrumbs || currentRoute.breadcrumbs.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center space-x-1 text-sm">
        {currentRoute.breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <button
              onClick={() => navigateTo(crumb.path)}
              className={`px-2 py-1 rounded-md transition-colors ${
                index === currentRoute.breadcrumbs.length - 1
                  ? 'text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {crumb.label}
            </button>
            {index < currentRoute.breadcrumbs.length - 1 && (
              <span className="text-gray-400 dark:text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Renderizar acciones del header
  const renderActions = () => {
    if (!currentRoute.actions || currentRoute.actions.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2">
        {currentRoute.actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="flex items-center space-x-1 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            title={action.label}
          >
            <span>{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="enhanced-header">
      {/* Header principal */}
      <div className="header-main">
        <div className="header-left">
          {/* Botón de retroceso */}
          {canGoBack && (
            <button
              onClick={goBack}
              className="back-button"
              title="Atrás"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Título o barra de búsqueda */}
          {isSearchActive ? (
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                  onBlur={() => {
                    // Delay para permitir clicks en resultados
                    setTimeout(() => setShowSearchResults(false), 200);
                  }}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                <button
                  onClick={toggleSearch}
                  className="search-close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="search-result-item"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="result-icon">
                          {result.type === 'producto' ? '📦' : result.type === 'pedido' ? '📋' : '📄'}
                        </div>
                        <div className="result-content">
                          <div className="result-title">{result.title}</div>
                          <div className="result-type">{result.type}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <h1 className="header-title">
              {currentRoute.title}
            </h1>
          )}
        </div>

        <div className="header-right">
          {/* Botón de búsqueda */}
          {currentRoute.searchable && !isSearchActive && (
            <button
              onClick={toggleSearch}
              className="search-toggle-button"
              title="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Acciones contextuales */}
          {renderActions()}

          {/* Menú de usuario */}
          <div className="user-menu-container">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="user-menu-trigger"
            >
              <div className="user-avatar">
                <span className="user-avatar-text">
                  {user?.nombre?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="user-name">
                {user?.nombre}
              </span>
              <svg className="user-menu-arrow w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-info">
                  <p className="user-menu-name">{user?.nombre}</p>
                  <p className="user-menu-email">{user?.email}</p>
                  <p className="user-menu-role">{user?.rol}</p>
                </div>
                
                <div className="user-menu-pwa">
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
                  className="user-menu-logout"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {currentRoute.breadcrumbs && currentRoute.breadcrumbs.length > 1 && (
        <div className="breadcrumbs-container">
          {renderBreadcrumbs()}
        </div>
      )}
    </div>
  );
};

export default EnhancedHeader; 