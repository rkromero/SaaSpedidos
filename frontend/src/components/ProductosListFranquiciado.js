import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import NuevoPedido from './NuevoPedido';

function ProductosListFranquiciado() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNuevoPedido, setShowNuevoPedido] = useState(false);
  const { showError } = useToast();

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
      showError('Error al cargar productos');
      setLoading(false);
    }
  };

  const handlePedidoCreado = () => {
    setShowNuevoPedido(false);
    // Refresh products
    fetchProductos();
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

  if (showNuevoPedido) {
    return (
      <NuevoPedido 
        onPedidoCreado={handlePedidoCreado}
        onCancelar={() => setShowNuevoPedido(false)}
      />
    );
  }

  return (
    <div className="productos-dashboard">
      <div className="header-section">
        <h2>Productos Disponibles</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNuevoPedido(true)}
        >
          📝 Nuevo Pedido
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos disponibles en este momento</p>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.filter(p => p.activo).map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-header">
                <h3>{producto.nombre}</h3>
                <span className="fabricacion-badge">Para fabricación</span>
              </div>
              
              <p className="producto-descripcion">{producto.descripcion}</p>
              
              <div className="producto-details">
                <div className="precio-info">
                  <span className="precio">${producto.precio}</span>
                  {producto.peso && (
                    <span className="peso">({producto.peso} kg)</span>
                  )}
                </div>
                
                {producto.categoria && (
                  <div className="categoria-info">
                    <span className="categoria">{producto.categoria}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-section">
        <div className="info-card">
          <h4>💡 Cómo hacer un pedido</h4>
          <ol>
            <li>Haz clic en "Nuevo Pedido" para comenzar</li>
            <li>Selecciona los productos que necesitas</li>
            <li>Ajusta las cantidades según tu necesidad</li>
            <li>Agrega notas si es necesario</li>
            <li>Confirma tu pedido</li>
          </ol>
        </div>
        
        <div className="info-card">
          <h4>📋 Estado de tus pedidos</h4>
          <p>
            Puedes revisar el estado de todos tus pedidos en la sección 
            <strong> "Mis Pedidos"</strong> del menú principal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductosListFranquiciado; 