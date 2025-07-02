import bcrypt from 'bcryptjs';
import { connectDB } from './src/config/database.js';

async function createTestUsers() {
  try {
    const connection = await connectDB();
    
    // Données des utilisateurs de test
    const testUsers = [
      {
        email: 'coach@simplon.sn',
        password: 'coach123',
        first_name: 'Marie',
        last_name: 'Dupont',
        role: 'coach',
        phone: '+221 70 123 45 67'
      },
      {
        email: 'apprenant@simplon.sn',
        password: 'apprenant123',
        first_name: 'Jean',
        last_name: 'Martin',
        role: 'apprenant',
        phone: '+221 70 234 56 78'
      },
      {
        email: 'entreprise@simplon.sn',
        password: 'entreprise123',
        first_name: 'Pierre',
        last_name: 'Durand',
        role: 'entreprise',
        phone: '+221 70 345 67 89'
      }
    ];

    for (const userData of testUsers) {
      // Vérifier si l'utilisateur existe déjà
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (existingUsers.length > 0) {
        console.log(`ℹ️ Utilisateur ${userData.email} existe déjà`);
        continue;
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Créer l'utilisateur
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.email, passwordHash, userData.role, userData.first_name, userData.last_name, userData.phone]
      );

      const userId = result.insertId;

      // Créer les profils associés selon le rôle
      if (userData.role === 'apprenant') {
        await connection.execute(
          'INSERT INTO learners (user_id, promotion, formation, statut_insertion) VALUES (?, ?, ?, ?)',
          [userId, 'Promotion 2024', 'Développement Web', 'en_recherche']
        );
      } else if (userData.role === 'entreprise') {
        await connection.execute(
          'INSERT INTO companies (user_id, nom_entreprise, secteur_activite, taille_entreprise, statut_partenariat) VALUES (?, ?, ?, ?, ?)',
          [userId, 'Tech Solutions SA', 'Technologie', 'pme', 'actif']
        );
      }

      console.log(`✅ Utilisateur ${userData.role} créé avec succès !`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🔑 Mot de passe: ${userData.password}`);
      console.log('---');
    }

    console.log('🎉 Tous les utilisateurs de test ont été créés !');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    process.exit(1);
  }
}

createTestUsers(); 