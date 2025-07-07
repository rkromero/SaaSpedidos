import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ProductosList() {
  const { espacioId } = useParams();
  const [productos, setProductos] = useState([]);
  const [espacio, setEspacio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_URL || '';
        const [productosResponse, espacioResponse] = await Promise.all([
          axios.get(`${baseURL}/api/espacios/${espacioId}/productos`),
          axios.get(`${baseURL}/api/espacios/${espacioId}`)
        ]);
        
        setProductos(productosResponse.data);
        setEspacio(espacioResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los productos');
        setLoading(false);
      }
    };

    fetchData();
  }, [espacioId]);

  const agregarAlCarrito = async (productoId) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      await axios.post(`${baseURL}/api/carrito/agregar`, {
        productoId,
        cantidad: 1
      });
      alert('Producto agregado al carrito');
    } catch (err) {
      alert('Error al agregar al carrito');
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {espacio && (
        <div>
          <h2>Productos de {espacio.nombre}</h2>
          <p>{espacio.descripcion}</p>
        </div>
      )}
      
      <div className="productos-grid">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card">
            <h3>{producto.nombre}</h3>
            <p>{producto.descripcion}</p>
            <p><strong>Precio:</strong> ${producto.precio}</p>
            <p><strong>Stock:</strong> {producto.stock}</p>
            <button 
              className="btn" 
              onClick={() => agregarAlCarrito(producto.id)}
              disabled={producto.stock === 0}
            >
              {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductosList; 