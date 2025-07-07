import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <h1>SaaS Pedidos</h1>
      <nav className="nav">
        <Link to="/">Espacios</Link>
        <Link to="/carrito">Carrito</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}

export default Header; 