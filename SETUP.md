# 🚀 Guía Rápida de Setup

## Pasos para poner en funcionamiento el SaaS

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Guarda las credenciales

2. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Completa en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio
   NEXT_PUBLIC_SUPABASE_PROJECT_ID=tu_project_id
   ```

3. **Ejecutar migración SQL**
   - Abre Supabase Dashboard > SQL Editor
   - Copia y ejecuta todo el contenido de `supabase/migrations/20240101000001_initial_schema.sql`

### 3. Seed de datos (opcional)
```bash
npm run db:seed
```

### 4. Ejecutar aplicación
```bash
npm run dev
```

### 5. Crear usuarios de prueba

En Supabase Dashboard > Authentication > Users, crea:

| Email | Contraseña | Nota |
|-------|-----------|------|
| `admin@saas.com` | `password123` | Super Admin |
| `admin1@panaderia.com` | `password123` | Admin Local |
| `empleado1@panaderia.com` | `password123` | Empleado Local |
| `fabrica@empresa.com` | `password123` | Empleado Fábrica |

### 6. Configurar roles de usuarios

Después de crear los usuarios, ejecuta en SQL Editor:

```sql
-- Actualizar roles de los usuarios de prueba
UPDATE profiles SET 
  role = 'super_admin', 
  tenant_id = NULL 
WHERE email = 'admin@saas.com';

UPDATE profiles SET 
  role = 'admin_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Panadería El Sol' LIMIT 1)
WHERE email = 'admin1@panaderia.com';

UPDATE profiles SET 
  role = 'empleado_local', 
  tenant_id = (SELECT id FROM tenants WHERE name = 'Panadería El Sol' LIMIT 1)
WHERE email = 'empleado1@panaderia.com';

UPDATE profiles SET 
  role = 'empleado_fabrica', 
  tenant_id = NULL 
WHERE email = 'fabrica@empresa.com';
```

### 7. ¡Listo! 🎉

Ahora puedes:
- Iniciar sesión con cualquiera de los usuarios
- Ver diferentes dashboards según el rol
- Crear pedidos como empleado de local  
- Gestionar productos como admin de local
- Ver todos los pedidos como empleado de fábrica
- Acceder al backoffice como super admin

## 📱 URLs de acceso

- **Aplicación**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Dashboard**: http://localhost:3000/dashboard
- **Admin**: http://localhost:3000/admin (solo super_admin)

## 🛠️ Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Iniciar producción
npm run start

# Linting
npm run lint

# Generar tipos de Supabase
npm run db:generate
```

## ❓ Troubleshooting

### Error: "Cannot find module"
- Asegúrate de haber ejecutado `npm install`

### Error de conexión a Supabase
- Verifica las variables de entorno en `.env.local`
- Confirma que el proyecto de Supabase esté activo

### Error de permisos (RLS)
- Verifica que las migraciones SQL se ejecutaron correctamente
- Confirma que los usuarios tienen roles asignados en la tabla `profiles`

### Página en blanco
- Revisa la consola del navegador para errores
- Verifica que la migración de base de datos se completó 