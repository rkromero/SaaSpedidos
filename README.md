# 🏭 SaaS Gestión de Pedidos

Sistema SaaS multi-tenant para gestión de pedidos entre múltiples locales y una fábrica productora.

## 🌟 Características

- **Multi-tenant**: Cada local solo accede a su información
- **Gestión de roles**: 4 tipos de usuarios con permisos específicos
- **Tiempo real**: Actualizaciones en vivo del estado de pedidos
- **Dashboard intuitivo**: Interfaz moderna con estadísticas
- **Escalable**: Arquitectura pensada para crecer como SaaS

## 👥 Roles del Sistema

### 🏢 Super Admin (Dueño del SaaS)
- Ve todos los locales, usuarios y pedidos
- Estadísticas globales del sistema
- Gestión de tenants

### 🏪 Admin Local (Dueño del local)
- Ve pedidos de su local
- Gestiona productos de su catálogo
- Administra empleados de su local

### 👤 Empleado Local
- Carga nuevos pedidos
- Ve pedidos de su local

### 🏭 Empleado Fábrica
- Ve todos los pedidos de todos los locales
- Actualiza estado de pedidos (en preparación, enviado, entregado)

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **ORM**: Supabase Client
- **Hosting**: Vercel (Frontend) + Supabase (Backend/DB)

## 🚀 Instalación y Setup

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd saas-gestion-pedidos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia las credenciales del proyecto
3. Crea el archivo `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Completa las variables de entorno:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SUPABASE_PROJECT_ID=tu_project_id
```

### 4. Inicializar Supabase localmente (opcional)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar
supabase start
```

### 5. Ejecutar migraciones
```bash
# Si usas Supabase localmente
supabase db reset

# Si usas Supabase cloud, ejecuta manualmente el SQL en:
# Dashboard > SQL Editor > supabase/migrations/20240101000001_initial_schema.sql
```

### 6. Ejecutar seeding (datos de prueba)
```bash
npm run db:seed
```

### 7. Ejecutar el proyecto
```bash
npm run dev
```

## 🗃️ Estructura de la Base de Datos

### Tablas Principales

#### `tenants` (Locales)
- `id`: UUID único del local
- `name`: Nombre del local
- `address`: Dirección
- `phone`: Teléfono

#### `profiles` (Usuarios)
- `id`: UUID del usuario (referencia a auth.users)
- `email`: Email del usuario
- `name`: Nombre completo
- `role`: Rol del usuario
- `tenant_id`: Local al que pertenece (null para super_admin y empleado_fabrica)

#### `products` (Productos)
- `id`: UUID del producto
- `name`: Nombre del producto
- `weight`: Peso en kg (opcional)
- `price`: Precio unitario
- `tenant_id`: Local propietario del producto

#### `orders` (Pedidos)
- `id`: UUID del pedido
- `tenant_id`: Local que hizo el pedido
- `status`: Estado del pedido
- `total_amount`: Monto total
- `created_by`: Usuario que creó el pedido

#### `order_items` (Items del pedido)
- `id`: UUID del item
- `order_id`: Pedido al que pertenece
- `product_id`: Producto solicitado
- `quantity`: Cantidad
- `unit_price`: Precio unitario
- `total_price`: Precio total del item

## 🔐 Seguridad Multi-Tenant

El sistema implementa **Row Level Security (RLS)** en PostgreSQL para garantizar que:

- Cada local solo ve sus propios datos
- Los empleados de fábrica ven todos los pedidos
- Los super admins tienen acceso completo
- Las políticas se aplican automáticamente en todas las consultas

## 📊 Funcionalidades por Rol

### Dashboard Super Admin
- Estadísticas globales (pedidos totales, locales activos, ingresos)
- Lista de todos los locales
- Gestión de usuarios
- Métricas de crecimiento

### Dashboard Local
- Estadísticas del local (pedidos, productos, ventas)
- Gestión de productos
- Creación y seguimiento de pedidos
- Lista de empleados

### Dashboard Fábrica
- Vista de todos los pedidos por local
- Actualización de estados de pedido
- Métricas de producción
- Historial de envíos

## 🚀 Despliegue en Producción

### Vercel (Frontend)
```bash
# Conectar con GitHub y desplegar automáticamente
# Configurar variables de entorno en Vercel Dashboard
```

### Supabase (Backend)
- Base de datos PostgreSQL managed
- Autenticación automática
- APIs REST generadas automáticamente
- Real-time subscriptions

## 🧪 Usuarios de Prueba

Después del seeding, puedes crear estos usuarios en Supabase Dashboard:

| Email | Contraseña | Rol | Local |
|-------|-----------|-----|-------|
| `admin@saas.com` | `password123` | super_admin | - |
| `admin1@panaderia.com` | `password123` | admin_local | Panadería El Sol |
| `empleado1@panaderia.com` | `password123` | empleado_local | Panadería El Sol |
| `admin2@pasteleria.com` | `password123` | admin_local | Pastelería Luna |
| `empleado2@pasteleria.com` | `password123` | empleado_local | Pastelería Luna |
| `fabrica@empresa.com` | `password123` | empleado_fabrica | - |

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── admin/             # Panel de super admin
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/                # Componentes ShadCN UI
│   ├── dashboard/         # Componentes del dashboard
│   ├── admin/             # Componentes del admin
│   ├── orders/            # Componentes de pedidos
│   └── products/          # Componentes de productos
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
└── types/                 # Tipos TypeScript

supabase/
├── config.toml            # Configuración de Supabase
├── migrations/            # Migraciones SQL
└── seed.sql               # Datos de prueba

scripts/
└── seed.ts                # Script de seeding
```

## 🔄 Próximas Funcionalidades

- [ ] Sistema de notificaciones (email/SMS)
- [ ] Integración de pagos (Stripe)
- [ ] Reportes avanzados con gráficos
- [ ] App móvil (React Native)
- [ ] API webhooks para integraciones
- [ ] Chat en tiempo real
- [ ] Gestión de inventario
- [ ] Sistema de facturación

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

¿Necesitas ayuda? Abre un [issue](../../issues) o contacta al equipo de desarrollo.

---

**¡Construido con ❤️ para escalabilidad y rendimiento!** 