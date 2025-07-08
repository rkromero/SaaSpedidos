import React from 'react';
import { NavigationProvider } from '../../contexts/NavigationContext';
import EnhancedHeader from './EnhancedHeader';
import EnhancedTabBar from './EnhancedTabBar';

const EnhancedLayout = ({ children, user, onLogout }) => {
  return (
    <NavigationProvider>
      <div className="h-screen-ios flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header mejorado */}
        <EnhancedHeader user={user} onLogout={onLogout} />
        
        {/* Área de contenido principal */}
        <div className="main-content flex-1 overflow-y-auto">
          {children}
        </div>
        
        {/* Tab Bar mejorado */}
        <EnhancedTabBar user={user} />
      </div>
    </NavigationProvider>
  );
};

export default EnhancedLayout; 