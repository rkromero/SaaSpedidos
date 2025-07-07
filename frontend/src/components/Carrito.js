import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const response = await axios.get(`${baseURL}/api/carrito`);
      setCarrito(response.data.items || []);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.put(`${baseURL}/api/carrito/actualizar`, {
        productoId,
        cantidad: nuevaCantidad
      });
      fetchCarrito();
    } catch (err) {
      alert('Error al actualizar cantidad');
    }
  };

  const eliminarProducto = async (productoId) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.delete(`${baseURL}/api/carrito/eliminar/${productoId}`);
      fetchCarrito();
    } catch (err) {
      alert('Error al eliminar producto');
    }
  };

  const realizarPedido = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.post(`${baseURL}/api/pedidos`);
      alert('Pedido realizado con éxito');
      setCarrito([]);
    } catch (err) {
      alert('Error al realizar el pedido');
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  if (loading) return <div>Cargando carrito...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Carrito de Compras</h2>
      
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          {carrito.map((item) => (
            <div key={item.productoId} className="carrito-item">
              <div>
                <h3>{item.nombre}</h3>
                <p>Precio: ${item.precio}</p>
              </div>
              <div>
                <label>
                  Cantidad:
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.productoId, parseInt(e.target.value))}
                    style={{ marginLeft: '10px', width: '60px' }}
                  />
                </label>
                <button 
                  className="btn btn-danger" 
                  onClick={() => eliminarProducto(item.productoId)}
                  style={{ marginLeft: '10px' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          
          <div className="total">
            <h3>Total: ${calcularTotal()}</h3>
            <button className="btn" onClick={realizarPedido}>
              Realizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito; 