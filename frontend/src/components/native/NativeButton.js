import React, { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { useLongPress } from '../../hooks/useGestures';

const NativeButton = ({ 
  children, 
  onClick, 
  onLongPress,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'destructive'
  size = 'default', // 'small', 'default', 'large'
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left', // 'left', 'right'
  hapticFeedback = 'light', // 'light', 'medium', 'heavy', 'none'
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const haptics = useHaptics();

  const longPressGesture = useLongPress(
    (e) => {
      if (onLongPress && !disabled && !loading) {
        onLongPress(e);
      }
    },
    500
  );

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Haptic feedback
    switch (hapticFeedback) {
      case 'light':
        haptics.light();
        break;
      case 'medium':
        haptics.medium();
        break;
      case 'heavy':
        haptics.heavy();
        break;
      default:
        break;
    }
    
    onClick?.(e);
  };

  const getVariantClasses = () => {
    const baseClasses = 'font-semibold transition-all duration-200 active:scale-95';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 disabled:bg-gray-100 disabled:text-gray-400`;
      case 'ghost':
        return `${baseClasses} bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 dark:hover:bg-primary-900 dark:active:bg-primary-800 disabled:text-gray-300`;
      case 'destructive':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 text-sm min-h-[36px] rounded-lg';
      case 'large':
        return 'px-8 py-4 text-lg min-h-[56px] rounded-ios-lg';
      default:
        return 'px-6 py-3 text-base min-h-[48px] rounded-ios';
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <span className={`flex items-center justify-center ${
        children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''
      }`}>
        {icon}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span>Cargando...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        {iconPosition === 'left' && renderIcon()}
        {children && <span>{children}</span>}
        {iconPosition === 'right' && renderIcon()}
      </div>
    );
  };

  return (
    <button
      className={`${getVariantClasses()} ${getSizeClasses()} ${className} ${
        isPressed ? 'transform scale-95' : ''
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleClick}
      disabled={disabled || loading}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      {...longPressGesture}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default NativeButton; 