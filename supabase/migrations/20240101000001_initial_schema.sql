-- Schema para Railway + Auth0 (SaaS Gestión de Pedidos)
-- Sin Row Level Security (usaremos lógica de aplicación)

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin_local', 'empleado_local', 'empleado_fabrica');
CREATE TYPE order_status AS ENUM ('pendiente', 'en_preparacion', 'enviado', 'entregado');

-- Create tenants table (locales)
CREATE TABLE tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (usuarios de Auth0)
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL, -- ID de Auth0 (sub claim)
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'empleado_local',
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(10,2),
    price DECIMAL(10,2) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL DEFAULT 'pendiente',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_by VARCHAR(255) NOT NULL, -- Auth0 ID del usuario que creó el pedido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_profiles_auth0_id ON profiles(auth0_id);
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Función para actualizar updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funciones auxiliares para consultas comunes

-- Función para obtener pedidos de un tenant específico
CREATE OR REPLACE FUNCTION get_tenant_orders(tenant_uuid UUID)
RETURNS TABLE(
    id UUID,
    tenant_id UUID,
    status order_status,
    total_amount DECIMAL(10,2),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.tenant_id, o.status, o.total_amount, o.created_by, o.created_at, o.updated_at
    FROM orders o
    WHERE o.tenant_id = tenant_uuid
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener productos de un tenant específico
CREATE OR REPLACE FUNCTION get_tenant_products(tenant_uuid UUID)
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    weight DECIMAL(10,2),
    price DECIMAL(10,2),
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.weight, p.price, p.tenant_id, p.created_at, p.updated_at
    FROM products p
    WHERE p.tenant_id = tenant_uuid
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas rápidas
CREATE VIEW tenant_stats AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role IN ('admin_local', 'empleado_local')) as total_employees
FROM tenants t
LEFT JOIN products p ON t.id = p.tenant_id
LEFT JOIN orders o ON t.id = o.tenant_id
LEFT JOIN profiles pr ON t.id = pr.tenant_id
GROUP BY t.id, t.name;

-- Comentarios para documentación
COMMENT ON TABLE tenants IS 'Locales/tiendas en el sistema SaaS';
COMMENT ON TABLE profiles IS 'Usuarios autenticados con Auth0';
COMMENT ON TABLE products IS 'Catálogo de productos por local';
COMMENT ON TABLE orders IS 'Pedidos realizados por los locales';
COMMENT ON TABLE order_items IS 'Items individuales de cada pedido';
COMMENT ON COLUMN profiles.auth0_id IS 'ID único de Auth0 (sub claim del JWT)';
COMMENT ON COLUMN orders.created_by IS 'Auth0 ID del usuario que creó el pedido'; 