import axios from 'axios';

// Función simple para hacer requests autenticados
export const authenticatedRequest = async (url, options = {}) => {
  const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  };
  
  return axios(`${baseURL}${url}`, config);
};

// Función simple para verificar token
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Función simple para logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Setup básico sin interceptors complejos
export const setupAuthInterceptor = () => {
  // Interceptor simple solo para logout en 401
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
}; 