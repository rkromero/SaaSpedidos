const db = require('../config/database');

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones...');
    
    await db.initialize();
    console.log('✅ Migraciones completadas exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    process.exit(1);
  }
}

runMigrations(); 