const db = require('../config/database');

async function seedData() {
  try {
    console.log('🌱 Iniciando seeding...');
    
    await db.initialize();
    await db.seedDatabase();
    
    console.log('✅ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeding:', error);
    process.exit(1);
  }
}

seedData(); 