import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la configuration...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'simplon_insertion');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'simplon_insertion',
    });

    console.log('✅ Connexion réussie !');

    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables trouvées:', tables.length);

    // Vérifier les utilisateurs
    const [users] = await connection.execute('SELECT email, role FROM users');
    console.log('👥 Utilisateurs:', users);

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

checkDatabase();