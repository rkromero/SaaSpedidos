import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import NuevoPedido from './NuevoPedido';

function ProductosListFranquiciado() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNuevoPedido, setShowNuevoPedido] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchProductos();
    
    // Verificar si se debe mostrar el formulario automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new-order') {
      setShowNuevoPedido(true);
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const fetchProductos = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/productos/mi-negocio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching productos:', err);
      showToast('Error al cargar productos', 'error');
      setLoading(false);
    }
  };

  const handlePedidoCreado = () => {
    setShowNuevoPedido(false);
    fetchProductos();
  };

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

  // Filtrar productos
  const productosFiltrados = productos
    .filter(p => p.activo)
    .filter(p => !filtroCategoria || p.categoria === filtroCategoria)
    .filter(p => 
      !busqueda || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando productos...</p>
      </div>
    );
  }

  if (showNuevoPedido) {
    return (
      <NuevoPedido 
        onPedidoCreado={handlePedidoCreado}
        onCancelar={() => setShowNuevoPedido(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con CTA */}
      <div className="card-ios bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Catálogo de Productos</h1>
            <p className="text-primary-100 text-sm">
              {productosFiltrados.length} productos disponibles
            </p>
          </div>
          <button 
            className="bg-white text-primary-600 px-4 py-2 rounded-ios font-semibold text-sm shadow-ios"
            onClick={() => setShowNuevoPedido(true)}
          >
            📝 Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="card-ios">
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-ios"
            />
          </div>
          
          {categorias.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="input-ios"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="card-ios text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {busqueda || filtroCategoria ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </h3>
          <p className="text-gray-600 mb-6">
            {busqueda || filtroCategoria 
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'En este momento no hay productos disponibles'
            }
          </p>
          {(busqueda || filtroCategoria) && (
            <button 
              className="btn-ios-secondary"
              onClick={() => {
                setBusqueda('');
                setFiltroCategoria('');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="card-ios">
              <div className="space-y-3">
                {/* Header del producto */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Para fabricación
                      </span>
                      {producto.categoria && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {producto.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      ${producto.precio}
                    </div>
                    {producto.peso && (
                      <div className="text-xs text-gray-500">
                        {producto.peso} kg
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {producto.descripcion}
                </p>

                {/* Botón de acción */}
                <button 
                  className="btn-ios-primary w-full"
                  onClick={() => setShowNuevoPedido(true)}
                >
                  Agregar a pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información útil */}
      <div className="space-y-3">
        <div className="card-ios bg-blue-50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Cómo hacer un pedido
              </h4>
              <ol className="text-sm text-gray-700 space-y-1">
                <li>1. Haz clic en "Nuevo Pedido"</li>
                <li>2. Selecciona los productos</li>
                <li>3. Ajusta las cantidades</li>
                <li>4. Agrega notas si es necesario</li>
                <li>5. Confirma tu pedido</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="card-ios bg-yellow-50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📋</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Estado de tus pedidos
              </h4>
              <p className="text-sm text-gray-700">
                Revisa el estado de todos tus pedidos en{' '}
                <Link 
                  to="/dashboard/mis-pedidos" 
                  className="font-medium text-yellow-700 underline"
                >
                  "Mis Pedidos"
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA fijo en la parte inferior */}
      {productosFiltrados.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-10">
          <button 
            className="btn-ios-primary w-full shadow-ios-lg"
            onClick={() => setShowNuevoPedido(true)}
          >
            📝 Crear Nuevo Pedido
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductosListFranquiciado; 