import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

export const useAuthenticatedRequest = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';
      const token = localStorage.getItem('token');
      
      const config = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      };

      const response = await axios(`${baseURL}${url}`, config);
      return response.data;
    } catch (error) {
      console.error('Request error:', error);
      const message = error.response?.data?.message || 'Error en la solicitud';
      showToast(message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { request, loading };
};

// Hook simple para operaciones CRUD
export const useApi = () => {
  const { request, loading } = useAuthenticatedRequest();

  const get = useCallback((url) => request(url), [request]);
  const post = useCallback((url, data) => request(url, { method: 'POST', data }), [request]);
  const put = useCallback((url, data) => request(url, { method: 'PUT', data }), [request]);
  const del = useCallback((url) => request(url, { method: 'DELETE' }), [request]);

  return { get, post, put, delete: del, loading };
}; 