import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useHaptics } from '../hooks/useHaptics';
import './Toast.css';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const haptics = useHaptics();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  useEffect(() => {
    // Haptic feedback basado en el tipo
    switch (toast.type) {
      case 'success':
        haptics.success();
        break;
      case 'error':
        haptics.error();
        break;
      case 'warning':
        haptics.medium();
        break;
      default:
        haptics.light();
        break;
    }
  }, [toast.type, haptics]);

  const handleClose = () => {
    haptics.light();
    removeToast(toast.id);
  };

  return (
    <div className={`toast toast-${toast.type}`} onClick={handleClose}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon(toast.type)}
        </div>
        <div className="toast-message">
          {toast.message}
        </div>
        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ 
            animationDuration: `${toast.duration}ms`
          }}
        />
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer; 