import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const Carrito = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState({});
  const [espacioId, setEspacioId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    const espacioIdGuardado = localStorage.getItem('espacioId');
    
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
    if (espacioIdGuardado) {
      setEspacioId(espacioIdGuardado);
    }
  }, []);

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      const nuevoCarrito = { ...carrito };
      delete nuevoCarrito[productoId];
      setCarrito(nuevoCarrito);
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    } else {
      const nuevoCarrito = {
        ...carrito,
        [productoId]: {
          ...carrito[productoId],
          cantidad: nuevaCantidad
        }
      };
      setCarrito(nuevoCarrito);
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    }
  };

  const getTotal = () => {
    return Object.values(carrito).reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  };

  const getCantidadTotal = () => {
    return Object.values(carrito).reduce((total, item) => {
      return total + item.cantidad;
    }, 0);
  };

  const handleRealizarPedido = async () => {
    if (!usuario.nombre || !usuario.email) {
      setError('Por favor completa tu nombre y email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear usuario
      const usuarioResponse = await axios.post(`${API_BASE_URL}/usuarios`, usuario);
      const usuarioId = usuarioResponse.data.id;

      // Preparar productos para el pedido
      const productos = Object.values(carrito).map(item => ({
        productoId: item.id,
        cantidad: item.cantidad
      }));

      // Crear pedido
      await axios.post(`${API_BASE_URL}/pedidos`, {
        espacioId,
        usuarioId,
        productos,
        notas: ''
      });

      // Limpiar carrito
      setCarrito({});
      localStorage.removeItem('carrito');
      localStorage.removeItem('espacioId');
      
      setOpenDialog(false);
      navigate('/');
      
    } catch (err) {
      setError('Error al realizar el pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(carrito).length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Ver Espacios
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tu Carrito
      </Typography>

      <Card>
        <CardContent>
          <List>
            {Object.values(carrito).map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.nombre}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ${item.precio} x {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}
                        </Typography>
                        {item.descripcion && (
                          <Typography variant="body2" color="text.secondary">
                            {item.descripcion}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
                        {item.cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => actualizarCantidad(item.id, 0)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box mt={3} textAlign="right">
            <Typography variant="h6">
              Total ({getCantidadTotal()} items): ${getTotal().toFixed(2)}
            </Typography>
          </Box>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
            >
              Seguir Comprando
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setOpenDialog(true)}
              disabled={Object.keys(carrito).length === 0}
            >
              Realizar Pedido
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para datos del usuario */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Completa tus datos</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nombre completo"
            fullWidth
            variant="outlined"
            value={usuario.nombre}
            onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={usuario.email}
            onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Teléfono (opcional)"
            fullWidth
            variant="outlined"
            value={usuario.telefono}
            onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRealizarPedido} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Carrito; 