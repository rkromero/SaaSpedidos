import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const EspaciosList = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEspacios();
  }, []);

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/espacios`);
      setEspacios(response.data);
    } catch (err) {
      setError('Error al cargar los espacios');
      console.error('Error fetching espacios:', err);
    } finally {
      setLoading(false);
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Espacios Disponibles
      </Typography>
      
      <Grid container spacing={3}>
        {espacios.map((espacio) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {espacio.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {espacio.descripcion || 'Sin descripción'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Productos disponibles: {espacio.productos?.length || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate(`/espacio/${espacio.id}`)}
                  fullWidth
                >
                  Ver Productos
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {espacios.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No hay espacios disponibles
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EspaciosList; 