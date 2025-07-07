import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  Typography, 
  Button, 
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const ProductosList = () => {
  const { espacioId } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carrito, setCarrito] = useState({});

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espacioId, fetchProductos]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/productos/${espacioId}`);
      setProductos(response.data);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => ({
      ...prev,
      [producto.id]: {
        ...producto,
        cantidad: (prev[producto.id]?.cantidad || 0) + 1
      }
    }));
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(prev => {
      const newCarrito = { ...prev };
      if (newCarrito[productoId]) {
        newCarrito[productoId].cantidad -= 1;
        if (newCarrito[productoId].cantidad <= 0) {
          delete newCarrito[productoId];
        }
      }
      return newCarrito;
    });
  };

  const getCantidadEnCarrito = (productoId) => {
    return carrito[productoId]?.cantidad || 0;
  };

  const getTotalCarrito = () => {
    return Object.values(carrito).reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  };

  const irAlCarrito = () => {
    // Guardar carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('espacioId', espacioId);
    navigate('/carrito');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Productos
        </Typography>
        
        {Object.keys(carrito).length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart />}
            onClick={irAlCarrito}
          >
            Carrito ({Object.keys(carrito).length} items) - ${getTotalCarrito().toFixed(2)}
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {productos.map((producto) => (
          <Grid item xs={12} sm={6} md={4} key={producto.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {producto.imagen && (
                <CardMedia
                  component="img"
                  height="200"
                  image={producto.imagen}
                  alt={producto.nombre}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {producto.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {producto.descripcion || 'Sin descripción'}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${producto.precio}
                </Typography>
                {producto.categoria && (
                  <Chip label={producto.categoria} size="small" sx={{ mb: 1 }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  Stock: {producto.stock}
                </Typography>
              </CardContent>
              <CardActions>
                <Box display="flex" alignItems="center" width="100%">
                  {getCantidadEnCarrito(producto.id) > 0 && (
                    <>
                      <IconButton 
                        size="small" 
                        onClick={() => quitarDelCarrito(producto.id)}
                        disabled={producto.stock <= 0}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>
                        {getCantidadEnCarrito(producto.id)}
                      </Typography>
                    </>
                  )}
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock <= 0}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {productos.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No hay productos disponibles
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductosList; 