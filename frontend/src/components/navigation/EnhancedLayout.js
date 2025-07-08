import React from 'react';
import { NavigationProvider } from '../../contexts/NavigationContext';
import EnhancedHeader from './EnhancedHeader';
import EnhancedTabBar from './EnhancedTabBar';

const EnhancedLayout = ({ children, user, onLogout }) => {
  return (
    <NavigationProvider>
      <div className="h-screen-ios bg-gray-50 dark:bg-gray-900 relative">
        {/* Header mejorado */}
        <EnhancedHeader user={user} onLogout={onLogout} />
        
        {/* Área de contenido principal */}
        <div className="main-content">
          {children}
        </div>
        
        {/* Tab Bar mejorado - fijo en la parte inferior */}
        <EnhancedTabBar user={user} />
      </div>
    </NavigationProvider>
  );
};

export default EnhancedLayout; 