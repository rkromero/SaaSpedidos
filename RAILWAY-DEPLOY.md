# 🚂 Deploy en Railway - SaaS Gestión de Pedidos

## 🎯 Instrucciones de Deploy

### **1. Crear Proyecto en Railway**

1. Ve a **https://railway.app**
2. Login con tu cuenta de GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecciona **`SaaSpedidos`**

### **2. Configurar Base de Datos (Ya está hecha)**

✅ **PostgreSQL ya configurado**
- Database URL: `postgresql://postgres:aCNtdzyznZjrsyuCXqYZNbTTRpQziWWx@shinkansen.proxy.rlwy.net:33725/railway`

### **3. Crear Servicios Separados**

#### **Frontend Service**
1. En Railway, click **"+ New"** → **"Empty Service"**
2. **Nombre**: `frontend`
3. **Source**: Conectar al mismo repo de GitHub
4. **Build Command**: `npm run build`
5. **Start Command**: `npm run start`

#### **Backend Service**  
1. En Railway, click **"+ New"** → **"Empty Service"**
2. **Nombre**: `backend`
3. **Source**: Conectar al mismo repo de GitHub
4. **Build Command**: `npm install`
5. **Start Command**: `npm run start:server`

### **4. Variables de Entorno**

#### **Frontend Service:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[tu-backend-service].railway.app
```

#### **Backend Service:**
```
DATABASE_URL=postgresql://postgres:aCNtdzyznZjrsyuCXqYZNbTTRpQziWWx@shinkansen.proxy.rlwy.net:33725/railway
JWT_SECRET=mi-clave-secreta-super-segura-2024
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

### **5. Actualizar URLs**

Después del primer deploy:

1. **Copia la URL del backend**: `https://[backend-service].railway.app`
2. **Actualiza** `NEXT_PUBLIC_API_URL` en el frontend
3. **Redeploy** frontend

### **6. Verificar Deploy**

✅ **Frontend**: https://[frontend-service].railway.app  
✅ **Backend API**: https://[backend-service].railway.app/api/health  
✅ **Base de datos**: Ya migrada y poblada  

### **7. Acceso**

- **Landing Page**: Frontend URL
- **Login**: Frontend URL + `/auth/login`
- **Admin**: admin@saas.com / admin123

## 🔧 **Comandos Útiles**

```bash
# Deploy local para testing
npm run build
npm run start

# Migraciones (se ejecutan automáticamente)
npm run railway:migrate
```

## 📝 **Notas**

- ✅ Base de datos ya configurada en Railway
- ✅ Migraciones se ejecutan automáticamente en build
- ✅ Configuración multi-tenant lista
- ✅ Socket.io configurado para Railway
- ✅ CORS configurado para producción

## 🆘 **Troubleshooting**

Si hay errores:
1. Verificar variables de entorno
2. Verificar que ambos servicios estén corriendo
3. Verificar URL del backend en frontend
4. Verificar logs en Railway dashboard 