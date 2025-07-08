import React, { useEffect, useRef } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { useSwipeGesture } from '../../hooks/useGestures';

const ActionSheet = ({ 
  isOpen, 
  onClose, 
  actions = [], 
  title = null, 
  cancelText = 'Cancelar',
  destructiveIndex = null 
}) => {
  const haptics = useHaptics();
  const sheetRef = useRef(null);
  
  const swipeGesture = useSwipeGesture(
    null, // onSwipeLeft
    () => {
      haptics.light();
      onClose();
    } // onSwipeRight
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      haptics.light();
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, haptics]);

  const handleActionClick = (action) => {
    haptics.light();
    action.handler();
    onClose();
  };

  const handleCancel = () => {
    haptics.medium();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Action Sheet */}
      <div 
        ref={sheetRef}
        className="relative w-full max-w-md mx-4 mb-4 transform transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          opacity: isOpen ? 1 : 0,
        }}
        {...swipeGesture}
      >
        {/* Main Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-ios-lg overflow-hidden shadow-ios-lg">
          {title && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                {title}
              </h3>
            </div>
          )}
          
          {actions.map((action, index) => (
            <button
              key={index}
              className={`w-full px-4 py-4 text-left transition-colors duration-200 ${
                index !== actions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
              } ${
                index === destructiveIndex 
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900 active:bg-red-100 dark:active:bg-red-800' 
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
              }`}
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-center space-x-3">
                {action.icon && (
                  <span className="text-xl">{action.icon}</span>
                )}
                <span className="font-medium">{action.title}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Cancel Button */}
        <button
          className="w-full mt-2 px-4 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-ios-lg shadow-ios transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
          onClick={handleCancel}
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default ActionSheet; 