import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
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
      setDataLoaded(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-ios bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Panel de Administración</h1>
            <p className="text-orange-100 text-sm">
              {dataLoaded ? 'Datos cargados' : 'Haz click en "Cargar Datos" para comenzar'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-white text-orange-600 px-4 py-2 rounded-ios font-semibold text-sm shadow-ios"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar Datos'}
            </button>
            <div className="text-3xl">⚙️</div>
          </div>
        </div>
      </div>

      {dataLoaded && (
        <>
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
                  Pedidos Filtrados ({pedidosFiltrados.length})
                </h3>
              </div>

              {pedidosFiltrados.length === 0 ? (
                <div className="card-ios text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay pedidos
                  </h3>
                  <p className="text-gray-600">
                    Los pedidos aparecerán aquí cuando se hagan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pedidosFiltrados.map((pedido) => (
                    <div key={pedido.id} className="card-ios">
                      <div className="space-y-4">
                        {/* Header del pedido */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Pedido #{pedido.numero}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {pedido.usuario?.nombre} - {pedido.usuario?.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(pedido.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                              {getEstadoIcon(pedido.estado)} {pedido.estado?.replace('_', ' ')}
                            </span>
                            <div className="text-lg font-bold text-gray-900 mt-1">
                              ${pedido.total}
                            </div>
                          </div>
                        </div>

                        {/* Productos del pedido */}
                        <div className="bg-gray-50 rounded-ios p-3">
                          <h5 className="font-medium text-gray-900 mb-2">Productos:</h5>
                          <div className="space-y-2">
                            {pedido.productos?.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.producto?.nombre || 'Producto'}</span>
                                <span>{item.cantidad}x ${item.precio}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notas */}
                        {pedido.notas && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Notas:</strong> {pedido.notas}
                            </p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex space-x-2">
                          <select
                            value={pedido.estado}
                            onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                            className="flex-1 input-ios text-sm"
                          >
                            <option value="NUEVO_PEDIDO">Nuevo Pedido</option>
                            <option value="EN_FABRICACION">En Fabricación</option>
                            <option value="ENTREGADO">Entregado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab de productos */}
          {activeTab === 'productos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos ({productosFiltrados.length})
                </h3>
              </div>

              {productosFiltrados.length === 0 ? (
                <div className="card-ios text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay productos
                  </h3>
                  <p className="text-gray-600">
                    Los productos aparecerán aquí cuando se agreguen
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((producto) => (
                    <div key={producto.id} className="card-ios">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                            {producto.categoria && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {producto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${producto.precio}
                            </div>
                            {producto.peso && (
                              <div className="text-xs text-gray-500">
                                {producto.peso} kg
                              </div>
                            )}
                          </div>
                        </div>

                        {producto.descripcion && (
                          <p className="text-sm text-gray-600">{producto.descripcion}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            producto.activo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {producto.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!dataLoaded && (
        <div className="card-ios text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚙️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Panel de Administración
          </h3>
          <p className="text-gray-600 mb-6">
            Haz click en "Cargar Datos" para comenzar
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 