import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const response = await axios.get(`${baseURL}/api/carrito`);
      setCarrito(response.data.items || []);
      setLoading(false);
    } catch (err) {
      showToast('Error al cargar el carrito', 'error');
      setLoading(false);
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.put(`${baseURL}/api/carrito/actualizar`, {
        productoId,
        cantidad: nuevaCantidad
      });
      fetchCarrito();
      showToast('Cantidad actualizada', 'success');
    } catch (err) {
      showToast('Error al actualizar cantidad', 'error');
    }
  };

  const eliminarProducto = async (productoId) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.delete(`${baseURL}/api/carrito/eliminar/${productoId}`);
      fetchCarrito();
      showToast('Producto eliminado del carrito', 'success');
    } catch (err) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  const realizarPedido = async () => {
    setProcesando(true);
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.post(`${baseURL}/api/pedidos`);
      showToast('¡Pedido realizado con éxito!', 'success');
      setCarrito([]);
    } catch (err) {
      showToast('Error al realizar el pedido', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-ios bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Carrito de Compras</h1>
            <p className="text-purple-100 text-sm">
              {carrito.length > 0 ? `${calcularTotalItems()} productos` : 'Carrito vacío'}
            </p>
          </div>
          <div className="text-3xl">🛒</div>
        </div>
      </div>

      {carrito.length === 0 ? (
        /* Estado vacío */
        <div className="card-ios text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Tu carrito está vacío
          </h3>
          <p className="text-gray-600 mb-8">
            Agrega productos desde el catálogo para crear un pedido
          </p>
          <Link to="/dashboard" className="btn-ios-primary">
            Ver Productos
          </Link>
        </div>
      ) : (
        <>
          {/* Lista de productos */}
          <div className="space-y-3">
            {carrito.map((item, index) => (
              <div key={item.productoId} className="card-ios">
                <div className="space-y-4">
                  {/* Info del producto */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {item.nombre}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Para fabricación
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-primary-600">
                        ${item.precio}
                      </div>
                      <div className="text-sm text-gray-500">
                        c/u
                      </div>
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-ios p-3">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900">Cantidad:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          <span className="text-lg font-bold text-gray-600">-</span>
                        </button>
                        
                        <div className="w-16 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0) {
                                actualizarCantidad(item.productoId, val);
                              }
                            }}
                            className="w-full text-center border-0 bg-transparent font-semibold text-lg text-gray-900 focus:outline-none"
                          />
                        </div>
                        
                        <button
                          className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                        >
                          <span className="text-lg font-bold text-white">+</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-ios font-medium transition-colors active:bg-red-100"
                    onClick={() => {
                      if (window.confirm('¿Eliminar este producto del carrito?')) {
                        eliminarProducto(item.productoId);
                      }
                    }}
                  >
                    🗑️ Eliminar del carrito
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="card-ios bg-gray-50">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Resumen del Pedido
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Productos ({calcularTotalItems()})</span>
                  <span className="font-medium">${calcularTotal().toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-primary-600 text-xl">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de realizar pedido */}
          <div className="space-y-3">
            <button
              className="btn-ios-primary w-full"
              onClick={realizarPedido}
              disabled={procesando}
            >
              {procesando ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-ios mr-2"></div>
                  Procesando pedido...
                </div>
              ) : (
                `🚀 Realizar Pedido - $${calcularTotal().toFixed(2)}`
              )}
            </button>
            
            <Link to="/dashboard" className="btn-ios-secondary w-full block text-center">
              Seguir Comprando
            </Link>
          </div>

          {/* Información adicional */}
          <div className="card-ios bg-blue-50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Información importante
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Los productos serán fabricados bajo pedido</li>
                  <li>• Recibirás una confirmación por email</li>
                  <li>• Puedes seguir el estado en "Mis Pedidos"</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito; 