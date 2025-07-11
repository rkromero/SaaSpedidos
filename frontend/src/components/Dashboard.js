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
    let mounted = true;
    
    const fetchNegocio = async () => {
      if (!mounted) return;
      
      try {
        const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        console.log('🔍 Fetching negocio data...');
        const response = await axios.get(`${baseURL}/api/negocios/mi-negocio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (mounted) {
          console.log('✅ Negocio data received');
          setNegocio(response.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error fetching negocio:', err);
        if (mounted) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.log('🔒 Auth error, cleaning up...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          } else {
            showToast('Error al cargar información del negocio', 'error');
            setLoading(false);
          }
        }
      }
    };

    fetchNegocio();
    
    return () => {
      mounted = false;
    };
  }, []); // EMPTY DEPENDENCY ARRAY - NO MORE LOOPS!

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
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="font-medium text-primary-600">
                      ${parseFloat(producto.precio).toFixed(2)}
                    </span>
                    {producto.peso && (
                      <span>{producto.peso}kg</span>
                    )}
                    {producto.categoria && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {producto.categoria}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  className="btn-ios-ghost text-red-600 p-2"
                  onClick={() => handleDeleteProduct(producto.id)}
                >
                  🗑️
                </button>
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

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-ios bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Productos</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalProductos}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className="card-ios bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Franquiciados</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalFranquiciados}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="card-ios bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pedidos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pedidosPendientes || 0}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="card-ios bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Ventas del Mes</p>
              <p className="text-2xl font-bold text-purple-900">${(stats.ventasMes || 0).toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card-ios">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="btn-ios-primary"
            onClick={handleAgregarProducto}
          >
            + Agregar Producto
          </button>
          <button 
            className="btn-ios-secondary"
            onClick={handleNuevoFranquiciado}
          >
            + Nuevo Franquiciado
          </button>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
        <Link to="/dashboard/nuevo-pedido" className="btn-ios-primary">
          + Nuevo Pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="card-ios text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes pedidos
          </h3>
          <p className="text-gray-600 mb-6">
            Realiza tu primer pedido para comenzar
          </p>
          <Link to="/dashboard/nuevo-pedido" className="btn-ios-primary">
            Crear Primer Pedido
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="card-ios">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Pedido #{pedido.numero}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(pedido.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-medium text-primary-600">
                    Total: ${parseFloat(pedido.total).toFixed(2)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pedido.estado === 'NUEVO_PEDIDO' ? 'bg-blue-100 text-blue-800' :
                  pedido.estado === 'EN_FABRICACION' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {pedido.estado}
                </span>
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
