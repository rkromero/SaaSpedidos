# Sistema de Pedidos SaaS

Un sistema completo para gestionar pedidos donde puedes crear espacios, cargar productos y recibir pedidos de usuarios.

## 🚀 Características

- **Espacios/Tiendas**: Crea múltiples espacios para diferentes negocios
- **Gestión de Productos**: Agrega productos con precios, stock y categorías
- **Carrito de Compras**: Los usuarios pueden agregar productos al carrito
- **Sistema de Pedidos**: Procesamiento completo de pedidos
- **Panel de Administración**: Gestiona espacios, productos y ve pedidos
- **Interfaz Moderna**: Diseño responsive con Material-UI

## 🛠️ Tecnologías

- **Frontend**: React + Material-UI
- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL (Railway)
- **ORM**: Prisma

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta en Railway para la base de datos PostgreSQL

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd SaaSPedidos
```

### 2. Configurar la base de datos

1. Ve a [Railway](https://railway.app/) y crea una cuenta
2. Crea un nuevo proyecto
3. Agrega una base de datos PostgreSQL
4. Copia la URL de conexión

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
PORT=3001
```

### 4. Instalar dependencias del backend
```bash
npm install
```

### 5. Configurar la base de datos
```bash
npx prisma generate
npx prisma db push
```

### 6. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

## 🚀 Ejecutar el proyecto

### Backend
```bash
# Desde la raíz del proyecto
npm start
```

### Frontend
```bash
# Desde la carpeta frontend
cd frontend
npm start
```

El backend estará disponible en `http://localhost:3001`
El frontend estará disponible en `http://localhost:3000`

## 📖 Uso del Sistema

### Para Administradores

1. **Crear Espacios**: Ve al panel de administración y crea espacios para tus negocios
2. **Agregar Productos**: Selecciona un espacio y agrega productos con precios y stock
3. **Ver Pedidos**: Revisa todos los pedidos recibidos en tiempo real

### Para Usuarios

1. **Ver Espacios**: Navega por los espacios disponibles
2. **Seleccionar Productos**: Agrega productos al carrito
3. **Realizar Pedido**: Completa tus datos y confirma el pedido

## 🗄️ Estructura de la Base de Datos

### Modelos principales:

- **Espacio**: Representa una tienda o negocio
- **Producto**: Productos disponibles en cada espacio
- **Usuario**: Clientes que realizan pedidos
- **Pedido**: Pedidos realizados por los usuarios
- **DetallePedido**: Detalles de cada pedido (productos y cantidades)

## 🔌 API Endpoints

### Espacios
- `GET /api/espacios` - Obtener todos los espacios
- `POST /api/espacios` - Crear nuevo espacio

### Productos
- `GET /api/productos/:espacioId` - Obtener productos de un espacio
- `POST /api/productos` - Crear nuevo producto

### Usuarios
- `POST /api/usuarios` - Crear nuevo usuario

### Pedidos
- `POST /api/pedidos` - Crear nuevo pedido
- `GET /api/pedidos/:espacioId` - Obtener pedidos de un espacio
- `PATCH /api/pedidos/:id/estado` - Actualizar estado del pedido

## 🎨 Personalización

### Temas y Colores
Puedes personalizar los colores editando el tema en `frontend/src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Color principal
    },
    secondary: {
      main: '#dc004e', // Color secundario
    },
  },
});
```

### Configuración de la API
Modifica la URL base de la API en los componentes del frontend:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 🚀 Despliegue

### Backend en Railway
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectará automáticamente que es una aplicación Node.js

### Frontend en Vercel/Netlify
1. Conecta tu repositorio a Vercel o Netlify
2. Configura el directorio de build como `frontend`
3. Actualiza la URL de la API en el frontend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa los issues existentes
2. Crea un nuevo issue con detalles del problema
3. Incluye logs de error y pasos para reproducir el problema

## 🔄 Próximas Características

- [ ] Notificaciones por email
- [ ] Sistema de autenticación
- [ ] Dashboard con estadísticas
- [ ] Gestión de inventario automática
- [ ] Múltiples métodos de pago
- [ ] App móvil 