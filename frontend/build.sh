#!/bin/bash

# Script de build optimizado para Railway - FORZAR REBUILD
echo "🚀 Iniciando build FORZADO para Railway..."
echo "⏰ Timestamp: $(date)"
echo "🔥 Versión: v1.1.0-$(date +%s)"

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm ci --prefer-offline --no-audit
else
    echo "📦 Reinstalando dependencias para forzar rebuild..."
    rm -rf node_modules
    npm ci --prefer-offline --no-audit
fi

# Limpiar build anterior
if [ -d "build" ]; then
    echo "🧹 Limpiando build anterior..."
    rm -rf build
fi

# Variables de entorno para debug
export DEBUG=true
export REACT_APP_API_URL=https://backend-production-62f0.up.railway.app
export GENERATE_SOURCEMAP=false
export CI=false

echo "🌐 API URL configurada: $REACT_APP_API_URL"

# Ejecutar build
echo "🔨 Ejecutando build..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "build" ]; then
    echo "❌ Error: El directorio build no se creó"
    exit 1
fi

# Crear servidor de producción
echo "🖥️  Creando servidor de producción..."
cat > build/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor frontend...');
console.log('📁 Sirviendo desde:', __dirname);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname), {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// Manejar rutas SPA
app.get('*', (req, res) => {
  console.log('📄 Serving SPA for:', req.path);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor frontend corriendo en puerto ${port}`);
  console.log(`📱 Aplicación disponible en http://localhost:${port}`);
});
EOF

# Crear package.json para producción
cat > build/package.json << 'EOF'
{
  "name": "saas-pedidos-frontend",
  "version": "1.1.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

echo "✅ Build completado exitosamente!"
echo "🎯 Versión: 1.1.0-$(date +%s)" 