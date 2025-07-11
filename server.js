const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

console.log('🚀 Simple Server Starting...');
console.log('Port:', port);
console.log('Directory:', __dirname);

// Buscar directorio build
const buildPath = path.join(__dirname, 'frontend', 'build');
console.log('Build path:', buildPath);

// Servir archivos estáticos
app.use(express.static(buildPath));

// Catch-all para SPA
app.get('*', (req, res) => {
  console.log('Request:', req.url);
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📁 Serving from: ${buildPath}`);
}); 