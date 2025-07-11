import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

function ProductosListFranquiciado() {
  // NO MORE USEEFFECT! NO MORE FETCH!
  const [showNuevoPedido, setShowNuevoPedido] = useState(false);
  const { showToast } = useToast();

  if (showNuevoPedido) {
    return (
      <div className="space-y-4">
        <button 
          className="btn-ios-secondary"
          onClick={() => setShowNuevoPedido(false)}
        >
          ← Volver a Productos
        </button>
        <div className="card-ios text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nuevo Pedido</h3>
          <p className="text-gray-600">Funcionalidad próximamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <button 
          className="btn-ios-primary"
          onClick={() => setShowNuevoPedido(true)}
        >
          + Nuevo Pedido
        </button>
      </div>

      <div className="card-ios text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Catálogo de Productos
        </h3>
        <p className="text-gray-600 mb-6">
          Los productos se cargarán próximamente
        </p>
        <p className="text-sm text-gray-500">
          Esta vista está temporalmente simplificada para evitar loops infinitos
        </p>
      </div>
    </div>
  );
}

export default ProductosListFranquiciado;