# 🚀 Instrucciones de Setup - PedidosApp

## ⚡ Setup Rápido (5 minutos)

### 1. Preparar PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose. Luego crea la base de datos:

```sql
-- Conectar a PostgreSQL como superuser
psql -U postgres

-- Crear base de datos
CREATE DATABASE saas_pedidos;

-- Salir de psql
\q
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Inicializar base de datos

```bash
# Crear tablas
npm run migrate

# Insertar datos iniciales
npm run seed
```

### 4. Ejecutar aplicación

```bash
# Opción 1: Ambos servicios juntos
npm run dev:full

# Opción 2: Por separado
# Terminal 1:
npm run dev:server

# Terminal 2:
npm run dev
```

### 5. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 🧪 Probar el Sistema

### Admin del Sistema
1. Ir a: http://localhost:3000/auth/login
2. Seleccionar "Admin"
3. Email: `admin@saas.com`
4. Contraseña: `admin123`

### Registrar Negocio
1. Ir a: http://localhost:3000/auth/register
2. Completar formulario
3. Se auto-crea usuario "owner"

### Demo Completo
1. **Registra un negocio** nuevo
2. **Crea productos** desde el dashboard
3. **Agrega empleados** (opcional)
4. **Crea pedidos** de prueba
5. **Cambia estados** de pedidos
6. **Ve métricas** en tiempo real

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
Editar `backend/server.js`:
```javascript
const PORT = 3002; // Cambiar de 3001 a 3002
```

También actualizar en `next.config.js`:
```javascript
destination: 'http://localhost:3002/api/:path*',
```

### Cambiar Configuración de DB
Editar `backend/config/database.js`:
```javascript
const pool = new Pool({
  host: 'tu-host',
  port: 5432,
  database: 'tu-database',
  user: 'tu-usuario',
  password: 'tu-contraseña',
});
```

## 🛠️ Troubleshooting

### Error: "relation does not exist"
```bash
# Ejecutar migraciones nuevamente
npm run migrate
```

### Error: "connect ECONNREFUSED"
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `backend/config/database.js`

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto de Next.js
npx next dev -p 3002
```

### Error: "Cannot resolve module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📊 Estructura de Datos

### Planes Incluidos
- **Free**: 2 usuarios, 10 productos, 50 pedidos/mes
- **Básico**: 5 usuarios, 50 productos, 200 pedidos/mes  
- **Pro**: 15 usuarios, 200 productos, 1000 pedidos/mes

### Usuario Admin por Defecto
- Email: `admin@saas.com`
- Contraseña: `admin123`
- Acceso: Panel administrativo completo

## 🔄 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend Next.js
npm run dev:server       # Backend Express
npm run dev:full         # Ambos simultáneamente

# Base de datos
npm run migrate          # Crear/actualizar tablas
npm run seed            # Insertar datos iniciales

# Producción
npm run build           # Build para producción
npm run start           # Servidor en producción
```

## 📝 Siguiente Pasos

1. **Personalizar la landing page** con tu marca
2. **Configurar MercadoPago** real para pagos
3. **Agregar más campos** a productos/pedidos según tu negocio
4. **Implementar notificaciones** por email
5. **Agregar más reportes** y métricas
6. **Configurar backup** de base de datos

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar logs** en consola del navegador y terminal
2. **Revisar conexión** a PostgreSQL
3. **Confirmar que los puertos** 3000 y 3001 estén libres
4. **Reinstalar dependencias** si es necesario

¡Tu SaaS está listo para usar! 🎉 