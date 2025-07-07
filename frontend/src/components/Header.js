import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, IconButton } from '@mui/material';
import { ShoppingCart, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Sistema de Pedidos
        </Typography>
        
        <Button 
          color="inherit" 
          onClick={() => navigate('/')}
        >
          Espacios
        </Button>
        
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/carrito')}
        >
          <Badge badgeContent={0} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>
        
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/admin')}
        >
          <AdminPanelSettings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 