import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import Carrito from './Carrito';
import AdminPanel from './AdminPanel';
import GestionProductos from './GestionProductos';
import GestionFranquiciados from './GestionFranquiciados';
import ProductosListFranquiciado from './ProductosListFranquiciado';
import NuevoPedido from './NuevoPedido';
import DashboardMetrics from './DashboardMetrics';

function Dashboard({ user, negocio }) {
  // NO MORE USEEFFECT! NO MORE FETCH! NEGOCIO COMES FROM PROPS!

  if (!negocio) {
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

// Simple welcome component
function WelcomeCard({ user, negocio }) {
  return (
    <div className="card-ios mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">¡Hola, {user.nombre}! 👋</h2>
          <p className="text-purple-100 text-lg">Bienvenido a {negocio?.nombre || 'tu negocio'}</p>
        </div>
        <div className="text-6xl opacity-80">{user.tipo === 'DUEÑO' ? '👑' : '🏪'}</div>
      </div>
    </div>
  );
}

// Simple resumen - NO FETCH
function ResumenDueño({ user, negocio }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <WelcomeCard user={user} negocio={negocio} />
      
      <div className="card-ios">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="btn-ios-primary"
            onClick={() => navigate('/dashboard/productos')}
          >
            📦 Productos
          </button>
          <button 
            className="btn-ios-secondary"
            onClick={() => navigate('/dashboard/franquiciados')}
          >
            👥 Franquiciados
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple productos list - NO INITIAL FETCH
function ProductosListDashboard() {
  const [showGestionProductos, setShowGestionProductos] = useState(false);

  if (showGestionProductos) {
    return (
      <div className="space-y-4">
        <button 
          className="btn-ios-secondary"
          onClick={() => setShowGestionProductos(false)}
        >
          ← Volver
        </button>
        <GestionProductos onProductoCreado={() => setShowGestionProductos(false)} />
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
      
      <div className="card-ios text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Productos</h3>
        <p className="text-gray-600 mb-6">Administra tu catálogo de productos</p>
      </div>
    </div>
  );
}

// Simple pedidos - NO FETCH
function MisPedidos() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
      <div className="card-ios text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin pedidos</h3>
        <p className="text-gray-600">Tus pedidos aparecerán aquí</p>
      </div>
    </div>
  );
}

function NuevoPedidoWrapper() {
  const navigate = useNavigate();
  return <NuevoPedido onPedidoCreado={() => navigate('/dashboard')} onCancelar={() => navigate('/dashboard')} />;
}

export default Dashboard;
