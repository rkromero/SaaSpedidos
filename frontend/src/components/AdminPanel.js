import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [espacios, setEspacios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para diálogos
  const [openEspacioDialog, setOpenEspacioDialog] = useState(false);
  const [openProductoDialog, setOpenProductoDialog] = useState(false);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  
  // Estados para formularios
  const [nuevoEspacio, setNuevoEspacio] = useState({ nombre: '', descripcion: '' });
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [espaciosRes, pedidosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/espacios`),
        axios.get(`${API_BASE_URL}/pedidos/all`)
      ]);
      
      setEspacios(espaciosRes.data);
      setPedidos(pedidosRes.data || []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEspacio = async () => {
    try {
      await axios.post(`${API_BASE_URL}/espacios`, nuevoEspacio);
      setNuevoEspacio({ nombre: '', descripcion: '' });
      setOpenEspacioDialog(false);
      fetchData();
    } catch (err) {
      setError('Error al crear el espacio');
    }
  };

  const handleCrearProducto = async () => {
    if (!selectedEspacio) return;
    
    try {
      await axios.post(`${API_BASE_URL}/productos`, {
        ...nuevoProducto,
        espacioId: selectedEspacio.id,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock)
      });
      setNuevoProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
      });
      setOpenProductoDialog(false);
      fetchProductos(selectedEspacio.id);
    } catch (err) {
      setError('Error al crear el producto');
    }
  };

  const fetchProductos = async (espacioId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${espacioId}`);
      setProductos(response.data);
    } catch (err) {
      setError('Error al cargar productos');
    }
  };

  const handleEspacioSelect = (espacio) => {
    setSelectedEspacio(espacio);
    fetchProductos(espacio.id);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'PENDIENTE': 'warning',
      'CONFIRMADO': 'info',
      'EN_PREPARACION': 'primary',
      'ENVIADO': 'secondary',
      'ENTREGADO': 'success',
      'CANCELADO': 'error'
    };
    return colores[estado] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Administración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Espacios" />
        <Tab label="Productos" />
        <Tab label="Pedidos" />
      </Tabs>

      {/* Tab Espacios */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Gestionar Espacios</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenEspacioDialog(true)}
            >
              Nuevo Espacio
            </Button>
          </Box>

          <Grid container spacing={2}>
            {espacios.map((espacio) => (
              <Grid item xs={12} sm={6} md={4} key={espacio.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{espacio.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {espacio.descripcion || 'Sin descripción'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Productos: {espacio.productos?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab Productos */}
      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Gestionar Productos</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenProductoDialog(true)}
              disabled={!selectedEspacio}
            >
              Nuevo Producto
            </Button>
          </Box>

          {!selectedEspacio && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Selecciona un espacio para gestionar sus productos
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {espacios.map((espacio) => (
              <Grid item key={espacio.id}>
                <Chip
                  label={espacio.nombre}
                  color={selectedEspacio?.id === espacio.id ? 'primary' : 'default'}
                  onClick={() => handleEspacioSelect(espacio)}
                  clickable
                />
              </Grid>
            ))}
          </Grid>

          {selectedEspacio && (
            <Grid container spacing={2}>
              {productos.map((producto) => (
                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{producto.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {producto.descripcion}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${producto.precio}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stock: {producto.stock}
                      </Typography>
                      {producto.categoria && (
                        <Chip label={producto.categoria} size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab Pedidos */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Pedidos Recibidos
          </Typography>

          <List>
            {pedidos.map((pedido) => (
              <React.Fragment key={pedido.id}>
                <ListItem>
                  <ListItemText
                    primary={`Pedido ${pedido.numero}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Cliente: {pedido.usuario?.nombre} ({pedido.usuario?.email})
                        </Typography>
                        <Typography variant="body2">
                          Total: ${pedido.total}
                        </Typography>
                        <Typography variant="body2">
                          Fecha: {new Date(pedido.createdAt).toLocaleString()}
                        </Typography>
                        <Box mt={1}>
                          {pedido.detalles?.map((detalle) => (
                            <Chip
                              key={detalle.id}
                              label={`${detalle.producto.nombre} x${detalle.cantidad}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={pedido.estado}
                      color={getEstadoColor(pedido.estado)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          {pedidos.length === 0 && (
            <Box textAlign="center" mt={4}>
              <Typography variant="h6" color="text.secondary">
                No hay pedidos aún
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog para crear espacio */}
      <Dialog open={openEspacioDialog} onClose={() => setOpenEspacioDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Espacio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del espacio"
            fullWidth
            variant="outlined"
            value={nuevoEspacio.nombre}
            onChange={(e) => setNuevoEspacio({ ...nuevoEspacio, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={nuevoEspacio.descripcion}
            onChange={(e) => setNuevoEspacio({ ...nuevoEspacio, descripcion: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEspacioDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrearEspacio} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear producto */}
      <Dialog open={openProductoDialog} onClose={() => setOpenProductoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Producto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del producto"
            fullWidth
            variant="outlined"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Precio"
                type="number"
                fullWidth
                variant="outlined"
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={nuevoProducto.stock}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Categoría"
            fullWidth
            variant="outlined"
            value={nuevoProducto.categoria}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL de imagen (opcional)"
            fullWidth
            variant="outlined"
            value={nuevoProducto.imagen}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductoDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrearProducto} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel; 