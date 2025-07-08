import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/api/pedidos/${pedidoId}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
          className={`btn ${activeTab === 'productos' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          Productos
        </button>
      </div>

      {activeTab === 'pedidos' && (
        <div>
          <h3>Pedidos Recientes</h3>
          {pedidos.length === 0 ? (
            <p>No hay pedidos registrados</p>
          ) : (
            pedidos.map((pedido) => (
              <div key={pedido.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
                <h4>Pedido #{pedido.numero}</h4>
                <p><strong>Cliente:</strong> {pedido.usuario?.nombre || 'N/A'}</p>
                <p><strong>Email:</strong> {pedido.usuario?.email || 'N/A'}</p>
                <p><strong>Total:</strong> ${pedido.total}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.createdAt).toLocaleDateString()}</p>
                
                {pedido.notas && (
                  <p><strong>Notas:</strong> {pedido.notas}</p>
                )}
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Productos:</strong>
                  <ul>
                    {pedido.detalles?.map((detalle, index) => (
                      <li key={index}>
                        {detalle.producto?.nombre} - Cantidad: {detalle.cantidad} - Precio: ${detalle.precio}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <select 
                    value={pedido.estado} 
                    onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="EN_PREPARACION">En Preparación</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'productos' && (
        <div>
          <h3>Productos</h3>
          {productos.length === 0 ? (
            <p>No hay productos registrados</p>
          ) : (
            productos.map((producto) => (
              <div key={producto.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
                <h4>{producto.nombre}</h4>
                <p>{producto.descripcion}</p>
                <p><strong>Precio:</strong> ${producto.precio}</p>
                <p><strong>Stock:</strong> {producto.stock}</p>
                <p><strong>Categoría:</strong> {producto.categoria || 'Sin categoría'}</p>
                <p><strong>Peso:</strong> {producto.peso ? `${producto.peso} kg` : 'N/A'}</p>
                <p><strong>Estado:</strong> {producto.activo ? 'Activo' : 'Inactivo'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 