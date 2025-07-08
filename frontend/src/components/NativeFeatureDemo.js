import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptics } from '../hooks/useHaptics';
import { useSwipeGesture, useLongPress } from '../hooks/useGestures';
import { usePWA } from '../hooks/usePWA';
import { useToast } from '../contexts/ToastContext';

// Componentes nativos
import NativeButton from './native/NativeButton';
import NativeInput from './native/NativeInput';
import { SkeletonCard, SkeletonList } from './native/SkeletonScreen';
import ActionSheet from './native/ActionSheet';
import NativeModal from './native/NativeModal';
import PullToRefresh from './native/PullToRefresh';
import LoadingSpinner from './native/LoadingSpinner';
import InstallPWAButton from './native/InstallPWAButton';

const NativeFeatureDemo = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const haptics = useHaptics();
  const { isInstalled, isOnline } = usePWA();
  const { addToast } = useToast();
  
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demostración de gestos
  const swipeGesture = useSwipeGesture(
    () => addToast('Swipe izquierda detectado!', 'info'),
    () => addToast('Swipe derecha detectado!', 'info')
  );

  const longPressGesture = useLongPress(
    () => {
      addToast('Long press detectado!', 'success');
    }
  );

  // Simulación de datos
  const actionSheetActions = [
    {
      title: 'Editar',
      icon: '✏️',
      handler: () => {
        addToast('Editando...', 'info');
      }
    },
    {
      title: 'Compartir',
      icon: '📤',
      handler: () => {
        addToast('Compartiendo...', 'info');
      }
    },
    {
      title: 'Eliminar',
      icon: '🗑️',
      handler: () => {
        addToast('Eliminando...', 'error');
      }
    }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    addToast('Datos actualizados!', 'success');
  };

  const testHaptics = () => {
    haptics.success();
    addToast('Haptic feedback activado!', 'success');
  };

  const toggleSkeletonDemo = () => {
    setShowSkeleton(!showSkeleton);
    if (!showSkeleton) {
      setTimeout(() => setShowSkeleton(false), 3000);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <div className="card-ios">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          🚀 Funcionalidades Nativas
        </h2>
        
        <div className="space-y-4">
          {/* Estado de la aplicación */}
          <div className="flex items-center space-x-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600 dark:text-gray-400">
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
            {isInstalled && (
              <>
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">PWA Instalada</span>
              </>
            )}
          </div>

          {/* Botones de demostración */}
          <div className="grid grid-cols-2 gap-3">
            <NativeButton
              onClick={toggleDarkMode}
              variant="secondary"
              icon={darkMode ? '☀️' : '🌙'}
              hapticFeedback="light"
            >
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </NativeButton>

            <NativeButton
              onClick={testHaptics}
              variant="primary"
              icon="📳"
              hapticFeedback="success"
            >
              Test Haptics
            </NativeButton>

            <NativeButton
              onClick={() => setShowActionSheet(true)}
              variant="ghost"
              icon="⚡"
            >
              Action Sheet
            </NativeButton>

            <NativeButton
              onClick={() => setShowModal(true)}
              variant="secondary"
              icon="🔲"
            >
              Modal
            </NativeButton>

            <NativeButton
              onClick={toggleSkeletonDemo}
              variant="ghost"
              icon="⚡"
            >
              Skeleton
            </NativeButton>

            <InstallPWAButton />
          </div>

          {/* Input nativo */}
          <NativeInput
            label="Input Nativo"
            placeholder="Prueba la experiencia nativa..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            clearable
            icon={<span>🔍</span>}
          />

          {/* Área de demostración de gestos */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center"
            {...swipeGesture}
            {...longPressGesture}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Área de Gestos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Swipe left/right • Long press
            </p>
          </div>

          {/* Skeleton demo */}
          {showSkeleton && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Skeleton Loading
              </h3>
              <SkeletonList items={3} showImage />
            </div>
          )}

          {/* Pull to refresh demo */}
          <div className="h-64 border rounded-lg overflow-hidden">
            <PullToRefresh onRefresh={handleRefresh}>
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pull to Refresh
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Desliza hacia abajo para actualizar
                </p>
                {isLoading && (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Actualizando..." />
                  </div>
                )}
                {!isLoading && (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        Item {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PullToRefresh>
          </div>
        </div>
      </div>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Opciones disponibles"
        actions={actionSheetActions}
        destructiveIndex={2}
      />

      {/* Modal */}
      <NativeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modal Nativo"
        size="default"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Este es un modal con animaciones nativas, soporte para gestos y dark mode.
          </p>
          <div className="space-y-3">
            <NativeButton
              onClick={() => setShowModal(false)}
              variant="primary"
              className="w-full"
            >
              Cerrar
            </NativeButton>
          </div>
        </div>
      </NativeModal>
    </div>
  );
};

export default NativeFeatureDemo; 