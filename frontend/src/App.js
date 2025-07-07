import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import EspaciosList from './components/EspaciosList';
import ProductosList from './components/ProductosList';
import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<EspaciosList />} />
            <Route path="/espacios/:espacioId/productos" element={<ProductosList />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 