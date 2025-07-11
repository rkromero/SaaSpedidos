import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { setupAuthInterceptor, isAuthenticated } from './utils/authInterceptor';
import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';
import OfflineNotification from './components/native/OfflineNotification';
import EnhancedLayout from './components/navigation/EnhancedLayout';
import './App.css';
import './v5BuildInfo.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup simple auth interceptor
    setupAuthInterceptor();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-ios">
        <div className="spinner-ios"></div>
        <p className="text-gray-600 mt-4">Cargando...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App h-screen-ios overflow-hidden">
            <OfflineNotification />
            
            <Routes>
              <Route 
                path="/" 
                element={user ? <Navigate to="/dashboard" /> : <Landing />} 
              />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
              />
              
              <Route 
                path="/dashboard/*" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <Dashboard user={user} />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/carrito" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <Carrito />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/admin" 
                element={
                  user ? (
                    <EnhancedLayout user={user} onLogout={handleLogout}>
                      <AdminPanel />
                    </EnhancedLayout>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            
            <ToastContainer />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App; 