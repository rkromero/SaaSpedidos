import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionFranquiciados.css';

function GestionFranquiciados() {
  const [franquiciados, setFranquiciados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    fetchFranquiciados();
  }, []);

  const fetchFranquiciados = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/usuarios/franquiciados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFranquiciados(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching franquiciados:', err);
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
      
      await axios.post(`${baseURL}/api/usuarios/franquiciados`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchFranquiciados();
      resetForm();
      alert('Franquiciado creado exitosamente. Se enviará un email con las credenciales.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear franquiciado');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/api/usuarios/${id}/toggle-status`, {
        activo: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFranquiciados();
    } catch (err) {
      alert('Error al cambiar estado del franquiciado');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres resetear la contraseña de este franquiciado?')) {
      return;
    }
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.post(`${baseURL}/api/usuarios/${id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Se enviará un email con la nueva contraseña al franquiciado.');
    } catch (err) {
      alert('Error al resetear contraseña');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: ''
    });
    setShowForm(false);
  };

  if (loading) return <div className="loading">Cargando franquiciados...</div>;

  return (
    <div className="gestion-franquiciados">
      <div className="header-section">
        <h2>Gestión de Franquiciados</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Agregar Franquiciado
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h3>Nuevo Franquiciado</h3>
          <form onSubmit={handleSubmit} className="franquiciado-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre y apellido"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="franquiciado@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div className="form-info">
              <p>
                <strong>Nota:</strong> Se generará automáticamente una contraseña y se enviará al email del franquiciado.
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Crear Franquiciado
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="franquiciados-list">
        <h3>Franquiciados ({franquiciados.length})</h3>
        
        {franquiciados.length === 0 ? (
          <p className="no-franquiciados">No hay franquiciados registrados aún.</p>
        ) : (
          <div className="franquiciados-grid">
            {franquiciados.map((franquiciado) => (
              <div key={franquiciado.id} className={`franquiciado-card ${!franquiciado.activo ? 'inactive' : ''}`}>
                <div className="franquiciado-header">
                  <div className="franquiciado-info">
                    <h4>{franquiciado.nombre}</h4>
                    <p className="franquiciado-email">{franquiciado.email}</p>
                    {franquiciado.telefono && (
                      <p className="franquiciado-phone">{franquiciado.telefono}</p>
                    )}
                  </div>
                  <div className="status-badge">
                    <span className={`status ${franquiciado.activo ? 'active' : 'inactive'}`}>
                      {franquiciado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="franquiciado-details">
                  <div className="detail-item">
                    <span className="label">Fecha de registro:</span>
                    <span className="value">
                      {new Date(franquiciado.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Último acceso:</span>
                    <span className="value">
                      {franquiciado.ultimoAcceso 
                        ? new Date(franquiciado.ultimoAcceso).toLocaleDateString()
                        : 'Nunca'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="franquiciado-actions">
                  <button 
                    className={`btn btn-small ${franquiciado.activo ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggleStatus(franquiciado.id, franquiciado.activo)}
                  >
                    {franquiciado.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleResetPassword(franquiciado.id)}
                  >
                    Resetear Contraseña
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionFranquiciados; 