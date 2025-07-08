import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import './GestionFranquiciados.css';

function GestionFranquiciados() {
  const [franquiciados, setFranquiciados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFranquiciado, setSelectedFranquiciado] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchFranquiciados();
    
    // Verificar si se debe mostrar el formulario automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowForm(true);
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/dashboard/franquiciados');
    }
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
      showError('Error al cargar franquiciados');
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
      showSuccess('Franquiciado creado exitosamente. Se enviará un email con las credenciales.');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear franquiciado');
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
      showSuccess('Estado del franquiciado actualizado exitosamente');
    } catch (err) {
      showError('Error al cambiar estado del franquiciado');
    }
  };

  const handleChangePassword = (franquiciado) => {
    setSelectedFranquiciado(franquiciado);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/api/usuarios/${selectedFranquiciado.id}/change-password`, {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedFranquiciado(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al cambiar contraseña');
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
      showSuccess('Se enviará un email con la nueva contraseña al franquiciado.');
    } catch (err) {
      showError('Error al resetear contraseña');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      password: ''
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

            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Contraseña para el franquiciado"
                minLength="6"
              />
            </div>

            <div className="form-info">
              <p>
                <strong>Nota:</strong> El franquiciado podrá cambiar su contraseña después de iniciar sesión.
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

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cambiar Contraseña - {selectedFranquiciado?.nombre}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedFranquiciado(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña *</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  minLength="6"
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Cambiar Contraseña
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedFranquiciado(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
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
                    onClick={() => handleChangePassword(franquiciado)}
                  >
                    Cambiar Contraseña
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