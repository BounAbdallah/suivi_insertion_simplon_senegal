# Plateforme de suivi d'insertion professionnelle - Simplon Sénégal

## Présentation

Cette plateforme est dédiée au **suivi de l'insertion professionnelle des apprenants de Simplon Sénégal**. Elle facilite le suivi des parcours, le partage d'opportunités professionnelles et la mise en relation entre les **entreprises partenaires** et les **talents formés par Simplon Sénégal**.

Elle permet :
- Un **accompagnement personnalisé** des apprenants tout au long de leur parcours.
- La centralisation et la diffusion des **offres d'emploi, stages et événements** pertinents.
- Aux entreprises de **trouver et contacter facilement les profils adaptés** à leurs besoins.
- De favoriser l'**insertion professionnelle** et le suivi statistique des résultats.
- De créer une **communauté active** autour de l'emploi, de la formation et de l'innovation numérique au Sénégal.

---

## Modules principaux

- **Tableau de bord** : Vue d'ensemble, statistiques, accès rapide aux modules.
- **Gestion des utilisateurs** : Création, modification, activation/désactivation, consultation des profils.
- **Gestion des apprenants** : Suivi des profils, insertion, historique, recherche et filtres.
- **Gestion des entreprises** : Suivi des partenaires, informations RH, offres d'emploi, filtres.
- **Gestion des offres d'emploi** : Publication, consultation, candidatures, suivi des statuts.
- **Gestion des documents** : Bibliothèque, upload, téléchargement, suppression, filtrage par type.
- **Gestion des événements** : Création, inscription, suivi des participants, filtres par type/statut.
- **Statistiques & rapports** : Visualisation graphique, taux d'insertion, répartition des rôles, tendances.
- **Profil utilisateur** : Modification des informations personnelles, changement de mot de passe.

---

## Architecture

- **Frontend** : React + TypeScript, TailwindCSS, Framer Motion, React Router, Chart.js
- **Backend** : Node.js, Express, MySQL
- **Authentification** : JWT, gestion des rôles (admin, coach, apprenant, entreprise)
- **API REST** : Sécurisée, endpoints pour chaque ressource (utilisateurs, apprenants, entreprises, offres, documents, événements...)
- **Stockage des fichiers** : Uploads sécurisés pour les documents

---

## Démarrage rapide

### Prérequis
- Node.js >= 16
- MySQL

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd <nom-du-repo>
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   cd server && npm install
   ```
3. **Configurer la base de données**
   - Créer une base MySQL et adapter les variables d'environnement dans `server/.env`
   - Lancer les scripts d'initialisation si besoin
4. **Lancer le backend**
   ```bash
   cd server
   npm run dev
   ```
5. **Lancer le frontend**
   ```bash
   cd ..
   npm run dev
   ```
6. **Accéder à l'application**
   - Ouvrir [http://localhost:5173](http://localhost:5173)

---

## Contribution

Les contributions sont les bienvenues ! Merci de proposer vos idées, corrections ou améliorations via des issues ou des pull requests.

---

## Contact

- **Simplon Sénégal**
- Email : contact@simplon.co
- Site : [https://simplon.co/senegal](https://simplon.co/senegal)

---

## Licence

Projet open source sous licence MIT.

## 🚀 Fonctionnalités

### 👥 Gestion des utilisateurs
- **Rôles multiples** : Administrateur, Coach, Apprenant, Entreprise
- **Création et modification** d'utilisateurs
- **Gestion des statuts** (actif/inactif)
- **Profils détaillés** avec informations spécifiques par rôle

### 📊 Tableau de bord et statistiques
- **Graphiques interactifs** avec Chart.js
- **Métriques en temps réel** (taux d'insertion, candidatures, etc.)
- **Statistiques avancées** pour les administrateurs
- **Export de données** (en développement)

### 💼 Gestion des offres d'emploi
- **Publication d'offres** par les entreprises
- **Candidatures** des apprenants
- **Suivi des candidatures** avec statuts
- **Filtres et recherche** avancés

### 📅 Événements
- **Création d'événements** par les administrateurs/coachs
- **Inscription des participants**
- **Gestion des participants**

### 📁 Documents
- **Upload et gestion** de documents
- **Catégorisation** par type
- **Téléchargement** sécurisé

### 🔐 Sécurité
- **Authentification JWT**
- **Autorisation par rôles**
- **Changement de mot de passe** sécurisé
- **Validation des données**

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Chart.js** pour les graphiques
- **React Hook Form** pour les formulaires
- **React Hot Toast** pour les notifications
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **Multer** pour l'upload de fichiers
- **Express Validator** pour la validation
- **Helmet** pour la sécurité
- **CORS** pour les requêtes cross-origin

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- MySQL (version 8.0 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd simplon-insertion-platform
```

2. **Installer les dépendances**
```bash
# Dépendances frontend
npm install

# Dépendances backend
cd server
npm install
cd ..
```

3. **Configuration de la base de données**
```bash
# Créer un fichier .env dans le dossier server
cp server/.env.example server/.env

# Modifier les variables d'environnement dans server/.env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=simplon_platform
JWT_SECRET=your_jwt_secret
```

4. **Initialiser la base de données**
```bash
# Vérifier la connexion à la base de données
node check-db.js

# Créer un administrateur initial
node create-admin.js
```

5. **Démarrer l'application**
```bash
# Démarrer le serveur et le client en parallèle
npm run dev

# Ou démarrer séparément
npm run server  # Backend sur le port 3001
npm run client  # Frontend sur le port 5173
```

## 🗄️ Structure de la base de données

### Tables principales
- **users** : Informations des utilisateurs
- **learners** : Informations spécifiques aux apprenants
- **companies** : Informations spécifiques aux entreprises
- **jobs** : Offres d'emploi
- **applications** : Candidatures aux offres
- **events** : Événements
- **event_participants** : Participants aux événements
- **documents** : Documents uploadés
- **insertion_tracking** : Suivi de l'insertion

## 🔧 Configuration

### Variables d'environnement

#### Backend (server/.env)
```env
PORT=3001
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=simplon_platform
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Démarre le serveur et le client
npm run client       # Démarre uniquement le frontend
npm run server       # Démarre uniquement le backend

# Build
npm run build        # Build de production
npm run preview      # Prévisualisation du build

# Utilitaires
npm run lint         # Vérification du code
npm run setup        # Installation des dépendances du serveur
```

## 📱 Utilisation

### Rôles et permissions

#### Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Statistiques avancées
- Création d'événements

#### Coach
- Gestion des apprenants
- Suivi des candidatures
- Création d'événements
- Accès aux statistiques de base

#### Apprenant
- Consultation des offres d'emploi
- Candidature aux offres
- Participation aux événements
- Gestion du profil

#### Entreprise
- Publication d'offres d'emploi
- Gestion des candidatures reçues
- Consultation des statistiques de base

### Fonctionnalités principales

1. **Connexion/Inscription**
   - Formulaire de connexion avec email/mot de passe
   - Inscription avec validation des données

2. **Tableau de bord**
   - Vue d'ensemble des métriques
   - Graphiques interactifs
   - Actions rapides

3. **Gestion des utilisateurs**
   - Liste des utilisateurs avec filtres
   - Création/modification/suppression
   - Gestion des statuts

4. **Offres d'emploi**
   - Publication d'offres
   - Candidature avec message de motivation
   - Suivi des candidatures

5. **Événements**
   - Création d'événements
   - Inscription des participants
   - Gestion des participants

6. **Documents**
   - Upload de documents
   - Catégorisation
   - Téléchargement

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hashage des mots de passe** avec bcrypt
- **Validation des données** côté serveur
- **Protection CORS** configurée
- **Headers de sécurité** avec Helmet
- **Rate limiting** pour prévenir les abus

## 🚀 Déploiement

### Production
```bash
# Build de production
npm run build

# Démarrer le serveur de production
cd server
npm start
```

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=3001
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
JWT_SECRET=your_secure_jwt_secret
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🔄 Changelog

### Version 1.0.0
- ✅ Gestion complète des utilisateurs
- ✅ Tableau de bord avec graphiques
- ✅ Gestion des offres d'emploi
- ✅ Système de candidatures
- ✅ Gestion des événements
- ✅ Upload de documents
- ✅ Statistiques avancées
- ✅ Interface responsive
- ✅ Animations et transitions
- ✅ Sécurité renforcée

---

**Développé avec ❤️ pour Simplon** 