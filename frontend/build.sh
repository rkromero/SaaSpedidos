#!/bin/bash

# Script de build optimizado para Railway
echo "🚀 Iniciando build para Railway..."

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm ci --prefer-offline --no-audit
else
    echo "📦 Dependencias ya instaladas"
fi

# Limpiar build anterior solo si existe
if [ -d "build" ]; then
    echo "🧹 Limpiando build anterior..."
    rm -rf build
fi

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
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
EOF

# Crear package.json para producción
cat > build/package.json << 'EOF'
{
  "name": "saas-pedidos-frontend",
  "version": "1.0.0",
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