export interface User {
  id: number
  name: string
  email: string
  role: 'owner' | 'employee'
  business_id?: number
  business_name?: string
  plan_name?: string
  is_active: boolean
  created_at: string
}

export interface Business {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  plan_id: number
  plan_name?: string
  plan_price?: number
  max_users?: number
  max_products?: number
  max_orders_per_month?: number
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  usage?: {
    current_users: number
    current_products: number
    orders_this_month: number
  }
}

export interface Plan {
  id: number
  name: string
  price: number
  max_users: number
  max_products: number
  max_orders_per_month: number
  features: Record<string, any>
  created_at: string
}

export interface Product {
  id: number
  business_id: number
  name: string
  description?: string
  price: number
  category?: string
  is_active: boolean
  created_at: string
}

export interface Order {
  id: number
  business_id: number
  user_id: number
  customer_name: string
  customer_phone?: string
  total_amount: number
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'paid'
  notes?: string
  created_at: string
  created_by?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Payment {
  id: number
  business_id: number
  order_id: number
  amount: number
  payment_method: string
  payment_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  external_payment_id?: string
  created_at: string
  order?: Order
}

export interface DashboardStats {
  total_products: number
  total_users: number
  total_orders: number
  total_revenue: number
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  processing_orders: number
  ready_orders: number
  completed_orders: number
  total_revenue: number
}

export interface AdminStats {
  total_businesses: number
  total_users: number
  total_orders: number
  total_revenue: number
}

export interface APIResponse<T = any> {
  message?: string
  data?: T
  error?: string
}

export interface LoginResponse {
  message: string
  token: string
  business?: Business
  user?: User
  admin?: User
}

export interface AuthContextType {
  user: User | null
  business: Business | null
  token: string | null
  login: (email: string, password: string, type?: 'business' | 'user' | 'admin', businessId?: number) => Promise<void>
  logout: () => void
  loading: boolean
}

export type OrderStatus = Order['status']
export type UserRole = User['role']
export type BusinessStatus = Business['status'] 