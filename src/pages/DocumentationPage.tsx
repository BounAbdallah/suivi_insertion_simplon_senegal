import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Users, UserCheck, Building2, Briefcase, FileText, Calendar, TrendingUp, FolderKanban, User } from 'lucide-react';

const modules = [
  {
    key: 'dashboard',
    title: 'Tableau de bord',
    description: "Vue d'ensemble, stats, accès rapide",
    color: 'from-red-500 to-orange-500',
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    center: true,
  },
  {
    key: 'users',
    title: 'Utilisateurs',
    description: 'Gestion, rôles, profils',
    color: 'from-blue-500 to-blue-400',
    icon: <Users className="w-7 h-7 text-blue-500" />,
  },
  {
    key: 'learners',
    title: 'Apprenants',
    description: 'Suivi, insertion, historique',
    color: 'from-green-500 to-green-400',
    icon: <UserCheck className="w-7 h-7 text-green-500" />,
  },
  {
    key: 'companies',
    title: 'Entreprises',
    description: 'Partenaires, offres',
    color: 'from-purple-500 to-purple-400',
    icon: <Building2 className="w-7 h-7 text-purple-500" />,
  },
  {
    key: 'jobs',
    title: "Offres d'emploi",
    description: 'Publication, candidatures',
    color: 'from-orange-500 to-yellow-400',
    icon: <Briefcase className="w-7 h-7 text-orange-500" />,
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'Bibliothèque, upload, download',
    color: 'from-blue-400 to-blue-200',
    icon: <FileText className="w-7 h-7 text-blue-400" />,
  },
  {
    key: 'events',
    title: 'Événements',
    description: 'Création, inscription',
    color: 'from-indigo-500 to-indigo-400',
    icon: <Calendar className="w-7 h-7 text-indigo-500" />,
  },
  {
    key: 'stats',
    title: 'Statistiques',
    description: 'Graphiques, rapports',
    color: 'from-pink-500 to-pink-400',
    icon: <FolderKanban className="w-7 h-7 text-pink-500" />,
  },
  {
    key: 'profile',
    title: 'Profil',
    description: 'Infos perso, mot de passe',
    color: 'from-gray-500 to-gray-400',
    icon: <User className="w-7 h-7 text-gray-500" />,
  },
];

export function DocumentationPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-red-600 mb-2">Documentation</h1>
          {/* Présentation de la plateforme */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border border-red-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Présentation de la plateforme</h2>
            <p className="text-gray-800 text-lg mb-2">
              Cette plateforme a été conçue pour <b>faciliter le suivi des apprenants de Simplon Sénégal</b>, partager des opportunités professionnelles et renforcer la mise en relation entre les <b>entreprises partenaires</b> et les <b>talents formés par Simplon Sénégal</b>.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
              <li>Assurer un <b>accompagnement personnalisé</b> des apprenants tout au long de leur parcours.</li>
              <li>Centraliser et diffuser les <b>offres d'emploi, stages et événements</b> pertinents.</li>
              <li>Permettre aux entreprises de <b>trouver et contacter facilement les profils adaptés</b> à leurs besoins.</li>
              <li>Favoriser l'<b>insertion professionnelle</b> et le suivi statistique des résultats.</li>
              <li>Créer une communauté active autour de l'emploi, de la formation et de l'innovation numérique au Sénégal.</li>
            </ul>
          </div>
          <p className="text-gray-700 text-lg mb-6">Bienvenue sur la documentation de la plateforme Simplon. Vous trouverez ici le plan de l'application ainsi qu'un guide d'utilisation pour chaque fonctionnalité.</p>
        </motion.div>

        {/* Schéma du plan de l'application (HTML/CSS cards) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Schéma du plan de l'application (cartes visuelles)</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-full flex flex-col items-center">
              {/* Dashboard central */}
              <div className="z-10 mb-8">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center text-white border-4 border-white">
                  <TrendingUp className="w-10 h-10 mb-2" />
                  <div className="text-xl font-bold">Tableau de bord</div>
                  <div className="text-sm opacity-90">Vue d'ensemble, stats, accès rapide</div>
                </div>
              </div>
              {/* Modules autour en grille responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {modules.filter(m => !m.center).map((mod) => (
                  <div key={mod.key} className={`bg-gradient-to-r ${mod.color} rounded-xl shadow flex flex-col items-center p-5 border-2 border-white`}>
                    <div className="mb-2">{mod.icon}</div>
                    <div className="font-bold text-lg text-gray-900 mb-1">{mod.title}</div>
                    <div className="text-sm text-gray-700 text-center">{mod.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-500 mt-6 text-sm">Chaque module est représenté par une carte reliée conceptuellement au tableau de bord central.</p>
          </div>
        </motion.div>

        {/* Plan de l'application */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Plan de l'application</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            <li><b>Tableau de bord</b> : Vue d'ensemble, statistiques, accès rapide aux modules.</li>
            <li><b>Gestion des utilisateurs</b> : Création, modification, activation/désactivation, consultation des profils.</li>
            <li><b>Gestion des apprenants</b> : Suivi des profils, insertion, historique, recherche et filtres.</li>
            <li><b>Gestion des entreprises</b> : Suivi des partenaires, informations RH, offres d'emploi, filtres.</li>
            <li><b>Gestion des offres d'emploi</b> : Publication, consultation, candidatures, suivi des statuts.</li>
            <li><b>Gestion des documents</b> : Bibliothèque, upload, téléchargement, suppression, filtrage par type.</li>
            <li><b>Gestion des événements</b> : Création, inscription, suivi des participants, filtres par type/statut.</li>
            <li><b>Statistiques & rapports</b> : Visualisation graphique, taux d'insertion, répartition des rôles, tendances.</li>
            <li><b>Profil utilisateur</b> : Modification des informations personnelles, changement de mot de passe.</li>
          </ul>
        </motion.div>

        {/* Documentation d'utilisation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Guide d'utilisation</h2>
          <div className="space-y-6 text-gray-800">
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">1. Connexion & Inscription</h3>
              <ul className="list-disc pl-6">
                <li>Accédez à la page de connexion pour vous authentifier avec votre email et mot de passe.</li>
                <li>Si vous n'avez pas de compte, utilisez la page d'inscription pour créer un profil (apprenant ou entreprise).</li>
                <li>En cas d'oubli de mot de passe, contactez un administrateur.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">2. Tableau de bord</h3>
              <ul className="list-disc pl-6">
                <li>Visualisez les statistiques globales : utilisateurs, apprenants, entreprises, offres, taux d'insertion.</li>
                <li>Accédez rapidement aux modules principaux via les actions rapides.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">3. Gestion des utilisateurs</h3>
              <ul className="list-disc pl-6">
                <li>Créez, modifiez ou désactivez des comptes (admin uniquement).</li>
                <li>Consultez les profils détaillés et filtrez par rôle ou statut.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">4. Gestion des apprenants</h3>
              <ul className="list-disc pl-6">
                <li>Recherchez, filtrez et consultez les profils apprenants.</li>
                <li>Suivez l'insertion professionnelle et l'historique de chaque apprenant.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">5. Gestion des entreprises</h3>
              <ul className="list-disc pl-6">
                <li>Consultez la liste des entreprises partenaires, filtrez par secteur ou statut.</li>
                <li>Accédez aux informations RH et aux offres publiées par chaque entreprise.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">6. Offres d'emploi</h3>
              <ul className="list-disc pl-6">
                <li>Publiez de nouvelles offres (entreprise/admin), consultez et gérez les candidatures.</li>
                <li>Les apprenants peuvent postuler directement et suivre le statut de leur candidature.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">7. Documents</h3>
              <ul className="list-disc pl-6">
                <li>Accédez à la bibliothèque, filtrez par type (CV, guide, rapport, etc.).</li>
                <li>Téléchargez ou ajoutez de nouveaux documents (admin/coach).</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">8. Événements</h3>
              <ul className="list-disc pl-6">
                <li>Consultez les événements à venir, inscrivez-vous ou créez-en de nouveaux (admin/coach).</li>
                <li>Suivez la liste des participants et les détails de chaque événement.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">9. Statistiques</h3>
              <ul className="list-disc pl-6">
                <li>Visualisez les graphiques d'insertion, de répartition des rôles, d'évolution mensuelle, etc.</li>
                <li>Consultez les insights et recommandations pour améliorer la plateforme.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">10. Profil utilisateur</h3>
              <ul className="list-disc pl-6">
                <li>Modifiez vos informations personnelles et votre mot de passe depuis la page Profil.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 