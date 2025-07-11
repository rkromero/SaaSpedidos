import React from 'react';
import { Link } from 'react-router-dom';

const AuthError = ({ message = "Tu sesión ha expirado", onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sesión Expirada
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}. Por favor, inicia sesión nuevamente.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="btn-ios-primary w-full block text-center"
            >
              Iniciar Sesión
            </Link>
            
            {onRetry && (
              <button 
                onClick={onRetry}
                className="btn-ios-ghost w-full"
              >
                Reintentar
              </button>
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>¿Necesitas ayuda? <Link to="/" className="text-primary-600">Contacta soporte</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError; 