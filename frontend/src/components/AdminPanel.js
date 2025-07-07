import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const [pedidosRes, espaciosRes, productosRes] = await Promise.all([
        axios.get(`${baseURL}/api/pedidos`),
        axios.get(`${baseURL}/api/espacios`),
        axios.get(`${baseURL}/api/productos`)
      ]);
      
      setPedidos(pedidosRes.data);
      setEspacios(espaciosRes.data);
      setProductos(productosRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.put(`${baseURL}/api/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      fetchData();
    } catch (err) {
      alert('Error al cambiar estado del pedido');
    }
  };

  if (loading) return <div>Cargando panel de administración...</div>;

  return (
    <div>
      <h2>Panel de Administración</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'pedidos' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >
          Pedidos
        </button>
        <button 
          className={`btn ${activeTab === 'espacios' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('espacios')}
        >
          Espacios
        </button>
        <button 
          className={`btn ${activeTab === 'productos' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          Productos
        </button>
      </div>

      {activeTab === 'pedidos' && (
        <div>
          <h3>Pedidos Recientes</h3>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
              <h4>Pedido #{pedido.id}</h4>
              <p><strong>Cliente:</strong> {pedido.clienteNombre}</p>
              <p><strong>Total:</strong> ${pedido.total}</p>
              <p><strong>Estado:</strong> {pedido.estado}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fechaCreacion).toLocaleDateString()}</p>
              
              <div style={{ marginTop: '10px' }}>
                <select 
                  value={pedido.estado} 
                  onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'espacios' && (
        <div>
          <h3>Espacios</h3>
          {espacios.map((espacio) => (
            <div key={espacio.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
              <h4>{espacio.nombre}</h4>
              <p>{espacio.descripcion}</p>
              <p><strong>Capacidad:</strong> {espacio.capacidad} personas</p>
              <p><strong>Precio por hora:</strong> ${espacio.precioPorHora}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'productos' && (
        <div>
          <h3>Productos</h3>
          {productos.map((producto) => (
            <div key={producto.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
              <h4>{producto.nombre}</h4>
              <p>{producto.descripcion}</p>
              <p><strong>Precio:</strong> ${producto.precio}</p>
              <p><strong>Stock:</strong> {producto.stock}</p>
              <p><strong>Espacio:</strong> {producto.espacio?.nombre || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 