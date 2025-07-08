import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NuevoPedido.css';

function NuevoPedido({ onPedidoCreado, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [pedidoItems, setPedidoItems] = useState([]);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const agregarProducto = (producto) => {
    const existingItem = pedidoItems.find(item => item.productoId === producto.id);
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      setPedidoItems(pedidoItems.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
          : item
      ));
    } else {
      // Si no existe, agregar nuevo item
      setPedidoItems([...pedidoItems, {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stockDisponible: producto.stock
      }]);
    }
  };

  const cambiarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      // Eliminar producto si cantidad es 0
      setPedidoItems(pedidoItems.filter(item => item.productoId !== productoId));
    } else {
      const producto = productos.find(p => p.id === productoId);
      const cantidadFinal = Math.min(nuevaCantidad, producto.stock);
      
      setPedidoItems(pedidoItems.map(item =>
        item.productoId === productoId
          ? { ...item, cantidad: cantidadFinal }
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
      alert('Debes agregar al menos un producto al pedido');
      return;
    }

    setSubmitting(true);
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
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

      alert('Pedido creado exitosamente');
      if (onPedidoCreado) onPedidoCreado();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

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
          <h3>Productos Disponibles</h3>
          <div className="productos-grid">
            {productos.filter(p => p.activo && p.stock > 0).map((producto) => (
              <div key={producto.id} className="producto-card">
                <div className="producto-info">
                  <h4>{producto.nombre}</h4>
                  <p>{producto.descripcion}</p>
                  <p className="precio">${producto.precio}</p>
                  <p className="stock">Stock: {producto.stock}</p>
                </div>
                <button 
                  className="btn btn-primary btn-small"
                  onClick={() => agregarProducto(producto)}
                  disabled={
                    pedidoItems.find(item => item.productoId === producto.id)?.cantidad >= producto.stock
                  }
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
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
                        disabled={item.cantidad >= item.stockDisponible}
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
                placeholder="Agregar comentarios o instrucciones especiales..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={pedidoItems.length === 0 || submitting}
              >
                {submitting ? 'Creando Pedido...' : 'Crear Pedido'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onCancelar}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NuevoPedido; 