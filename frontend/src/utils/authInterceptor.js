import axios from 'axios';

// Configurar interceptor para manejar errores de autenticación
export const setupAuthInterceptor = (onLogout) => {
  // Interceptor para requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token inválido o expirado
        console.log('Token inválido, redirigiendo al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) {
          onLogout();
        } else {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Función para verificar si el token es válido


// Función para obtener headers de autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Función para hacer requests autenticados
export const authenticatedRequest = async (url, options = {}) => {
  const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
  const token = localStorage.getItem('token');
  
  if (!token || !isTokenValid()) {
    throw new Error('No valid token available');
  }
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
  
  return axios(`${baseURL}${url}`, config);
}; 