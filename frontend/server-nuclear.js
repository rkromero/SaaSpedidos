const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// NUCLEAR BUILD INFO
const BUILD_INFO = {
  timestamp: '2025-01-11T17:00:00.000Z',
  buildId: 'NUCLEAR_BUILD_1736607600000',
  version: 'NUCLEAR_v1.0.0',
  hash: 'main.32a1f956.js',
  emergency: true
};

console.log('🚨 NUCLEAR SERVER STARTING 🚨');
console.log('⚡ BUILD INFO:', JSON.stringify(BUILD_INFO, null, 2));

const buildPath = path.join(__dirname, 'build');
console.log('📁 Build path:', buildPath);

// Verificar que build existe
if (!fs.existsSync(buildPath)) {
  console.error('❌ CRITICAL ERROR: Build directory not found!');
  process.exit(1);
}

// Verificar archivos críticos
const indexPath = path.join(buildPath, 'index.html');
const staticPath = path.join(buildPath, 'static');

console.log('🔍 Checking critical files:');
console.log('- index.html:', fs.existsSync(indexPath) ? '✅' : '❌');
console.log('- static dir:', fs.existsSync(staticPath) ? '✅' : '❌');

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📄 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para headers correctos
app.use((req, res, next) => {
  // Headers específicos para archivos JavaScript
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    console.log('🔧 Setting JS headers for:', req.url);
  }
  // Headers específicos para archivos CSS
  else if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    console.log('🔧 Setting CSS headers for:', req.url);
  }
  // Headers específicos para HTML
  else if (req.url.endsWith('.html') || req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    console.log('🔧 Setting HTML headers for:', req.url);
  }
  next();
});

// Servir archivos estáticos
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Ruta específica para archivos JavaScript (CRÍTICO)
app.get('/static/js/*.js', (req, res) => {
  const filePath = path.join(buildPath, req.url);
  console.log(`🔧 CRITICAL JS REQUEST: ${req.url}`);
  console.log(`📁 File path: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ JS file found, size: ${content.length} bytes`);
    console.log(`📄 First 100 chars: ${content.substring(0, 100)}...`);
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(content);
  } else {
    console.error(`❌ JS file not found: ${filePath}`);
    res.status(404).send('JavaScript file not found');
  }
});

// Ruta de información del build
app.get('/build-info', (req, res) => {
  res.json(BUILD_INFO);
});

// Ruta de verificación
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    buildPath: buildPath,
    buildExists: fs.existsSync(buildPath),
    buildInfo: BUILD_INFO
  });
});

// Catch-all para SPA
app.get('*', (req, res) => {
  if (req.url.includes('.') && !req.url.includes('?')) {
    console.log(`❌ Static file not found: ${req.url}`);
    return res.status(404).send(`File not found: ${req.url}`);
  }
  
  console.log(`🏠 SPA route: ${req.url}`);
  res.sendFile(indexPath);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 NUCLEAR SERVER RUNNING!');
  console.log(`📡 Port: ${port}`);
  console.log(`📁 Serving: ${buildPath}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`💡 Build info: http://localhost:${port}/build-info`);
  console.log('✅ READY TO SERVE JAVASCRIPT FILES!');
}); 