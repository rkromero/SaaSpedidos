import { useState, useCallback } from 'react';
import { authenticatedRequest } from '../utils/authInterceptor';
import { useToast } from '../contexts/ToastContext';

export const useAuthenticatedRequest = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const request = useCallback(async (url, options = {}, showError = true) => {
    setLoading(true);
    try {
      const response = await authenticatedRequest(url, options);
      return response.data;
    } catch (error) {
      console.error('Request error:', error);
      
      if (showError) {
        const message = error.response?.data?.message || 
                       error.message || 
                       'Error en la solicitud';
        showToast(message, 'error');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { request, loading };
};

// Hook específico para operaciones CRUD
export const useApi = () => {
  const { request, loading } = useAuthenticatedRequest();

  const get = useCallback((url) => request(url), [request]);
  
  const post = useCallback((url, data) => 
    request(url, { method: 'POST', data }), [request]);
  
  const put = useCallback((url, data) => 
    request(url, { method: 'PUT', data }), [request]);
  
  const del = useCallback((url) => 
    request(url, { method: 'DELETE' }), [request]);

  return { get, post, put, delete: del, loading };
}; 