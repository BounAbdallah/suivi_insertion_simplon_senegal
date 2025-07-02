import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'simplon_insertion',
    });

    // Supprimer l'admin existant s'il y en a un
    await connection.execute('DELETE FROM users WHERE email = ?', ['admin@simplon.sn']);

    // Créer le hash du mot de passe
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insérer le nouvel admin
    await connection.execute(
      'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@simplon.sn', passwordHash, 'admin', 'Admin', 'Système', '+221701234567']
    );

    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email: admin@simplon.sn');
    console.log('🔑 Mot de passe: admin123');

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createAdmin();