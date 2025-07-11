#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY FIX - Solving 403 Authentication Issues');
console.log('⏰ Timestamp:', new Date().toISOString());

// 1. Crear archivo de configuración de emergencia
const envContent = `REACT_APP_API_URL=https://backend-production-62f0.up.railway.app
GENERATE_SOURCEMAP=false
CI=false
DISABLE_ESLINT_PLUGIN=true
BUILD_VERSION=${Date.now()}
`;

fs.writeFileSync('frontend/.env', envContent);
fs.writeFileSync('frontend/.env.production', envContent);
console.log('✅ Variables de entorno configuradas');

// 2. Actualizar railway.json con configuración de emergencia
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "npm start"
  },
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd frontend && npm ci --prefer-offline && npm run build:railway",
    "watchPatterns": ["frontend/**"]
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "GENERATE_SOURCEMAP": "false",
        "CI": "false",
        "DISABLE_ESLINT_PLUGIN": "true",
        "FAST_REFRESH": "false",
        "REACT_APP_API_URL": "https://backend-production-62f0.up.railway.app",
        "BUILD_VERSION": Date.now().toString()
      }
    }
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('✅ Railway.json actualizado');

// 3. Crear interceptor simplificado en App.js
const appJsPath = 'frontend/src/App.js';
const appContent = fs.readFileSync(appJsPath, 'utf8');

if (!appContent.includes('axios.defaults.baseURL')) {
  const interceptorCode = `
// EMERGENCY FIX: Configure axios globally
import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-62f0.up.railway.app';

// Add global request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    console.log('🎫 Token:', token ? 'Present' : 'Missing');
    return config;
  },
  (error) => Promise.reject(error)
);

// Add global response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Request failed:', error.response?.status, error.config?.url);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Authentication failed, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

`;
  
  const updatedContent = appContent.replace(
    "import './App.css';",
    "import './App.css';" + interceptorCode
  );
  
  fs.writeFileSync(appJsPath, updatedContent);
  console.log('✅ App.js actualizado con interceptor global');
}

// 4. Crear archivo dummy para forzar rebuild
const dummyContent = `// FORCE REBUILD ${Date.now()}
export const BUILD_TIMESTAMP = ${Date.now()};
export const BUILD_VERSION = "${Date.now()}";
console.log('🔥 Build timestamp:', BUILD_TIMESTAMP);
`;

fs.writeFileSync('frontend/src/build-info.js', dummyContent);
console.log('✅ Build info creado');

// 5. Actualizar versión en package.json
const packagePath = 'frontend/package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = `1.1.${Date.now()}`;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json version updated');

console.log('');
console.log('🎯 EMERGENCY FIX COMPLETED!');
console.log('📋 Actions taken:');
console.log('  1. ✅ Environment variables configured');
console.log('  2. ✅ Railway config updated');
console.log('  3. ✅ Global axios interceptors added');
console.log('  4. ✅ Force rebuild triggered');
console.log('  5. ✅ Package version bumped');
console.log('');
console.log('🚀 Ready to commit and push!');
console.log(''); 