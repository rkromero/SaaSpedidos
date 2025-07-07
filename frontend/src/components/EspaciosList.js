import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function EspaciosList() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        const response = await axios.get('/api/espacios');
        setEspacios(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los espacios');
        setLoading(false);
      }
    };

    fetchEspacios();
  }, []);

  if (loading) return <div>Cargando espacios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Espacios Disponibles</h2>
      <div className="espacios-grid">
        {espacios.map((espacio) => (
          <div key={espacio.id} className="espacio-card">
            <h3>{espacio.nombre}</h3>
            <p>{espacio.descripcion}</p>
            <p><strong>Capacidad:</strong> {espacio.capacidad} personas</p>
            <p><strong>Precio por hora:</strong> ${espacio.precioPorHora}</p>
            <Link to={`/espacios/${espacio.id}/productos`} className="btn">
              Ver Productos
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EspaciosList; 