import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MapPin, Clock, Building2, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { jobService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateJobModal } from '../components/modals/CreateJobModal';
import { JobDetailsModal } from '../components/modals/JobDetailsModal';
import toast from 'react-hot-toast';

interface JobOffer {
  id: number;
  titre: string;
  type_contrat: string;
  description: string;
  ville: string;
  region: string;
  salaire_min: number;
  salaire_max: number;
  date_publication: string;
  statut: string;
  nom_entreprise: string;
  secteur_activite: string;
}

const contractColors = {
  'cdi': 'bg-green-100 text-green-800',
  'cdd': 'bg-blue-100 text-blue-800',
  'stage': 'bg-purple-100 text-purple-800',
  'freelance': 'bg-orange-100 text-orange-800',
  'apprentissage': 'bg-yellow-100 text-yellow-800'
};

const contractLabels = {
  'cdi': 'CDI',
  'cdd': 'CDD',
  'stage': 'Stage',
  'freelance': 'Freelance',
  'apprentissage': 'Apprentissage'
};

export function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter, contractFilter]);

  const loadJobs = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (contractFilter) params.type_contrat = contractFilter;
      
      const response = await jobService.getAll(params);
      setJobs(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des offres d\'emploi');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: number) => {
    try {
      await jobService.apply(jobId, {});
      toast.success('Candidature envoyée avec succès !');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la candidature');
    }
  };

  const handleViewDetails = (jobId: number) => {
    setSelectedJobId(jobId);
    setShowDetailsModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Offres d'emploi</h1>
            <p className="text-gray-600 mt-1">
              Découvrez les opportunités professionnelles
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'coach' || user?.role === 'entreprise') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publier une offre</span>
            </motion.button>
          )}
        </motion.div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total offres</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
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
                <p className="text-sm font-medium text-gray-600">Offres actives</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter(j => j.statut === 'active').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
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
                <p className="text-sm font-medium text-gray-600">CDI</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter(j => j.type_contrat === 'cdi').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
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
                <p className="text-sm font-medium text-gray-600">Stages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter(j => j.type_contrat === 'stage').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tous les contrats</option>
                {Object.entries(contractLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="active">Offres actives</option>
                <option value="">Toutes les offres</option>
                <option value="fermee">Offres fermées</option>
                <option value="pourvue">Offres pourvues</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des offres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {job.titre}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{job.nom_entreprise}</span>
                    {job.secteur_activite && (
                      <>
                        <span>•</span>
                        <span>{job.secteur_activite}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {(job.ville || job.region) && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.ville && job.region ? `${job.ville}, ${job.region}` : job.ville || job.region}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(job.date_publication), 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  contractColors[job.type_contrat as keyof typeof contractColors] || contractColors.cdi
                }`}>
                  {contractLabels[job.type_contrat as keyof typeof contractLabels] || job.type_contrat}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              {(job.salaire_min || job.salaire_max) && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-900">
                    Salaire: {job.salaire_min && job.salaire_max 
                      ? `${job.salaire_min.toLocaleString()} - ${job.salaire_max.toLocaleString()} FCFA`
                      : job.salaire_min 
                        ? `À partir de ${job.salaire_min.toLocaleString()} FCFA`
                        : `Jusqu'à ${job.salaire_max?.toLocaleString()} FCFA`
                    }
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewDetails(job.id)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </motion.button>

                {user?.role === 'apprenant' && job.statut === 'active' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApply(job.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Postuler
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600">
              Aucune offre d'emploi ne correspond à vos critères de recherche.
            </p>
          </motion.div>
        )}

        {/* Modals */}
        <CreateJobModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadJobs}
        />

        <JobDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          jobId={selectedJobId}
        />
      </div>
    </Layout>
  );
}