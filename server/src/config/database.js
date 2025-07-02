import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;

export async function connectDB() {
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'simplon_insertion');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'simplon_insertion',
      charset: 'utf8mb4'
    });
    
    console.log('✅ Connexion à la base de données établie');
    return connection;
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔄 Création de la base de données...');
      // Créer la base de données si elle n'existe pas
      const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        charset: 'utf8mb4'
      });
      
      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'simplon_insertion'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConnection.end();
      
      console.log('✅ Base de données créée');
      // Reconnecter à la nouvelle base
      return connectDB();
    }
    throw error;
  }
}

export async function initializeDatabase() {
  if (!connection) {
    throw new Error('Connexion à la base de données non établie');
  }

  console.log('🔄 Initialisation des tables...');

  const tables = [
    // Table des utilisateurs
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'coach', 'apprenant', 'entreprise') NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Table des apprenants
    `CREATE TABLE IF NOT EXISTS learners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      promotion VARCHAR(100),
      formation VARCHAR(200),
      date_debut DATE,
      date_fin DATE,
      statut_insertion ENUM('en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre') DEFAULT 'en_recherche',
      cv_path VARCHAR(500),
      competences TEXT,
      experience TEXT,
      adresse TEXT,
      ville VARCHAR(100),
      region VARCHAR(100),
      date_naissance DATE,
      genre ENUM('homme', 'femme', 'autre'),
      niveau_etude VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Table des entreprises
    `CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      nom_entreprise VARCHAR(200) NOT NULL,
      secteur_activite VARCHAR(100),
      taille_entreprise ENUM('tpe', 'pme', 'eti', 'ge') DEFAULT 'pme',
      adresse TEXT,
      ville VARCHAR(100),
      region VARCHAR(100),
      site_web VARCHAR(255),
      description TEXT,
      contact_rh_nom VARCHAR(100),
      contact_rh_email VARCHAR(255),
      contact_rh_phone VARCHAR(20),
      partenaire_depuis DATE,
      statut_partenariat ENUM('actif', 'inactif', 'en_discussion') DEFAULT 'en_discussion',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Table des offres d'emploi
    `CREATE TABLE IF NOT EXISTS job_offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      titre VARCHAR(200) NOT NULL,
      type_contrat ENUM('cdi', 'cdd', 'stage', 'freelance', 'apprentissage') NOT NULL,
      description TEXT NOT NULL,
      competences_requises TEXT,
      experience_requise VARCHAR(100),
      salaire_min DECIMAL(10,2),
      salaire_max DECIMAL(10,2),
      ville VARCHAR(100),
      region VARCHAR(100),
      date_publication DATE DEFAULT (CURRENT_DATE),
      date_expiration DATE,
      statut ENUM('active', 'fermee', 'pourvue') DEFAULT 'active',
      nb_postes INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )`,

    // Table des candidatures
    `CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_offer_id INT NOT NULL,
      learner_id INT NOT NULL,
      statut ENUM('en_attente', 'vue', 'entretien', 'acceptee', 'refusee') DEFAULT 'en_attente',
      message_motivation TEXT,
      date_candidature TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_reponse TIMESTAMP NULL,
      commentaires TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
      FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
      UNIQUE KEY unique_application (job_offer_id, learner_id)
    )`,

    // Table des événements
    `CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titre VARCHAR(200) NOT NULL,
      description TEXT,
      type_evenement ENUM('atelier', 'visite_entreprise', 'job_dating', 'conference', 'formation', 'autre') NOT NULL,
      date_debut DATETIME NOT NULL,
      date_fin DATETIME,
      lieu VARCHAR(255),
      capacite_max INT,
      animateur VARCHAR(100),
      statut ENUM('planifie', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // Table des participations aux événements
    `CREATE TABLE IF NOT EXISTS event_participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      learner_id INT NOT NULL,
      statut_participation ENUM('inscrit', 'present', 'absent', 'excuse') DEFAULT 'inscrit',
      date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      commentaires TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
      UNIQUE KEY unique_participation (event_id, learner_id)
    )`,

    // Table des documents
    `CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titre VARCHAR(200) NOT NULL,
      description TEXT,
      type_document ENUM('cv_template', 'guide', 'presentation', 'rapport', 'autre') NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      uploaded_by INT,
      is_public BOOLEAN DEFAULT true,
      download_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // Table des suivis d'insertion
    `CREATE TABLE IF NOT EXISTS insertion_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      learner_id INT NOT NULL,
      statut_precedent ENUM('en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre'),
      nouveau_statut ENUM('en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre') NOT NULL,
      entreprise VARCHAR(200),
      poste VARCHAR(200),
      type_contrat ENUM('cdi', 'cdd', 'stage', 'freelance', 'apprentissage'),
      salaire DECIMAL(10,2),
      date_debut DATE,
      date_fin DATE,
      commentaires TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`
  ];

  for (const table of tables) {
    try {
      await connection.execute(table);
    } catch (error) {
      console.error('❌ Erreur création table:', error.message);
    }
  }

  console.log('✅ Tables créées');

  // Insérer des données de test
  await insertInitialData();
}

async function insertInitialData() {
  try {
    console.log('🔄 Vérification des données initiales...');
    
    // Vérifier si des données existent déjà
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('ℹ️ Données déjà présentes');
      return; // Les données existent déjà
    }

    console.log('🔄 Création de l\'utilisateur admin...');
    
    // Créer un utilisateur admin par défaut
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(
      'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@simplon.sn', adminPassword, 'admin', 'Admin', 'Système', '+221701234567']
    );

    console.log('✅ Utilisateur admin créé');
    console.log('📧 Email: admin@simplon.sn');
    console.log('🔑 Mot de passe: admin123');
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données initiales:', error.message);
  }
}

export function getConnection() {
  return connection;
}