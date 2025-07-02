import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search,  Plus, Eye, Edit, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { learnerService } from '../services/api';
import { LearnerDetailsModal } from '../components/modals/LearnerDetailsModal';
import { EditLearnerModal } from '../components/modals/EditLearnerModal';
import toast from 'react-hot-toast';
import { Learner } from '../types';

const statusColors = {
  'en_recherche': 'bg-yellow-100 text-yellow-800',
  'en_emploi': 'bg-green-100 text-green-800',
  'en_stage': 'bg-blue-100 text-blue-800',
  'en_formation': 'bg-purple-100 text-purple-800',
  'autre': 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  'en_recherche': 'En recherche',
  'en_emploi': 'En emploi',
  'en_stage': 'En stage',
  'en_formation': 'En formation',
  'autre': 'Autre'
};

export function LearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      const response = await learnerService.getAll();
      setLearners(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des apprenants');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (learner: Learner) => {
    setSelectedLearner(learner);
    setShowDetailsModal(true);
  };

  const handleEditLearner = (learner: Learner) => {
    setSelectedLearner(learner);
    setShowEditModal(true);
  };

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = 
      learner.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.promotion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || learner.statut_insertion === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInsertionStats = () => {
    const total = learners.length;
    const inserted = learners.filter(l => ['en_emploi', 'en_stage'].includes(l.statut_insertion)).length;
    const rate = total > 0 ? Math.round((inserted / total) * 100) : 0;
    
    return { total, inserted, rate };
  };

  const stats = getInsertionStats();

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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apprenants</h1>
            <p className="text-gray-600 mt-1">
              Gestion des profils et suivi de l'insertion professionnelle
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un apprenant</span>
          </motion.button>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total apprenants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-gray-600">Insérés</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inserted}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-gray-600">Taux d'insertion</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rate}%</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-gray-600">En recherche</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {learners.filter(l => l.statut_insertion === 'en_recherche').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou promotion..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des apprenants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apprenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLearners.map((learner, index) => (
                  <motion.tr
                    key={learner.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {learner.user?.first_name} {learner.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{learner.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {learner.promotion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {learner.formation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[learner.statut_insertion as keyof typeof statusColors] || statusColors.autre
                      }`}>
                        {statusLabels[learner.statut_insertion as keyof typeof statusLabels] || 'Autre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {learner.ville && learner.region ? `${learner.ville}, ${learner.region}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDetails(learner)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditLearner(learner)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLearners.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun apprenant trouvé</p>
            </div>
          )}
        </motion.div>

        {/* Modales */}
        <LearnerDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          learner={selectedLearner}
        />

        <EditLearnerModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          learner={selectedLearner}
        />
      </div>
    </Layout>
  );
}