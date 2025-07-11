const express = require('express');
const path = require('path');
const fs = require('fs');
const debugInfo = require('./railway-debug.js');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 STARTING SAAS PEDIDOS SERVER');
console.log('📅 Debug Info:', debugInfo);
console.log('📁 Build directory:', path.join(__dirname, 'build'));

// Verificar que el directorio build existe
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('❌ Build directory not found:', buildPath);
  process.exit(1);
}

// Middleware para logging
app.use((req, res, next) => {
  console.log(`📄 ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos con headers correctos
app.use(express.static(buildPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    console.log(`🔧 Serving static file: ${filePath}`);
    
    // Configurar headers específicos para archivos JS y CSS
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Ruta específica para archivos JavaScript
app.get('/static/js/*.js', (req, res) => {
  const jsFile = path.join(buildPath, req.url);
  console.log(`🔧 Serving JS file: ${jsFile}`);
  
  if (fs.existsSync(jsFile)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(jsFile);
  } else {
    console.error(`❌ JS file not found: ${jsFile}`);
    res.status(404).send('JS file not found');
  }
});

// Ruta específica para archivos CSS
app.get('/static/css/*.css', (req, res) => {
  const cssFile = path.join(buildPath, req.url);
  console.log(`🔧 Serving CSS file: ${cssFile}`);
  
  if (fs.existsSync(cssFile)) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(cssFile);
  } else {
    console.error(`❌ CSS file not found: ${cssFile}`);
    res.status(404).send('CSS file not found');
  }
});

// Catch-all para SPA routing - SOLO para rutas que no son archivos estáticos
app.get('*', (req, res) => {
  // Si la URL parece un archivo estático, devolver 404
  if (req.url.includes('.') && !req.url.includes('?')) {
    console.log(`❌ Static file not found: ${req.url}`);
    return res.status(404).send('File not found');
  }
  
  // Para todas las demás rutas, servir index.html
  const indexPath = path.join(buildPath, 'index.html');
  console.log(`🏠 Serving SPA route: ${req.url} -> index.html`);
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SaaS Pedidos Frontend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving from: ${buildPath}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`✅ Server is ready to handle requests`);
}); 