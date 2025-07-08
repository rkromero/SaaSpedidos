import React, { useEffect, useRef, useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { useSwipeGesture } from '../../hooks/useGestures';

const NativeModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = null,
  size = 'default', // 'small', 'default', 'large', 'fullscreen'
  showCloseButton = true,
  preventCloseOnBackdrop = false,
  animation = 'scale' // 'scale', 'slide', 'fade'
}) => {
  const haptics = useHaptics();
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const swipeGesture = useSwipeGesture(
    null, // onSwipeLeft
    () => {
      if (!preventCloseOnBackdrop) {
        haptics.light();
        onClose();
      }
    } // onSwipeRight
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      haptics.light();
      
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];
      
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
      
      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, haptics]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventCloseOnBackdrop) {
      haptics.medium();
      onClose();
    }
  };

  const handleClose = () => {
    haptics.medium();
    onClose();
  };

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-sm';
      case 'large':
        return 'max-w-4xl';
      case 'fullscreen':
        return 'w-full h-full max-w-none';
      default:
        return 'max-w-md';
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    switch (animation) {
      case 'slide':
        return `${baseClasses} ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`;
      case 'fade':
        return `${baseClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
      default:
        return `${baseClasses} ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        } backdrop-blur-sm`}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-white dark:bg-gray-800 rounded-ios-lg shadow-ios-lg ${getSizeClasses()} ${getAnimationClasses()} ${
          size === 'fullscreen' ? '' : 'max-h-[90vh] overflow-hidden'
        }`}
        {...swipeGesture}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={`${size === 'fullscreen' ? 'h-full' : 'max-h-[70vh]'} overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default NativeModal; 