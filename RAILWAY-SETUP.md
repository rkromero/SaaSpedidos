# 🚂 Setup Railway + Auth0

Sistema SaaS de Gestión de Pedidos usando **Railway** (hosting + PostgreSQL) y **Auth0** (autenticación).

## 📋 Pre-requisitos

1. ✅ Cuenta en [Railway](https://railway.app)
2. ✅ Cuenta en [Auth0](https://auth0.com) 
3. ✅ Node.js 18+ instalado
4. ✅ Git instalado

## 🚀 Setup paso a paso

### 1. Configurar Auth0

1. **Crear cuenta y aplicación**
   - Ve a [Auth0.com](https://auth0.com) → Crear cuenta gratuita
   - Dashboard → Applications → Create Application
   - Nombre: "SaaS Gestión Pedidos"
   - Tipo: **Regular Web Application**

2. **Configurar URLs de la aplicación**
   En Settings de tu aplicación Auth0:
   ```
   Allowed Callback URLs:
   http://localhost:3000/api/auth/callback
   
   Allowed Logout URLs:
   http://localhost:3000
   
   Allowed Web Origins:
   http://localhost:3000
   ```

3. **Guardar credenciales**
   - Domain: `tu-tenant.auth0.com`
   - Client ID: `tu_client_id`
   - Client Secret: `tu_client_secret`

### 2. Configurar Railway

1. **Crear proyecto**
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Crear proyecto
   railway init
   ```

2. **Agregar PostgreSQL**
   - Railway Dashboard → Add Service → Database → PostgreSQL
   - Copiar la `DATABASE_URL` generada

### 3. Variables de entorno

```bash
# Copiar template
cp env.template .env.local
```

Editar `.env.local`:
```env
# Railway Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# Auth0 (reemplazar con valores reales)
AUTH0_SECRET=tu_secret_muy_largo_minimo_32_caracteres
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://tu-tenant.auth0.com
AUTH0_CLIENT_ID=tu_client_id_auth0
AUTH0_CLIENT_SECRET=tu_client_secret_auth0

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

### 4. Setup base de datos

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run db:migrate

# Insertar datos de prueba
npm run db:seed

# O todo junto
npm run db:setup
```

### 5. Crear usuarios de prueba

1. **En Auth0 Dashboard** → User Management → Users → Create User:

| Email | Contraseña | Para rol |
|-------|-----------|----------|
| `admin@saas.com` | `Test123!` | super_admin |
| `admin1@panaderia.com` | `Test123!` | admin_local |
| `empleado1@panaderia.com` | `Test123!` | empleado_local |
| `fabrica@empresa.com` | `Test123!` | empleado_fabrica |

2. **Obtener Auth0 IDs**
   Inicia sesión con cada usuario y ve a la app en `/dashboard`. En el JWT verás el `sub` (Auth0 ID).

3. **Asignar roles en Railway DB**
   Conecta a la base de datos Railway y ejecuta:
   ```sql
   -- Reemplaza los auth0_id con los reales
   UPDATE profiles SET 
     role = 'super_admin', 
     tenant_id = NULL,
     name = 'Admin SaaS'
   WHERE auth0_id = 'auth0|66f...' OR email = 'admin@saas.com';
   
   -- Continúa con los demás usuarios...
   ```

### 6. Ejecutar aplicación

```bash
npm run dev
```

## 🏗️ Arquitectura final

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  PostgreSQL DB  │    │     Auth0       │
│   (Railway)     │◄──►│   (Railway)     │    │                 │
│                 │    │                 │    │ - Authentication│
│ - Frontend      │    │ - Profiles      │    │ - User Sessions │
│ - API Routes    │    │ - Orders        │    │ - JWT Tokens    │
│ - Multi-tenant  │    │ - Products      │    │ - Social Login  │
│ - Dashboard     │    │ - Tenants       │    │ - User Mgmt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Funcionalidades implementadas

- ✅ **Multi-tenancy** con lógica de aplicación
- ✅ **4 roles** con permisos específicos  
- ✅ **Autenticación segura** con Auth0
- ✅ **Auto-creación** de perfiles de usuario
- ✅ **Base de datos optimizada** con índices
- ✅ **Middleware** de protección de rutas
- ✅ **APIs REST** para todas las operaciones

## 🔧 Comandos disponibles

```bash
# Desarrollo
npm run dev                # Iniciar en modo desarrollo
npm run build             # Build para producción
npm run start             # Iniciar modo producción

# Base de datos
npm run db:migrate        # Ejecutar migraciones SQL
npm run db:seed          # Insertar datos de prueba
npm run db:setup         # Migrar + Seed

# Railway
railway login            # Login en Railway
railway status           # Ver estado del proyecto
railway logs             # Ver logs de la aplicación
railway variables        # Ver variables de entorno
railway up              # Deploy manual
```

## 🎯 URLs importantes

- **App local**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Dashboard**: http://localhost:3000/dashboard  
- **Admin panel**: http://localhost:3000/admin
- **Auth0 Dashboard**: https://manage.auth0.com
- **Railway Dashboard**: https://railway.app/dashboard

## 🔍 Testing del sistema

1. **Login como Super Admin** (`admin@saas.com`)
   - Debe ver panel de administración global
   - Acceso a todos los tenants y estadísticas

2. **Login como Admin Local** (`admin1@panaderia.com`)
   - Solo ve datos de "Panadería El Sol"
   - Puede gestionar productos y pedidos de su local

3. **Login como Empleado Local** (`empleado1@panaderia.com`)
   - Solo ve pedidos de su local
   - Puede crear nuevos pedidos

4. **Login como Empleado Fábrica** (`fabrica@empresa.com`)
   - Ve pedidos de TODOS los locales
   - Puede cambiar estados de pedidos

## 🚀 Deploy en Railway

1. **Conectar repositorio**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   
   # En Railway Dashboard
   railway link [project-id]
   ```

2. **Configurar variables de producción**
   ```bash
   railway variables set AUTH0_SECRET=tu_secret_produccion
   railway variables set AUTH0_BASE_URL=https://tu-app.railway.app
   railway variables set AUTH0_ISSUER_BASE_URL=https://tu-tenant.auth0.com
   railway variables set AUTH0_CLIENT_ID=tu_client_id
   railway variables set AUTH0_CLIENT_SECRET=tu_client_secret
   railway variables set NODE_ENV=production
   ```

3. **Actualizar Auth0 para producción**
   En Auth0 Dashboard → Applications → Settings:
   ```
   Allowed Callback URLs:
   https://tu-app.railway.app/api/auth/callback
   
   Allowed Logout URLs:
   https://tu-app.railway.app
   
   Allowed Web Origins:
   https://tu-app.railway.app
   ```

## ❗ Troubleshooting

### Error: "NEXTAUTH_SECRET"
- Genera un string aleatorio de 32+ caracteres para `AUTH0_SECRET`

### Error: "Cannot connect to database"
- Verifica `DATABASE_URL` en Railway
- Confirma que la base de datos está activa

### Error: "Unauthorized" en Auth0
- Verifica las URLs en Auth0 Dashboard
- Confirma que las variables de Auth0 son correctas

### Error: "User profile not found"
- El usuario debe loguearse al menos una vez para crear el perfil
- Verifica que el afterCallback funciona correctamente

## 🎉 ¡Listo!

Tu SaaS está funcionando con:
- 🔐 **Autenticación segura** (Auth0)
- 💾 **Base de datos optimizada** (Railway PostgreSQL)  
- 🚀 **Hosting escalable** (Railway)
- 👥 **Multi-tenancy** funcional
- 📊 **Dashboard por roles**

**Siguiente paso**: Desarrollar las funcionalidades específicas de cada módulo. 