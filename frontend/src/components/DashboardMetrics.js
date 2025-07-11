import React from 'react';
import './DashboardMetrics.css';

function DashboardMetrics() {
  // NO MORE USEEFFECT! NO MORE FETCH!
  
  return (
    <div className="dashboard-metrics">
      <div className="metrics-header">
        <h2>📊 Métricas del Negocio</h2>
      </div>

      <div className="card-ios text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Métricas del Negocio
        </h3>
        <p className="text-gray-600 mb-6">
          Las métricas se cargarán próximamente
        </p>
        <p className="text-sm text-gray-500">
          Esta vista está temporalmente simplificada para evitar loops infinitos
        </p>
      </div>
    </div>
  );
}

export default DashboardMetrics;