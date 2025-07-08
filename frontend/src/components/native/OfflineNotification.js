import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/usePWA';

const OfflineNotification = () => {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('offline');

  useEffect(() => {
    if (!isOnline) {
      setNotificationType('offline');
      setShowNotification(true);
    } else if (isSlowConnection) {
      setNotificationType('slow');
      setShowNotification(true);
      
      // Ocultar notificación de conexión lenta después de 5 segundos
      const timeout = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    } else {
      // Mostrar brevemente que se recuperó la conexión
      if (showNotification && notificationType === 'offline') {
        setNotificationType('online');
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } else {
        setShowNotification(false);
      }
    }
  }, [isOnline, isSlowConnection, showNotification, notificationType]);

  const getNotificationContent = () => {
    switch (notificationType) {
      case 'offline':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Sin conexión',
          message: 'Trabajando en modo offline',
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      case 'slow':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Conexión lenta',
          message: `Conexión ${connectionType}`,
          bgColor: 'bg-yellow-500',
          textColor: 'text-white'
        };
      case 'online':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Conectado',
          message: 'Conexión restaurada',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      default:
        return null;
    }
  };

  if (!showNotification) return null;

  const content = getNotificationContent();
  if (!content) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${content.bgColor} ${content.textColor} rounded-ios shadow-ios-lg transform transition-all duration-300 ease-out`}>
      <div className="flex items-center px-4 py-3">
        <div className="flex-shrink-0 mr-3">
          {content.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {content.title}
          </p>
          <p className="text-xs opacity-90">
            {content.message}
          </p>
        </div>
        {notificationType !== 'online' && (
          <button
            onClick={() => setShowNotification(false)}
            className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineNotification; 