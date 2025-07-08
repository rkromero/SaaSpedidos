import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import ProductosList from './ProductosList';
import Carrito from './Carrito';
import AdminPanel from './AdminPanel';
import GestionProductos from './GestionProductos';
import GestionFranquiciados from './GestionFranquiciados';
import './Dashboard.css';

function Dashboard({ user }) {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNegocio = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || '';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/negocios/mi-negocio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNegocio(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching negocio:', err);
        setLoading(false);
      }
    };

    fetchNegocio();
  }, []);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  // Dashboard para Dueño de Franquicia
  if (user.tipo === 'DUEÑO') {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Panel de Dueño - {negocio?.nombre}</h1>
          <p>Gestiona tu franquicia desde aquí</p>
        </div>

        <div className="dashboard-nav">
          <Link to="/dashboard" className="nav-item">Resumen</Link>
          <Link to="/dashboard/productos" className="nav-item">Productos</Link>
          <Link to="/dashboard/franquiciados" className="nav-item">Franquiciados</Link>
          <Link to="/dashboard/pedidos" className="nav-item">Pedidos</Link>
        </div>

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<ResumenDueño user={user} negocio={negocio} />} />
            <Route path="/productos" element={<ProductosListDashboard />} />
            <Route path="/franquiciados" element={<GestionFranquiciados />} />
            <Route path="/pedidos" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Dashboard para Franquiciado
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Franquiciado - {negocio?.nombre}</h1>
        <p>Bienvenido, {user.nombre}</p>
      </div>

      <div className="dashboard-nav">
        <Link to="/dashboard" className="nav-item">Productos</Link>
        <Link to="/dashboard/carrito" className="nav-item">Carrito</Link>
        <Link to="/dashboard/mis-pedidos" className="nav-item">Mis Pedidos</Link>
      </div>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<ProductosListDashboard />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

// Componente para listar productos en el Dashboard
function ProductosListDashboard() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGestionProductos, setShowGestionProductos] = useState(false);

  useEffect(() => {
    fetchProductos();
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
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
    } catch (err) {
      alert('Error al eliminar producto');
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

  if (showGestionProductos) {
    return (
      <div>
        <button 
          className="btn btn-secondary mb-3"
          onClick={() => setShowGestionProductos(false)}
        >
          ← Volver a Lista
        </button>
        <GestionProductos />
      </div>
    );
  }

  return (
    <div className="productos-dashboard">
      <div className="header-section">
        <h2>Gestión de Productos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowGestionProductos(true)}
        >
          Agregar Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p>No tienes productos registrados</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowGestionProductos(true)}
          >
            Agregar tu primer producto
          </button>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <div key={producto.id} className="producto-card">
              <h3>{producto.nombre}</h3>
              <p>{producto.descripcion}</p>
              <p><strong>Precio:</strong> ${producto.precio}</p>
              <p><strong>Stock:</strong> {producto.stock}</p>
              <p><strong>Categoría:</strong> {producto.categoria || 'Sin categoría'}</p>
              <div className="product-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowGestionProductos(true)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteProduct(producto.id)}
                >
                  Eliminar
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
    totalFranquiciados: 0,
    pedidosPendientes: 0,
    ventasMes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || '';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/negocios/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="resumen">
      <h2>Resumen del Negocio</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalProductos}</h3>
            <p>Productos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalFranquiciados}</h3>
            <p>Franquiciados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{stats.pedidosPendientes}</h3>
            <p>Pedidos Pendientes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.ventasMes}</h3>
            <p>Ventas del Mes</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          <Link to="/dashboard/productos" className="action-card">
            <div className="action-icon">➕</div>
            <h4>Agregar Producto</h4>
            <p>Carga un nuevo producto al catálogo</p>
          </Link>
          
          <Link to="/dashboard/franquiciados" className="action-card">
            <div className="action-icon">👤</div>
            <h4>Nuevo Franquiciado</h4>
            <p>Invita a un nuevo franquiciado</p>
          </Link>
          
          <Link to="/dashboard/pedidos" className="action-card">
            <div className="action-icon">📋</div>
            <h4>Ver Pedidos</h4>
            <p>Revisa y gestiona los pedidos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar pedidos del franquiciado
function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || '';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/api/pedidos/mis-pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pedidos:', err);
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  if (loading) return <div className="loading">Cargando pedidos...</div>;

  return (
    <div className="mis-pedidos">
      <h2>Mis Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No tienes pedidos aún</p>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <h4>Pedido #{pedido.id}</h4>
              <p><strong>Estado:</strong> {pedido.estado}</p>
              <p><strong>Total:</strong> ${pedido.total}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fechaPedido).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard; 