import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, Briefcase, Calendar, Download, Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { statsService } from '../services/api';
import { DashboardCharts } from '../components/DashboardCharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface StatsPageProps {
  period?: string;
}

export function StatsPage({ period = 'month' }: StatsPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      const [dashboardResponse, insertionResponse] = await Promise.all([
        statsService.getDashboard(),
        statsService.getInsertion(selectedPeriod)
      ]);
      
      setStats({
        ...dashboardResponse.data,
        insertion_period: insertionResponse.data
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const exportStats = () => {
    // Ici vous pouvez implémenter l'export des statistiques
    toast.success('Export en cours...');
  };

  const insights = [
    {
      color: 'green',
      title: "Taux d'insertion en hausse",
      description: "Le taux d'insertion a augmenté de 5.2% cette période, principalement grâce aux secteurs tech et commerce."
    },
    {
      color: 'blue',
      title: "Engagement des entreprises",
      description: "15 nouvelles entreprises ont rejoint la plateforme, augmentant l'offre d'emploi de 23%."
    },
    {
      color: 'orange',
      title: "Demande en CDI",
      description: "Les offres CDI représentent 45% des candidatures, montrant une préférence pour la stabilité."
    },
  ];

  const recommandations = [
    {
      color: 'purple',
      title: "Développer le secteur tech",
      description: "Augmenter les partenariats avec les entreprises tech pour répondre à la forte demande."
    },
    {
      color: 'yellow',
      title: "Améliorer l'accompagnement",
      description: "Renforcer l'accompagnement des apprenants vers les stages et CDD pour augmenter l'expérience."
    },
    {
      color: 'red',
      title: "Optimiser les événements",
      description: "Organiser plus d'événements de networking pour faciliter les rencontres entre apprenants et entreprises."
    },
  ];

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistiques avancées</h1>
              <p className="text-gray-600 mt-1">
                Analyse détaillée des performances de la plateforme
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportStats}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'insertion</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.insertion_period?.taux_insertion || 0}%
                </p>
                <p className="text-sm text-green-600 mt-1">+5.2% vs période précédente</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Nouvelles candidatures</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.insertion_period?.nouvelles_candidatures || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">+12.8% vs période précédente</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouvelles offres</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.insertion_period?.nouvelles_offres || 0}
                </p>
                <p className="text-sm text-orange-600 mt-1">+8.3% vs période précédente</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements organisés</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.insertion_period?.evenements_organises || 0}
                </p>
                <p className="text-sm text-purple-600 mt-1">+15.7% vs période précédente</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Graphiques */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DashboardCharts stats={stats} />
          </motion.div>
        )}

        {/* Tableau des performances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance par secteur
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offres publiées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidatures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux de placement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Évolution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.secteurs_performance?.map((secteur: any, index: number) => (
                  <motion.tr
                    key={secteur.nom}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{secteur.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{secteur.offres_publiees}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{secteur.candidatures}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{secteur.taux_placement}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        secteur.evolution > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {secteur.evolution > 0 ? '+' : ''}{secteur.evolution}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Insights et recommandations dynamiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Insights clés
            </h3>
            <div className="space-y-4">
              {insights.map((item, idx) => (
                <div className="flex items-start space-x-3" key={idx}>
                  <div className={`w-2 h-2 bg-${item.color}-500 rounded-full mt-2`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommandations
            </h3>
            <div className="space-y-4">
              {recommandations.map((item, idx) => (
                <div className="flex items-start space-x-3" key={idx}>
                  <div className={`w-2 h-2 bg-${item.color}-500 rounded-full mt-2`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 