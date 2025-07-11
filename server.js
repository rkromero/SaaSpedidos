const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// ULTIMATE FIX PARA RAILWAY
console.log('🚨🚨🚨 ULTIMATE SERVER STARTING 🚨🚨🚨');
console.log('📍 Running from ROOT directory');
console.log('🕐 Timestamp:', new Date().toISOString());

// Intentar múltiples ubicaciones de build
const possibleBuildPaths = [
  path.join(__dirname, 'build'),
  path.join(__dirname, 'frontend', 'build'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'public')
];

let buildPath = null;
for (const tryPath of possibleBuildPaths) {
  if (fs.existsSync(tryPath)) {
    buildPath = tryPath;
    console.log('✅ Found build directory:', buildPath);
    break;
  } else {
    console.log('❌ Not found:', tryPath);
  }
}

if (!buildPath) {
  console.error('🚨 CRITICAL: No build directory found!');
  console.log('📁 Current directory:', __dirname);
  console.log('📋 Directory contents:');
  try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
      const stats = fs.statSync(path.join(__dirname, file));
      console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
  process.exit(1);
}

// Verificar archivos críticos
const indexPath = path.join(buildPath, 'index.html');
const staticPath = path.join(buildPath, 'static');

console.log('🔍 Critical files check:');
console.log('📄 index.html:', fs.existsSync(indexPath) ? '✅ EXISTS' : '❌ MISSING');
console.log('📁 static dir:', fs.existsSync(staticPath) ? '✅ EXISTS' : '❌ MISSING');

if (fs.existsSync(staticPath)) {
  const jsPath = path.join(staticPath, 'js');
  if (fs.existsSync(jsPath)) {
    const jsFiles = fs.readdirSync(jsPath).filter(f => f.endsWith('.js'));
    console.log('🔧 JavaScript files found:', jsFiles);
  }
}

// Middleware de logging ultra-verboso
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌍 ${timestamp} | ${req.method} ${req.url} | IP: ${req.ip}`);
  next();
});

// Headers específicos ANTES de servir archivos
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    console.log(`🔧 FORCING JavaScript headers for: ${req.url}`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  } else if (req.url.endsWith('.css')) {
    console.log(`🎨 FORCING CSS headers for: ${req.url}`);
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  } else if (req.url.endsWith('.html') || req.url === '/') {
    console.log(`📄 FORCING HTML headers for: ${req.url}`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// Ruta ULTRA-ESPECÍFICA para JavaScript
app.get('/static/js/*.js', (req, res) => {
  const jsFile = path.join(buildPath, req.url);
  console.log(`🚨 CRITICAL JS REQUEST: ${req.url}`);
  console.log(`📁 Full path: ${jsFile}`);
  console.log(`📊 File exists: ${fs.existsSync(jsFile)}`);
  
  if (fs.existsSync(jsFile)) {
    try {
      const content = fs.readFileSync(jsFile, 'utf8');
      console.log(`✅ JS file loaded successfully!`);
      console.log(`📏 File size: ${content.length} bytes`);
      console.log(`🔤 First 50 chars: "${content.substring(0, 50)}..."`);
      console.log(`🔚 Last 50 chars: "...${content.substring(content.length - 50)}"`);
      
      // FORZAR headers de JavaScript
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      res.send(content);
      console.log(`✅ JavaScript file served successfully!`);
    } catch (err) {
      console.error(`❌ Error reading JS file:`, err);
      res.status(500).send('Error reading JavaScript file');
    }
  } else {
    console.error(`❌ JavaScript file not found: ${jsFile}`);
    
    // Listar archivos en el directorio para debug
    const jsDir = path.join(buildPath, 'static', 'js');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      console.log(`📋 Available JS files:`, files);
    }
    
    res.status(404).send(`JavaScript file not found: ${req.url}`);
  }
});

// Servir archivos estáticos
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    console.log(`📂 Static file request: ${filePath}`);
  }
}));

// Health check
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    buildPath: buildPath,
    buildExists: fs.existsSync(buildPath),
    indexExists: fs.existsSync(indexPath),
    staticExists: fs.existsSync(staticPath)
  };
  
  console.log('🏥 Health check:', health);
  res.json(health);
});

// Debug info
app.get('/debug', (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    __dirname: __dirname,
    buildPath: buildPath,
    possiblePaths: possibleBuildPaths,
    nodeEnv: process.env.NODE_ENV,
    port: port
  };
  
  if (fs.existsSync(staticPath)) {
    const jsPath = path.join(staticPath, 'js');
    if (fs.existsSync(jsPath)) {
      debugInfo.jsFiles = fs.readdirSync(jsPath);
    }
  }
  
  res.json(debugInfo);
});

// Catch-all para SPA
app.get('*', (req, res) => {
  if (req.url.includes('.') && !req.url.includes('?')) {
    console.log(`❌ Static file not found: ${req.url}`);
    return res.status(404).send(`File not found: ${req.url}`);
  }
  
  console.log(`🏠 SPA route requested: ${req.url} -> serving index.html`);
  res.sendFile(indexPath);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚨🚨🚨 ULTIMATE SERVER RUNNING! 🚨🚨🚨');
  console.log(`🌍 Port: ${port}`);
  console.log(`📁 Serving from: ${buildPath}`);
  console.log(`🔗 Health: http://localhost:${port}/health`);
  console.log(`🐛 Debug: http://localhost:${port}/debug`);
  console.log('✅ READY TO SERVE ALL FILES!');
  console.log('🎯 THIS SERVER CANNOT FAIL TO SERVE JAVASCRIPT!');
}); 