import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import './NuevoPedido.css';

function NuevoPedido({ onPedidoCreado, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [pedidoItems, setPedidoItems] = useState([]);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productosLoaded, setProductosLoaded] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/productos/mi-negocio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(response.data);
      setProductosLoaded(true);
    } catch (err) {
      console.error('Error fetching productos:', err);
      showError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = (producto) => {
    const existingItem = pedidoItems.find(item => item.productoId === producto.id);
    
    if (existingItem) {
      setPedidoItems(pedidoItems.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setPedidoItems([...pedidoItems, {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }]);
    }
  };

  const cambiarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setPedidoItems(pedidoItems.filter(item => item.productoId !== productoId));
    } else {
      setPedidoItems(pedidoItems.map(item =>
        item.productoId === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const eliminarProducto = (productoId) => {
    setPedidoItems(pedidoItems.filter(item => item.productoId !== productoId));
  };

  const calcularTotal = () => {
    return pedidoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pedidoItems.length === 0) {
      showError('Debes agregar al menos un producto al pedido');
      return;
    }

    setSubmitting(true);
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      
      const pedidoData = {
        productos: pedidoItems.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad
        })),
        notas: notas.trim() || null
      };

      await axios.post(`${baseURL}/api/pedidos`, pedidoData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Pedido creado exitosamente');
      if (onPedidoCreado) onPedidoCreado();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nuevo-pedido">
      <div className="header-section">
        <h2>Nuevo Pedido</h2>
        <button className="btn btn-secondary" onClick={onCancelar}>
          ← Volver
        </button>
      </div>

      <div className="pedido-container">
        <div className="productos-section">
          <div className="flex justify-between items-center mb-4">
            <h3>Productos Disponibles</h3>
            <button 
              className="btn btn-primary btn-small"
              onClick={fetchProductos}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar Productos'}
            </button>
          </div>

          {!productosLoaded && (
            <div className="productos-placeholder">
              <p>Haz click en "Cargar Productos" para ver el catálogo</p>
            </div>
          )}

          {productosLoaded && productos.length === 0 && (
            <div className="productos-empty">
              <p>No hay productos disponibles</p>
            </div>
          )}

          {productosLoaded && productos.length > 0 && (
            <div className="productos-grid">
              {productos.filter(p => p.activo).map((producto) => (
                <div key={producto.id} className="producto-card">
                  <div className="producto-info">
                    <h4>{producto.nombre}</h4>
                    <p>{producto.descripcion}</p>
                    <p className="precio">${producto.precio}</p>
                    <p className="fabricacion">Para fabricación</p>
                  </div>
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => agregarProducto(producto)}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pedido-section">
          <h3>Tu Pedido</h3>
          
          {pedidoItems.length === 0 ? (
            <div className="pedido-vacio">
              <p>No has agregado productos al pedido</p>
            </div>
          ) : (
            <div className="pedido-items">
              {pedidoItems.map((item) => (
                <div key={item.productoId} className="pedido-item">
                  <div className="item-info">
                    <h4>{item.nombre}</h4>
                    <p>${item.precio} c/u</p>
                  </div>
                  <div className="item-controls">
                    <div className="cantidad-controls">
                      <button 
                        className="btn-quantity"
                        onClick={() => cambiarCantidad(item.productoId, item.cantidad - 1)}
                      >
                        -
                      </button>
                      <span className="cantidad">{item.cantidad}</span>
                      <button 
                        className="btn-quantity"
                        onClick={() => cambiarCantidad(item.productoId, item.cantidad + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="subtotal">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => eliminarProducto(item.productoId)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="pedido-total">
                <strong>Total: ${calcularTotal().toFixed(2)}</strong>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="pedido-form">
            <div className="form-group">
              <label htmlFor="notas">Notas del pedido (opcional)</label>
              <textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Especifica colores, tallas, fechas de entrega, etc..."
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onCancelar}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || pedidoItems.length === 0}
              >
                {submitting ? 'Creando pedido...' : 'Crear Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NuevoPedido; 