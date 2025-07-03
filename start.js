const { spawn } = require('child_process');
const path = require('path');

// Función para ejecutar un comando
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function start() {
  try {
    console.log('🚀 Iniciando aplicación SaaS Gestión de Pedidos...');
    
    const PORT = process.env.PORT || 3000;
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Modo producción - Ejecutando en puerto:', PORT);
      
      // En producción, ejecutar solo el backend que también servirá el frontend
      const serverProcess = spawn('node', ['backend/server.js'], {
        stdio: 'inherit',
        env: { 
          ...process.env, 
          PORT: PORT,
          NODE_ENV: 'production'
        }
      });
      
      // Manejar señales de terminación
      process.on('SIGTERM', () => {
        console.log('🔴 Terminando servidor...');
        serverProcess.kill();
      });
      
      process.on('SIGINT', () => {
        console.log('🔴 Terminando servidor...');
        serverProcess.kill();
      });
      
    } else {
      console.log('🔧 Modo desarrollo - Ejecutando ambos servicios...');
      
      // En desarrollo, ejecutar ambos servicios
      const concurrentlyProcess = spawn('npm', ['run', 'dev:full'], {
        stdio: 'inherit'
      });
      
      process.on('SIGTERM', () => {
        concurrentlyProcess.kill();
      });
      
      process.on('SIGINT', () => {
        concurrentlyProcess.kill();
      });
    }
    
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

start(); 