import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import './DashboardMetrics.css';

function DashboardMetrics() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalFranquiciados: 0,
    nuevoPedidos: 0,
    ventasMes: 0,
    pedidosEnFabricacion: 0,
    pedidosEntregados: 0
  });
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      
      const [statsResponse, pedidosResponse] = await Promise.all([
        axios.get(`${baseURL}/api/negocios/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseURL}/api/pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const pedidos = pedidosResponse.data;
      const enFabricacion = pedidos.filter(p => p.estado === 'EN_FABRICACION').length;
      const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;

      setStats({
        totalProductos: statsResponse.data.totalProductos,
        totalFranquiciados: statsResponse.data.totalFranquiciados,
        nuevoPedidos: statsResponse.data.pedidosPendientes,
        ventasMes: statsResponse.data.ventasMes,
        pedidosEnFabricacion: enFabricacion,
        pedidosEntregados: entregados
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      showError('Error al cargar las métricas');
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`metric-card ${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3 className="metric-value">{value}</h3>
        <p className="metric-title">{title}</p>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) return <div className="loading">Cargando métricas...</div>;

  return (
    <div className="dashboard-metrics">
      <div className="metrics-header">
        <h2>📊 Métricas del Negocio</h2>
        <button 
          className="btn btn-secondary btn-small"
          onClick={fetchStats}
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Productos Activos"
          value={stats.totalProductos}
          icon="📦"
          color="blue"
        />
        
        <MetricCard
          title="Franquiciados"
          value={stats.totalFranquiciados}
          icon="👥"
          color="green"
        />
        
        <MetricCard
          title="Nuevos Pedidos"
          value={stats.nuevoPedidos}
          icon="🆕"
          color="yellow"
          subtitle="Pendientes de fabricación"
        />
        
        <MetricCard
          title="En Fabricación"
          value={stats.pedidosEnFabricacion}
          icon="🔨"
          color="orange"
        />
        
        <MetricCard
          title="Entregados"
          value={stats.pedidosEntregados}
          icon="✅"
          color="purple"
        />
        
        <MetricCard
          title="Ventas del Mes"
          value={`$${stats.ventasMes.toFixed(2)}`}
          icon="💰"
          color="green"
        />
      </div>

      <div className="metrics-summary">
        <div className="summary-card">
          <h3>🎯 Resumen de Actividad</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span>Total de pedidos:</span>
              <strong>{stats.nuevoPedidos + stats.pedidosEnFabricacion + stats.pedidosEntregados}</strong>
            </div>
            <div className="summary-item">
              <span>Tasa de finalización:</span>
              <strong>
                {stats.pedidosEntregados > 0 
                  ? `${((stats.pedidosEntregados / (stats.nuevoPedidos + stats.pedidosEnFabricacion + stats.pedidosEntregados)) * 100).toFixed(1)}%`
                  : '0%'
                }
              </strong>
            </div>
            <div className="summary-item">
              <span>Promedio por pedido:</span>
              <strong>
                ${stats.pedidosEntregados > 0 
                  ? (stats.ventasMes / stats.pedidosEntregados).toFixed(2)
                  : '0.00'
                }
              </strong>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>📈 Indicadores Clave</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span>Productos por franquiciado:</span>
              <strong>
                {stats.totalFranquiciados > 0 
                  ? (stats.totalProductos / stats.totalFranquiciados).toFixed(1)
                  : '0'
                }
              </strong>
            </div>
            <div className="summary-item">
              <span>Pedidos pendientes:</span>
              <strong className={stats.nuevoPedidos > 5 ? 'warning' : ''}>
                {stats.nuevoPedidos}
              </strong>
            </div>
            <div className="summary-item">
              <span>Estado de producción:</span>
              <strong className={stats.pedidosEnFabricacion > 0 ? 'active' : 'inactive'}>
                {stats.pedidosEnFabricacion > 0 ? 'Activa' : 'Inactiva'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMetrics; 