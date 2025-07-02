export interface Database {
  profiles: {
    id: string
    auth0_id: string
    email: string
    name: string | null
    role: 'super_admin' | 'admin_local' | 'empleado_local' | 'empleado_fabrica'
    tenant_id: string | null
    created_at: string
    updated_at: string
  }
  tenants: {
    id: string
    name: string
    address: string | null
    phone: string | null
    created_at: string
    updated_at: string
  }
  products: {
    id: string
    name: string
    weight: number | null
    price: number
    tenant_id: string
    created_at: string
    updated_at: string
  }
  orders: {
    id: string
    tenant_id: string
    status: 'pendiente' | 'en_preparacion' | 'enviado' | 'entregado'
    total_amount: number
    created_by: string
    created_at: string
    updated_at: string
  }
  order_items: {
    id: string
    order_id: string
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
    created_at: string
  }
}

export type UserRole = 'super_admin' | 'admin_local' | 'empleado_local' | 'empleado_fabrica'
export type OrderStatus = 'pendiente' | 'en_preparacion' | 'enviado' | 'entregado'

export interface Profile {
  id: string
  auth0_id: string
  email: string
  name: string | null
  role: UserRole
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  name: string
  address: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  weight: number | null
  price: number
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  tenant_id: string
  status: OrderStatus
  total_amount: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
} 