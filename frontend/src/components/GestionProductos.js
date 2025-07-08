import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionProductos.css';

function GestionProductos({ onProductoCreated }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    peso: '',
    stock: '',
    categoria: ''
  });
  const [editingId, setEditingId] = useState(null);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      
      const isCreating = !editingId;
      
      if (editingId) {
        await axios.put(`${baseURL}/api/productos/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${baseURL}/api/productos`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchProductos();
      resetForm();
      
      // Si se está creando un producto y hay callback, ejecutarlo
      if (isCreating && onProductoCreated) {
        onProductoCreated();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      peso: producto.peso?.toString() || '',
      stock: producto.stock.toString(),
      categoria: producto.categoria || ''
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
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

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      peso: '',
      stock: '',
      categoria: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

  return (
    <div className="gestion-productos">
      <div className="header-section">
        <h2>Gestión de Productos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Agregar Producto
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit} className="producto-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoria">Categoría</label>
                <input
                  type="text"
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="precio">Precio *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="peso">Peso (kg)</label>
                <input
                  type="number"
                  id="peso"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="stock">Stock *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Producto
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="productos-list">
        <h3>Productos ({productos.length})</h3>
        
        {productos.length === 0 ? (
          <p className="no-products">No hay productos cargados aún.</p>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="producto-card">
                <div className="producto-header">
                  <h4>{producto.nombre}</h4>
                  <div className="producto-actions">
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => handleEdit(producto)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(producto.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                {producto.descripcion && (
                  <p className="producto-descripcion">{producto.descripcion}</p>
                )}
                
                <div className="producto-details">
                  <div className="detail-item">
                    <span className="label">Precio:</span>
                    <span className="value">${producto.precio}</span>
                  </div>
                  
                  {producto.peso && (
                    <div className="detail-item">
                      <span className="label">Peso:</span>
                      <span className="value">{producto.peso} kg</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="label">Stock:</span>
                    <span className={`value ${producto.stock === 0 ? 'stock-zero' : ''}`}>
                      {producto.stock}
                    </span>
                  </div>
                  
                  {producto.categoria && (
                    <div className="detail-item">
                      <span className="label">Categoría:</span>
                      <span className="value">{producto.categoria}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionProductos; 