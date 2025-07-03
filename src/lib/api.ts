// Configuración de API para conectar con Railway
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Headers por defecto
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Función para obtener el token del localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Función para crear headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Función genérica para hacer requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Funciones específicas para cada endpoint
export const api = {
  // Auth endpoints
  login: (credentials: { email: string; password: string; type: 'business' | 'user' | 'admin' }) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string; 
    address?: string; 
    plan_id?: number 
  }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Business endpoints
  getDashboard: () => apiRequest('/api/business/dashboard'),
  
  // Products endpoints
  getProducts: () => apiRequest('/api/products'),
  
  createProduct: (product: {
    name: string;
    description?: string;
    price: number;
    category?: string;
  }) =>
    apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: number, product: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    is_active: boolean;
  }>) =>
    apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  deleteProduct: (id: number) =>
    apiRequest(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders endpoints
  getOrders: () => apiRequest('/api/orders'),
  
  createOrder: (order: {
    customer_name: string;
    customer_phone?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
    }>;
    notes?: string;
  }) =>
    apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  updateOrderStatus: (id: number, status: string) =>
    apiRequest(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Users endpoints
  getUsers: () => apiRequest('/api/users'),
  
  createUser: (user: {
    name: string;
    email: string;
    password: string;
    role?: 'owner' | 'employee';
  }) =>
    apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  // Admin endpoints
  getStats: () => apiRequest('/api/admin/stats'),

  // Health check
  healthCheck: () => apiRequest('/api/health'),
};

// Función para guardar el token de autenticación
export const saveAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Función para remover el token de autenticación
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// Exportar la URL base para uso directo si es necesario
export { API_BASE_URL };

export default api; 