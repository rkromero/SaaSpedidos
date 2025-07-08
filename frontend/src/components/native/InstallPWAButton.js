import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { useHaptics } from '../../hooks/useHaptics';
import NativeButton from './NativeButton';

const InstallPWAButton = ({ className = '', text = 'Instalar App' }) => {
  const { isInstallable, isInstalled, install } = usePWA();
  const haptics = useHaptics();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    if (!isInstallable) return;
    
    setInstalling(true);
    haptics.medium();
    
    try {
      const success = await install();
      if (success) {
        haptics.success();
      } else {
        haptics.error();
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      haptics.error();
    } finally {
      setInstalling(false);
    }
  };

  // No mostrar si no es instalable o ya está instalado
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <NativeButton
      onClick={handleInstall}
      loading={installing}
      variant="primary"
      className={className}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      }
    >
      {text}
    </NativeButton>
  );
};

export default InstallPWAButton; 