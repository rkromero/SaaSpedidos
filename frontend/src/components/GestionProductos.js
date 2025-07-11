import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function GestionProductos({ onProductoCreated }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    peso: '',
    categoria: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [productosLoaded, setProductosLoaded] = useState(false);
  const { showToast } = useToast();

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
      showToast('Error al cargar productos', 'error');
    } finally {
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
    setSubmitting(true);
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
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
      
      showToast(
        editingId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
        'success'
      );
      
      if (isCreating && onProductoCreated) {
        onProductoCreated();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar producto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      peso: producto.peso?.toString() || '',
      categoria: producto.categoria || ''
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
      showToast('Producto eliminado exitosamente', 'success');
    } catch (err) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      peso: '',
      categoria: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-ios bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Gestión de Productos</h1>
            <p className="text-green-100 text-sm">
              {productosLoaded ? `${productos.length} productos` : 'Haz click en "Cargar" para ver productos'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="bg-white text-green-600 px-4 py-2 rounded-ios font-semibold text-sm shadow-ios"
              onClick={fetchProductos}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar Productos'}
            </button>
            <button 
              className="bg-white text-green-600 px-4 py-2 rounded-ios font-semibold text-sm shadow-ios"
              onClick={() => setShowForm(true)}
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card-ios">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                className="btn-ios-ghost px-3 py-1 text-sm"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="input-ios"
                    placeholder="Ej: Camiseta personalizada"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="input-ios"
                    placeholder="Ej: Textil, Sublimación"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="input-ios resize-none"
                  placeholder="Describe el producto..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-ios"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input-ios"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn-ios-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-ios-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      {productosLoaded && productos.length > 0 && (
        <div className="card-ios">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Productos ({productos.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="border border-gray-200 rounded-ios p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                      {producto.categoria && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {producto.categoria}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {producto.descripcion && (
                    <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-green-600">
                      ${producto.precio}
                    </span>
                    {producto.peso && (
                      <span className="text-gray-500">
                        {producto.peso} kg
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {productosLoaded && productos.length === 0 && (
        <div className="card-ios text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay productos
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega tu primer producto para empezar
          </p>
          <button 
            className="btn-ios-primary"
            onClick={() => setShowForm(true)}
          >
            + Agregar Producto
          </button>
        </div>
      )}
    </div>
  );
}

export default GestionProductos; 