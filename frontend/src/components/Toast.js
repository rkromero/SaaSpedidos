import React from 'react';
import { useToast } from '../contexts/ToastContext';
import './Toast.css';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const handleClose = () => {
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
          aria-label="Cerrar"
        >
          ×
        </button>
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