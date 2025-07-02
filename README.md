# 📱 PedidosApp - SaaS Gestión de Pedidos Multi-Tenant

Sistema SaaS multi-tenant para gestión de pedidos desde múltiples locales comerciales. Construido con Next.js, Express y PostgreSQL.

## 🚀 Características

- **Multi-tenant**: Cada local tiene su propio espacio independiente
- **Gestión de Pedidos**: Crea, edita y rastrea pedidos en tiempo real
- **Catálogo de Productos**: Administra inventario con precios y categorías
- **Gestión de Usuarios**: Roles de dueño y empleados con permisos
- **Pagos**: Integración con MercadoPago
- **Dashboard**: Métricas y reportes en tiempo real
- **Backoffice**: Panel administrativo para gestionar todos los negocios

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** con App Router
- **React 18** con Hooks
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **ShadCN UI** para componentes
- **Socket.io Client** para tiempo real

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **Socket.io** para actualizaciones en tiempo real
- **bcryptjs** para encriptación de contraseñas

### Integraciones
- **MercadoPago** para procesamiento de pagos
- **Railway** para deployment (configurado)

## 📋 Requisitos

- Node.js 18 o superior
- PostgreSQL 12 o superior
- npm o yarn

## ⚡ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd saas-gestion-pedidos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar PostgreSQL

Crea una base de datos en PostgreSQL:
```sql
CREATE DATABASE saas_pedidos;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE saas_pedidos TO postgres;
```

### 4. Inicializar la base de datos
```bash
# Ejecutar migraciones
npm run migrate

# Poblar datos iniciales (incluye admin por defecto)
npm run seed
```

### 5. Ejecutar en desarrollo
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend  
npm run dev

# O ambos juntos:
npm run dev:full
```

## 🔧 Configuración

### Variables de Base de Datos (Hardcodeadas en MVP)

El proyecto usa valores hardcodeados para facilitar el desarrollo inicial:

**Base de Datos:**
- Host: `localhost`
- Puerto: `5432`
- Database: `saas_pedidos`
- Usuario: `postgres` 
- Contraseña: `postgres`

**JWT Secret:** `mi-clave-secreta-super-segura-2024`

**MercadoPago (Sandbox):**
- Access Token: `TEST-1234567890-MERCADOPAGO-ACCESS-TOKEN`
- Public Key: `TEST-MERCADOPAGO-PUBLIC-KEY`

## 📱 Uso del Sistema

### Credenciales de Demo

**Administrador del Sistema:**
- Email: `admin@saas.com`
- Contraseña: `admin123`
- URL: `http://localhost:3000/auth/login` (seleccionar "Admin")

### Para Negocios

1. **Registrar Negocio:**
   - Ir a `http://localhost:3000/auth/register`
   - Completar formulario de registro
   - Se crea automáticamente un usuario "owner"

2. **Iniciar Sesión como Negocio:**
   - Ir a `http://localhost:3000/auth/login`
   - Seleccionar "Negocio"
   - Usar credenciales del registro

### Para Empleados

1. **El dueño debe crear usuarios desde el dashboard**
2. **Iniciar Sesión como Usuario:**
   - Ir a `http://localhost:3000/auth/login`
   - Seleccionar "Usuario" 
   - Ingresar email, contraseña y **ID del negocio**

## 🗂️ Estructura del Proyecto

```
saas-gestion-pedidos/
├── backend/                    # Servidor Express
│   ├── config/
│   │   └── database.js        # Configuración PostgreSQL
│   ├── middleware/
│   │   └── auth.js           # Autenticación JWT
│   ├── routes/               # Rutas de la API
│   │   ├── auth.js           # Autenticación
│   │   ├── business.js       # Gestión de negocios
│   │   ├── products.js       # Productos
│   │   ├── orders.js         # Pedidos
│   │   ├── users.js          # Usuarios
│   │   ├── admin.js          # Backoffice
│   │   └── payments.js       # Pagos MercadoPago
│   ├── scripts/
│   │   ├── migrate.js        # Migraciones
│   │   └── seed.js           # Datos iniciales
│   └── server.js             # Servidor principal
├── src/                      # Frontend Next.js
│   ├── app/                  # App Router
│   │   ├── auth/             # Páginas de autenticación
│   │   ├── dashboard/        # Dashboard del negocio
│   │   ├── admin/            # Backoffice administrativo
│   │   ├── globals.css       # Estilos globales
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Landing page
│   ├── components/           # Componentes React
│   │   └── ui/               # Componentes UI base
│   ├── lib/                  # Utilidades
│   ├── hooks/                # Hooks personalizados
│   └── types/                # Tipos TypeScript
└── package.json              # Dependencias
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **plans**: Planes de suscripción (Free, Básico, Pro)
- **businesses**: Negocios registrados (tenants)
- **users**: Usuarios de cada negocio
- **products**: Productos por negocio
- **orders**: Pedidos
- **order_items**: Items de cada pedido
- **payments**: Registros de pagos
- **admin_users**: Administradores del sistema

### Relaciones

- Cada negocio (`businesses`) pertenece a un plan (`plans`)
- Cada usuario (`users`) pertenece a un negocio (`businesses`)
- Cada producto (`products`) pertenece a un negocio (`businesses`)
- Cada pedido (`orders`) pertenece a un negocio y fue creado por un usuario
- Cada pago (`payments`) está asociado a un pedido y negocio

## 🔐 Autenticación y Seguridad

### Tipos de Usuario

1. **Admin**: Acceso completo al backoffice
2. **Business Owner**: Gestiona su negocio y empleados
3. **Employee**: Crea pedidos y ve productos

### JWT Tokens

Cada tipo de usuario recibe un token JWT con:
- `id`: ID del usuario/negocio
- `email`: Email 
- `type`: 'admin' | 'business' | 'user'
- `businessId`: ID del negocio (solo para usuarios)

## 📊 Funcionalidades por Rol

### Administrador del Sistema
- Dashboard con métricas globales
- Gestión de todos los negocios
- Ver todos los pedidos
- Cambiar estados de negocios
- Métricas de crecimiento y retención

### Dueño de Negocio
- Dashboard con métricas del negocio
- Gestión completa de productos (CRUD)
- Ver todos los pedidos del negocio
- Gestión de usuarios/empleados
- Configuración del negocio
- Procesar pagos con MercadoPago

### Empleado
- Ver productos del negocio
- Crear nuevos pedidos
- Actualizar estado de pedidos (excepto cancelar)
- Ver historial de pedidos

## 🚀 Deployment

### Preparado para Railway

El proyecto incluye:
- `Procfile` para Railway
- `railway.json` con configuración
- Scripts de migración automática

### Variables de Entorno para Producción

Cuando deploys en producción, configura:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu-clave-secreta-segura
MERCADOPAGO_ACCESS_TOKEN=tu-token-real
MERCADOPAGO_PUBLIC_KEY=tu-clave-publica-real
```

## 🧪 Testing

### Datos de Prueba

El sistema incluye:
- 3 planes predefinidos (Free, Básico, Pro)
- Usuario admin por defecto
- Estructura completa de base de datos

### Flujo de Prueba Recomendado

1. **Registrar un negocio** desde `/auth/register`
2. **Crear productos** desde el dashboard
3. **Agregar empleados** (opcional)
4. **Crear pedidos** y probar estados
5. **Probar pagos** con MercadoPago sandbox
6. **Ver métricas** en dashboard
7. **Acceder como admin** para ver backoffice

## 🛟 Soporte

### Scripts Útiles

```bash
# Desarrollo
npm run dev              # Solo frontend
npm run dev:server       # Solo backend  
npm run dev:full         # Ambos simultáneamente

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run seed            # Poblar datos iniciales

# Producción
npm run build           # Build del frontend
npm run start           # Iniciar en producción
```

### Troubleshooting

**Error de conexión a PostgreSQL:**
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `backend/config/database.js`
3. Verificar que la base de datos `saas_pedidos` existe

**Puerto ocupado:**
- Frontend: puerto 3000
- Backend: puerto 3001
- Cambiar en archivos correspondientes si es necesario

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

---

**¡Tu SaaS de gestión de pedidos está listo! 🎉**

Para cualquier consulta o problema, crear un issue en el repositorio. 