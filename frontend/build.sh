#!/bin/bash

# Script de build para Railway
echo "🚀 Iniciando build para Railway..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf build

# Ejecutar build
echo "🔨 Ejecutando build..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "build" ]; then
    echo "❌ Error: El directorio build no se creó"
    exit 1
fi

# Copiar archivos de configuración
echo "📋 Copiando archivos de configuración..."
cp public/_headers build/_headers 2>/dev/null || echo "⚠️  _headers no encontrado"
cp public/_redirects build/_redirects 2>/dev/null || echo "⚠️  _redirects no encontrado"
cp public/.htaccess build/.htaccess 2>/dev/null || echo "⚠️  .htaccess no encontrado"

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
if [ -f "build/sw.js" ]; then
    echo "✅ Service Worker encontrado"
else
    echo "❌ Service Worker no encontrado"
fi

if [ -f "build/manifest.json" ]; then
    echo "✅ Manifest encontrado"
else
    echo "❌ Manifest no encontrado"
fi

if [ -f "build/index.html" ]; then
    echo "✅ Index.html encontrado"
else
    echo "❌ Index.html no encontrado"
fi

# Crear servidor de producción si no existe
if [ ! -f "build/server.js" ]; then
    echo "🖥️  Creando servidor de producción..."
    cat > build/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para headers correctos
app.use((req, res, next) => {
  // Service Worker
  if (req.url === '/sw.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
  }
  
  // Manifest
  if (req.url === '/manifest.json') {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  
  // Archivos estáticos
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Manejar rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
EOF
fi

# Crear package.json para producción
if [ ! -f "build/package.json" ]; then
    echo "📄 Creando package.json para producción..."
    cat > build/package.json << 'EOF'
{
  "name": "saas-pedidos-frontend",
  "version": "1.0.0",
  "description": "Frontend para SaaS Pedidos",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF
fi

echo "✅ Build completado exitosamente!"
echo "📁 Archivos listos en el directorio build/" 