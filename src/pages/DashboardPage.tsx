import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Calendar,
  TrendingUp,
  UserCheck,
  Target,
  
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { statsService } from '../services/api';
import { DashboardCharts } from '../components/DashboardCharts';

interface DashboardStats {
  users: Array<{ role: string; count: number; active_count: number }>;
  insertion: Array<{ statut_insertion: string; count: number }>;
  jobs: Array<{ statut: string; count: number }>;
  applications: Array<{ statut: string; count: number }>;
  events: Array<{ statut: string; count: number }>;
  monthly_insertions: Array<{ month: string; nouveau_statut: string; count: number }>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'coach') {
        const response = await statsService.getDashboard();
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatCards = () => {
    if (!stats) return [];

    const totalUsers = stats.users.reduce((sum, item) => sum + item.count, 0);
    const totalLearners = stats.users.find(u => u.role === 'apprenant')?.count || 0;
    const totalCompanies = stats.users.find(u => u.role === 'entreprise')?.count || 0;
    const totalJobs = stats.jobs.reduce((sum, item) => sum + item.count, 0);
    const insertedLearners = stats.insertion.filter(i => 
      ['en_emploi', 'en_stage'].includes(i.statut_insertion)
    ).reduce((sum, item) => sum + item.count, 0);

    const insertionRate = totalLearners > 0 ? Math.round((insertedLearners / totalLearners) * 100) : 0;

    return [
      {
        title: 'Total Utilisateurs',
        value: totalUsers,
        icon: Users,
        color: 'bg-blue-500',
        // change: '+12%'
      },
      {
        title: 'Apprenants',
        value: totalLearners,
        icon: UserCheck,
        color: 'bg-green-500',
        // change: '+8%'
      },
      {
        title: 'Entreprises',
        value: totalCompanies,
        icon: Building2,
        color: 'bg-purple-500',
        // change: '+15%'
      },
      {
        title: 'Offres d\'emploi',
        value: totalJobs,
        icon: Briefcase,
        color: 'bg-orange-500',
        // change: '+23%'
      },
      {
        title: 'Taux d\'insertion',
        value: `${insertionRate}%`,
        icon: Target,
        color: 'bg-red-500',
        // change: '+5%'
      }
    ];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.first_name}, voici un aperçu de la plateforme Simplon.
          </p>
        </motion.div>

        {/* Cartes de statistiques */}
        {(user?.role === 'admin' || user?.role === 'coach') && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {getStatCards().map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Graphiques Chart.js */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <DashboardCharts stats={stats} />
            </motion.div>
          </>
        )}

        {/* Vue spécifique pour les apprenants */}
        {user?.role === 'apprenant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Mon profil</h3>
                  <p className="text-sm opacity-90 mt-1">Gérer mes informations</p>
                </div>
                <UserCheck className="w-8 h-8" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Offres d'emploi</h3>
                  <p className="text-sm text-gray-600 mt-1">Découvrir les opportunités</p>
                </div>
                <Briefcase className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Événements</h3>
                  <p className="text-sm text-gray-600 mt-1">Participer aux ateliers</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Vue spécifique pour les entreprises */}
        {user?.role === 'entreprise' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mes offres d'emploi</h3>
                <Briefcase className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600 mt-1">Offres publiées</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Candidatures reçues</h3>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600 mt-1">En attente de traitement</p>
            </motion.div>
          </div>
        )}

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user?.role === 'admin' && (
              <>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Gérer les utilisateurs</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Voir les rapports</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Créer un événement</span>
                </button>
              </>
            )}
            
            {user?.role === 'apprenant' && (
              <>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Rechercher un emploi</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="font-medium">S'inscrire à un événement</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Mettre à jour mon profil</span>
                </button>
              </>
            )}

            {user?.role === 'entreprise' && (
              <>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Publier une offre</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Voir les candidatures</span>
                </button>
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Mettre à jour mon profil</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}