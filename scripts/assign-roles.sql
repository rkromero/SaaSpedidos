-- Script para asignar roles a usuarios después de crearlos en Auth0
-- Ejecutar este script en la base de datos Railway después de crear los usuarios en Auth0
-- IMPORTANTE: Necesitas obtener los auth0_id reales del JWT o Auth0 Dashboard

-- Primero, verificar que existan los tenants
SELECT id, name FROM tenants;

-- Asignar rol de Super Admin (reemplaza 'auth0|...' con el ID real)
UPDATE profiles SET 
  role = 'super_admin', 
  tenant_id = NULL,
  name = 'Admin SaaS'
WHERE auth0_id = 'auth0|123456789abcdef' OR email = 'admin@saas.com';

-- Asignar rol de Admin Local para Panadería El Sol (reemplaza con ID real)
UPDATE profiles SET 
  role = 'admin_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Panadería El Sol' LIMIT 1),
  name = 'Admin Panadería'
WHERE auth0_id = 'auth0|234567890bcdefgh' OR email = 'admin1@panaderia.com';

-- Asignar rol de Empleado Local para Panadería El Sol  
UPDATE profiles SET 
  role = 'empleado_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Panadería El Sol' LIMIT 1),
  name = 'Empleado Panadería'
WHERE email = 'empleado1@panaderia.com';

-- Asignar rol de Admin Local para Pastelería Luna
UPDATE profiles SET 
  role = 'admin_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Pastelería Luna' LIMIT 1),
  name = 'Admin Pastelería'
WHERE email = 'admin2@pasteleria.com';

-- Asignar rol de Empleado Local para Pastelería Luna
UPDATE profiles SET 
  role = 'empleado_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Pastelería Luna' LIMIT 1),
  name = 'Empleado Pastelería'
WHERE email = 'empleado2@pasteleria.com';

-- Asignar rol de Empleado Fábrica (ve todos los pedidos)
UPDATE profiles SET 
  role = 'empleado_fabrica', 
  tenant_id = NULL,
  name = 'Empleado Fábrica'
WHERE email = 'fabrica@empresa.com';

-- Verificar que los roles se asignaron correctamente
SELECT 
  p.email, 
  p.name, 
  p.role, 
  t.name as tenant_name 
FROM profiles p
LEFT JOIN tenants t ON p.tenant_id = t.id
ORDER BY p.role, p.email; 