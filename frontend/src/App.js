import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';

// Componentes
import Header from './components/Header';
import EspaciosList from './components/EspaciosList';
import ProductosList from './components/ProductosList';
import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Routes>
              <Route path="/" element={<EspaciosList />} />
              <Route path="/espacio/:espacioId" element={<ProductosList />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
