import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, MapPin, Clock, DollarSign, Users, Send } from 'lucide-react';
import { jobService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | null;
}

export function JobDetailsModal({ isOpen, onClose, jobId }: JobDetailsModalProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');

  useEffect(() => {
    if (isOpen && jobId) {
      loadJobDetails();
    }
  }, [isOpen, jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const response = await jobService.getById(jobId);
      setJob(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) return;
    
    setApplying(true);
    try {
      await jobService.apply(jobId, { message_motivation: motivationMessage });
      toast.success('Candidature envoyée avec succès !');
      setMotivationMessage('');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la candidature');
    } finally {
      setApplying(false);
    }
  };

  const handleApplicationStatusUpdate = async (appId: number, status: string) => {
    if (!jobId) return;
    
    try {
      await jobService.updateApplication(jobId, appId, { statut: status });
      toast.success('Statut mis à jour');
      loadJobDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (!isOpen || !job) return null;

  const contractLabels = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'stage': 'Stage',
    'freelance': 'Freelance',
    'apprentissage': 'Apprentissage'
  };

  const statusColors = {
    'en_attente': 'bg-yellow-100 text-yellow-800',
    'vue': 'bg-blue-100 text-blue-800',
    'entretien': 'bg-purple-100 text-purple-800',
    'acceptee': 'bg-green-100 text-green-800',
    'refusee': 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    'en_attente': 'En attente',
    'vue': 'Vue',
    'entretien': 'Entretien',
    'acceptee': 'Acceptée',
    'refusee': 'Refusée'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{job.titre}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{job.nom_entreprise}</p>
                    {job.secteur_activite && (
                      <p className="text-sm text-gray-600">{job.secteur_activite}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {job.ville && job.region ? `${job.ville}, ${job.region}` : job.ville || job.region || 'Non spécifié'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {contractLabels[job.type_contrat as keyof typeof contractLabels] || job.type_contrat}
                  </span>
                </div>

                {(job.salaire_min || job.salaire_max) && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {job.salaire_min && job.salaire_max 
                        ? `${job.salaire_min.toLocaleString()} - ${job.salaire_max.toLocaleString()} FCFA`
                        : job.salaire_min 
                          ? `À partir de ${job.salaire_min.toLocaleString()} FCFA`
                          : `Jusqu'à ${job.salaire_max?.toLocaleString()} FCFA`
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Publié le</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(job.date_publication), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>

                {job.date_expiration && (
                  <div>
                    <p className="text-sm text-gray-600">Expire le</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(job.date_expiration), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Nombre de postes</p>
                  <p className="font-medium text-gray-900">{job.nb_postes || 1}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description du poste</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Compétences requises */}
            {job.competences_requises && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Compétences requises</h3>
                <p className="text-gray-700 whitespace-pre-line">{job.competences_requises}</p>
              </div>
            )}

            {/* Expérience requise */}
            {job.experience_requise && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expérience requise</h3>
                <p className="text-gray-700">{job.experience_requise}</p>
              </div>
            )}

            {/* Candidature pour les apprenants */}
            {user?.role === 'apprenant' && job.statut === 'active' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Postuler à cette offre</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message de motivation (optionnel)
                    </label>
                    <textarea
                      value={motivationMessage}
                      onChange={(e) => setMotivationMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
                    />
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex items-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{applying ? 'Envoi...' : 'Envoyer ma candidature'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Candidatures pour les entreprises/admins */}
            {(user?.role === 'admin' || user?.role === 'coach' || user?.role === 'entreprise') && job.applications && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Candidatures ({job.applications.length})
                </h3>
                {job.applications.length === 0 ? (
                  <p className="text-gray-600">Aucune candidature pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {job.applications.map((application: any) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {application.first_name} {application.last_name}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusColors[application.statut as keyof typeof statusColors] || statusColors.en_attente
                              }`}>
                                {statusLabels[application.statut as keyof typeof statusLabels] || application.statut}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{application.email}</p>
                            {application.promotion && (
                              <p className="text-sm text-gray-600 mb-2">Promotion: {application.promotion}</p>
                            )}
                            {application.message_motivation && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">Message de motivation:</p>
                                <p className="text-sm text-gray-600 mt-1">{application.message_motivation}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Candidature envoyée le {format(new Date(application.date_candidature), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                          
                          {(user?.role === 'admin' || user?.role === 'coach' || user?.role === 'entreprise') && (
                            <div className="flex space-x-2 ml-4">
                              <select
                                value={application.statut}
                                onChange={(e) => handleApplicationStatusUpdate(application.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="en_attente">En attente</option>
                                <option value="vue">Vue</option>
                                <option value="entretien">Entretien</option>
                                <option value="acceptee">Acceptée</option>
                                <option value="refusee">Refusée</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}