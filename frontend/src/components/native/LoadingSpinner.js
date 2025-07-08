import React from 'react';

const LoadingSpinner = ({ 
  size = 'default', // 'small', 'default', 'large'
  color = 'primary', // 'primary', 'white', 'gray'
  text = null,
  overlay = false,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4 border-2';
      case 'large':
        return 'w-12 h-12 border-4';
      default:
        return 'w-8 h-8 border-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300';
      default:
        return 'border-primary-200 border-t-primary-500';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-spin`}
      />
      {text && (
        <p className={`mt-3 text-gray-600 dark:text-gray-400 ${getTextSizeClasses()}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-ios-lg p-6 shadow-ios-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export const LoadingOverlay = ({ children, loading, ...props }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 flex items-center justify-center rounded-ios">
          <LoadingSpinner {...props} />
        </div>
      )}
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="small" color="white" className="mr-2" />
          <span>Cargando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export const LoadingPage = ({ text = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
};

export default LoadingSpinner; 