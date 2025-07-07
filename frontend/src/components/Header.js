import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>SaaS Pedidos</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user?.nombre}</span>
            <span className="user-type">({user?.tipo === 'DUEÑO' ? 'Dueño' : 'Franquiciado'})</span>
          </div>
          <button onClick={onLogout} className="btn btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header; 