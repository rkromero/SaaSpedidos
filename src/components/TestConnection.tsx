'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, API_BASE_URL } from '@/lib/api';

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Haz clic en "Probar Conexión" para verificar el backend'
  });

  const testConnection = async () => {
    setConnectionStatus({
      status: 'testing',
      message: 'Conectando con Railway...'
    });

    try {
      // Probar health check
      const response = await api.healthCheck();
      
      setConnectionStatus({
        status: 'success',
        message: '¡Conexión exitosa con Railway!',
        details: response
      });
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '🔗';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Prueba de Conexión</span>
          <span className="text-2xl">{getStatusIcon()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Backend URL:</strong></p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
            {API_BASE_URL}
          </p>
        </div>

        <Button 
          onClick={testConnection}
          disabled={connectionStatus.status === 'testing'}
          className="w-full"
        >
          {connectionStatus.status === 'testing' ? 'Probando...' : 'Probar Conexión'}
        </Button>

        <div className={`text-sm ${getStatusColor()}`}>
          <p className="font-medium">{connectionStatus.message}</p>
        </div>

        {connectionStatus.details && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Ver detalles de respuesta
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify(connectionStatus.details, null, 2)}
            </pre>
          </details>
        )}

        {connectionStatus.status === 'success' && (
          <div className="text-xs text-green-700 bg-green-50 p-3 rounded">
            <p className="font-medium">🎉 ¡Backend funcionando correctamente!</p>
            <p>Puedes usar todas las funciones del SaaS:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Registro e inicio de sesión</li>
              <li>Dashboard de negocios</li>
              <li>Gestión de productos</li>
              <li>Gestión de pedidos en tiempo real</li>
              <li>Backoffice administrativo</li>
            </ul>
          </div>
        )}

        {connectionStatus.status === 'error' && (
          <div className="text-xs text-red-700 bg-red-50 p-3 rounded">
            <p className="font-medium">💡 Posibles soluciones:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Verificar que Railway esté activo</li>
              <li>Revisar las variables de entorno</li>
              <li>Comprobar logs en Railway</li>
              <li>Verificar configuración CORS</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 