import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

function GestionProductos({ onProductoCreated }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const { showToast } = useToast();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/productos/mi-negocio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching productos:', err);
      showToast('Error al cargar productos', 'error');
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
      
      // Si se está creando un producto y hay callback, ejecutarlo
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

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-ios bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">Gestión de Productos</h1>
            <p className="text-green-100 text-sm">
              {productos.length} productos en catálogo
            </p>
          </div>
          <button 
            className="bg-white text-green-600 px-4 py-2 rounded-ios font-semibold text-sm shadow-ios"
            onClick={() => setShowForm(true)}
          >
            + Agregar
          </button>
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
                  rows="3"
                  className="input-ios"
                  placeholder="Describe el producto, materiales, tamaños disponibles..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="input-ios pl-8"
                      placeholder="0.00"
                    />
                  </div>
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

              <div className="bg-yellow-50 p-4 rounded-ios">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚙️</span>
                  <div>
                    <p className="font-medium text-yellow-800">Producto bajo pedido</p>
                    <p className="text-sm text-yellow-700">
                      Este producto se fabricará cuando se reciba un pedido
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn-ios-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-ios mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    `${editingId ? 'Actualizar' : 'Crear'} Producto`
                  )}
                </button>
                <button
                  type="button"
                  className="btn-ios-secondary flex-1"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos ({productos.length})
          </h3>
          {!showForm && (
            <button
              className="btn-ios-ghost text-sm"
              onClick={() => setShowForm(true)}
            >
              + Agregar producto
            </button>
          )}
        </div>
        
        {productos.length === 0 ? (
          <div className="card-ios text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-600 mb-6">
              Agrega tu primer producto para empezar
            </p>
            <button
              className="btn-ios-primary"
              onClick={() => setShowForm(true)}
            >
              Agregar Producto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {productos.map((producto) => (
              <div key={producto.id} className="card-ios">
                <div className="space-y-3">
                  {/* Header del producto */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {producto.nombre}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Para fabricación
                        </span>
                        {producto.categoria && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {producto.categoria}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        ${producto.precio}
                      </div>
                      {producto.peso && (
                        <div className="text-xs text-gray-500">
                          {producto.peso} kg
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  {producto.descripcion && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {producto.descripcion}
                    </p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex space-x-3">
                    <button
                      className="btn-ios-secondary flex-1"
                      onClick={() => handleEdit(producto)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-ios-ghost flex-1 text-red-600"
                      onClick={() => {
                        if (window.confirm('¿Eliminar este producto?')) {
                          handleDelete(producto.id);
                        }
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
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