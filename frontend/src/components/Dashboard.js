import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import Carrito from './Carrito';
import AdminPanel from './AdminPanel';
import GestionProductos from './GestionProductos';
import GestionFranquiciados from './GestionFranquiciados';
import ProductosListFranquiciado from './ProductosListFranquiciado';
import NuevoPedido from './NuevoPedido';
import DashboardMetrics from './DashboardMetrics';

function Dashboard({ user }) {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchNegocio = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/negocios/mi-negocio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNegocio(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching negocio:', err);
        showToast('Error al cargar información del negocio', 'error');
        setLoading(false);
      }
    };

    fetchNegocio();
  }, []);

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando dashboard...</p>
      </div>
    );
  }

  // Dashboard para Dueño de Franquicia
  if (user.tipo === 'DUEÑO') {
    return (
      <div className="p-6 min-h-full">
        <Routes>
          <Route path="/" element={<ResumenDueño user={user} negocio={negocio} />} />
          <Route path="/metricas" element={<DashboardMetrics />} />
          <Route path="/productos" element={<ProductosListDashboard />} />
          <Route path="/franquiciados" element={<GestionFranquiciados />} />
          <Route path="/pedidos" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    );
  }

  // Dashboard para Franquiciado
  return (
    <div className="p-6 min-h-full">
      <Routes>
        <Route path="/" element={<ProductosListFranquiciado />} />
        <Route path="/nuevo-pedido" element={<NuevoPedidoWrapper />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

// Componente de bienvenida mejorado
function WelcomeCard({ user, negocio }) {
  return (
    <div className="card-ios mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            ¡Hola, {user.nombre}! 👋
          </h2>
          <p className="text-purple-100 text-lg">
            Bienvenido a {negocio?.nombre || 'tu negocio'}
          </p>
          <p className="text-purple-200 text-sm mt-1">
            {user.tipo === 'DUEÑO' ? 'Panel de administración' : 'Panel de franquiciado'}
          </p>
        </div>
        <div className="text-6xl opacity-80">
          {user.tipo === 'DUEÑO' ? '👑' : '🏪'}
        </div>
      </div>
    </div>
  );
}

// Componente para listar productos en el Dashboard
function ProductosListDashboard() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGestionProductos, setShowGestionProductos] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProductos();
    
    // Verificar si se debe mostrar el formulario automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowGestionProductos(true);
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/dashboard/productos');
    }
  }, []);

  const fetchProductos = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
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

  const handleDeleteProduct = async (id) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
      showToast('Producto eliminado exitosamente', 'success');
    } catch (err) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando productos...</p>
      </div>
    );
  }

  if (showGestionProductos) {
    return (
      <div className="space-y-4">
        <button 
          className="btn-ios-secondary"
          onClick={() => setShowGestionProductos(false)}
        >
          ← Volver a Lista
        </button>
        <GestionProductos 
          onProductoCreated={() => {
            setShowGestionProductos(false);
            fetchProductos();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <button 
          className="btn-ios-primary"
          onClick={() => setShowGestionProductos(true)}
        >
          + Agregar Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="card-ios text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes productos
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega tu primer producto para empezar a gestionar tu inventario
          </p>
          <button 
            className="btn-ios-primary"
            onClick={() => setShowGestionProductos(true)}
          >
            Agregar Primer Producto
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {productos.map((producto) => (
            <div key={producto.id} className="card-ios">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {producto.descripcion}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="text-2xl font-bold text-purple-600">
                      ${producto.precio}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Stock: {producto.stock || 0}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="btn-ios-secondary text-sm px-4 py-2"
                    onClick={() => {/* Implementar edición */}}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-ios-ghost text-red-600 text-sm px-4 py-2"
                    onClick={() => handleDeleteProduct(producto.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de resumen para dueños
function ResumenDueño({ user, negocio }) {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    totalFranquiciados: 0,
    ventasDelMes: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/negocios/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleAgregarProducto = () => {
    navigate('/dashboard/productos?action=add');
  };

  const handleNuevoFranquiciado = () => {
    navigate('/dashboard/franquiciados');
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando resumen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeCard user={user} negocio={negocio} />
      
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-ios text-center">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProductos}</div>
          <div className="text-sm text-gray-600">Productos</div>
        </div>
        <div className="card-ios text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</div>
          <div className="text-sm text-gray-600">Pedidos</div>
        </div>
        <div className="card-ios text-center">
          <div className="text-3xl mb-2">🏪</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalFranquiciados}</div>
          <div className="text-sm text-gray-600">Franquiciados</div>
        </div>
        <div className="card-ios text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900">${stats.ventasDelMes}</div>
          <div className="text-sm text-gray-600">Ventas del mes</div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card-ios">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="btn-ios-primary"
            onClick={handleAgregarProducto}
          >
            <span className="text-lg mr-2">📦</span>
            Agregar Producto
          </button>
          <button 
            className="btn-ios-secondary"
            onClick={handleNuevoFranquiciado}
          >
            <span className="text-lg mr-2">🏪</span>
            Nuevo Franquiciado
          </button>
        </div>
      </div>

      {/* Resumen de actividad reciente */}
      <div className="card-ios">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">🎉</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nuevo pedido recibido</p>
              <p className="text-xs text-gray-500">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Producto agregado al catálogo</p>
              <p className="text-xs text-gray-500">Hace 1 día</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">🏪</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nuevo franquiciado registrado</p>
              <p className="text-xs text-gray-500">Hace 3 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar pedidos del franquiciado
function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/pedidos/mis-pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pedidos:', err);
        showToast('Error al cargar pedidos', 'error');
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mis Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <div className="card-ios text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes pedidos
          </h3>
          <p className="text-gray-600 mb-6">
            Tus pedidos aparecerán aquí
          </p>
          <Link to="/dashboard" className="btn-ios-primary">
            Ver Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="card-ios">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Pedido #{pedido.id}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pedido.estado === 'NUEVO_PEDIDO' ? 'bg-blue-100 text-blue-800' :
                        pedido.estado === 'EN_FABRICACION' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pedido.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-medium">Total:</span> ${pedido.total}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Fecha:</span> {
                        new Date(pedido.fechaPedido).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper para NuevoPedido en el dashboard de franquiciados
function NuevoPedidoWrapper() {
  const navigate = useNavigate();
  
  return (
    <NuevoPedido 
      onPedidoCreado={() => navigate('/dashboard/mis-pedidos')}
      onCancelar={() => navigate('/dashboard')}
    />
  );
}

export default Dashboard; 