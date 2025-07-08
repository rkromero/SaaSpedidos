import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      
      const [pedidosRes, productosRes] = await Promise.all([
        axios.get(`${baseURL}/api/pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseURL}/api/productos/mi-negocio`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setPedidos(pedidosRes.data);
      setProductos(productosRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error al cargar los datos', 'error');
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/api/pedidos/${pedidoId}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      showToast('Estado del pedido actualizado exitosamente', 'success');
    } catch (err) {
      showToast('Error al cambiar estado del pedido', 'error');
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos
    .filter(p => !filtroEstado || p.estado === filtroEstado)
    .filter(p => 
      !busqueda || 
      p.numero?.toString().includes(busqueda) ||
      p.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.usuario?.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

  // Filtrar productos
  const productosFiltrados = productos
    .filter(p => 
      !busqueda || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    );

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'NUEVO_PEDIDO':
        return 'bg-blue-100 text-blue-800';
      case 'EN_FABRICACION':
        return 'bg-yellow-100 text-yellow-800';
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'NUEVO_PEDIDO':
        return '📋';
      case 'EN_FABRICACION':
        return '⚙️';
      case 'ENTREGADO':
        return '✅';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-ios bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Panel de Administración</h1>
            <p className="text-orange-100 text-sm">
              Gestiona pedidos y productos
            </p>
          </div>
          <div className="text-3xl">⚙️</div>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="card-ios p-2">
        <div className="flex bg-gray-100 rounded-ios">
          <button
            className={`flex-1 py-3 px-4 rounded-ios font-medium text-sm transition-colors ${
              activeTab === 'pedidos'
                ? 'bg-white text-gray-900 shadow-ios'
                : 'text-gray-600'
            }`}
            onClick={() => {
              setActiveTab('pedidos');
              setBusqueda('');
              setFiltroEstado('');
            }}
          >
            📋 Pedidos ({pedidos.length})
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-ios font-medium text-sm transition-colors ${
              activeTab === 'productos'
                ? 'bg-white text-gray-900 shadow-ios'
                : 'text-gray-600'
            }`}
            onClick={() => {
              setActiveTab('productos');
              setBusqueda('');
            }}
          >
            📦 Productos ({productos.length})
          </button>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="card-ios">
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder={
                activeTab === 'pedidos' 
                  ? "Buscar por número, cliente o email..." 
                  : "Buscar productos..."
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-ios"
            />
          </div>
          
          {activeTab === 'pedidos' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="input-ios"
              >
                <option value="">Todos los estados</option>
                <option value="NUEVO_PEDIDO">Nuevo Pedido</option>
                <option value="EN_FABRICACION">En Fabricación</option>
                <option value="ENTREGADO">Entregado</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Contenido por tab */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Pedidos {filtroEstado && `(${filtroEstado.replace('_', ' ')})`}
            </h3>
            <span className="text-sm text-gray-600">
              {pedidosFiltrados.length} encontrados
            </span>
          </div>

          {pedidosFiltrados.length === 0 ? (
            <div className="card-ios text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {busqueda || filtroEstado ? 'No se encontraron pedidos' : 'No hay pedidos'}
              </h3>
              <p className="text-gray-600 mb-6">
                {busqueda || filtroEstado 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Los pedidos aparecerán aquí cuando se realicen'
                }
              </p>
              {(busqueda || filtroEstado) && (
                <button 
                  className="btn-ios-secondary"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('');
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="card-ios">
                  <div className="space-y-4">
                    {/* Header del pedido */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Pedido #{pedido.numero}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                            {getEstadoIcon(pedido.estado)} {pedido.estado.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Cliente:</span> {pedido.usuario?.nombre || 'N/A'}</p>
                          <p><span className="font-medium">Email:</span> {pedido.usuario?.email || 'N/A'}</p>
                          <p><span className="font-medium">Fecha:</span> {new Date(pedido.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-600">
                          ${pedido.total}
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    {pedido.notas && (
                      <div className="bg-yellow-50 p-3 rounded-ios">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Notas:</span> {pedido.notas}
                        </p>
                      </div>
                    )}

                    {/* Productos del pedido */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Productos:</h5>
                      <div className="space-y-2">
                        {pedido.detalles?.map((detalle, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-ios">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {detalle.producto?.nombre}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {detalle.cantidad}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  ${detalle.precio}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cambiar estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cambiar estado:
                      </label>
                      <select 
                        value={pedido.estado} 
                        onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                        className="input-ios"
                      >
                        <option value="NUEVO_PEDIDO">📋 Nuevo Pedido</option>
                        <option value="EN_FABRICACION">⚙️ En Fabricación</option>
                        <option value="ENTREGADO">✅ Entregado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
            <span className="text-sm text-gray-600">
              {productosFiltrados.length} encontrados
            </span>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="card-ios text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {busqueda ? 'No se encontraron productos' : 'No hay productos'}
              </h3>
              <p className="text-gray-600 mb-6">
                {busqueda 
                  ? 'Intenta cambiar el término de búsqueda'
                  : 'Los productos aparecerán aquí cuando se agreguen'
                }
              </p>
              {busqueda && (
                <button 
                  className="btn-ios-secondary"
                  onClick={() => setBusqueda('')}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {productosFiltrados.map((producto) => (
                <div key={producto.id} className="card-ios">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {producto.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {producto.descripcion}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Para fabricación
                        </span>
                        {producto.categoria && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {producto.categoria}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          producto.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </div>
                      
                      {producto.peso && (
                        <p className="text-xs text-gray-500 mt-2">
                          Peso: {producto.peso} kg
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-primary-600">
                        ${producto.precio}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 