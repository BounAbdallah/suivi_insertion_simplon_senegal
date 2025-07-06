import React, { useState, useEffect } from 'react';
import { Learner, LearnerFormData } from '../../types';
import { learnerService } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface EditLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
  onUpdateSuccess: () => void;
}

export function EditLearnerModal({ isOpen, onClose, learner, onUpdateSuccess }: EditLearnerModalProps) {
  const [formData, setFormData] = useState<LearnerFormData>({
    statut_insertion: 'en_recherche',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (learner) {
      setFormData({
        promotion: learner.promotion || '',
        formation: learner.formation || '',
        date_debut: learner.date_debut ? format(new Date(learner.date_debut), 'yyyy-MM-dd') : '',
        date_fin: learner.date_fin ? format(new Date(learner.date_fin), 'yyyy-MM-dd') : '',
        competences: learner.competences || '',
        experience: learner.experience || '',
        adresse: learner.adresse || '',
        ville: learner.ville || '',
        region: learner.region || '',
        date_naissance: learner.date_naissance ? format(new Date(learner.date_naissance), 'yyyy-MM-dd') : '',
        genre: learner.genre || 'autre',
        niveau_etude: learner.niveau_etude || '',
        statut_insertion: learner.statut_insertion,
        // Ces champs ne doivent pas être modifiables directement ici
        email: learner.user?.email || '',
        phone: learner.user?.phone || '',
      });
    }
  }, [learner]);

  if (!isOpen || !learner) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learner || !learner.id) {
      toast.error("Erreur: ID de l'apprenant manquant.");
      return;
    }

    setLoading(true);
    try {
      // Créer une copie des données du formulaire pour les manipuler
      const dataToUpdate = { ...formData };

      // Supprimer les champs qui ne doivent pas être envoyés ou qui posent problème
      // L'email est désactivé et le backend gère sa propre logique de mise à jour d'utilisateur
      delete dataToUpdate.email;
      // Le téléphone est modifiable, mais si vous le désactivez aussi, supprimez-le ici
      // Si le téléphone est modifiable via le formulaire, ne le supprimez PAS.
      // delete dataToUpdate.phone; 

      await learnerService.update(learner.id, dataToUpdate); // Envoyer la copie nettoyée
      toast.success('Profil apprenant mis à jour avec succès !');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'apprenant:", error);
      // L'intercepteur Axios devrait déjà gérer les toasts pour les erreurs 400
      // mais un fallback est toujours bon.
      if (error.response && error.response.data && error.response.data.errors) {
         // Si le backend renvoie des erreurs de validation spécifiques
         error.response.data.errors.forEach((err: any) => {
           toast.error(`${err.param}: ${err.msg}`);
         });
      } else {
         toast.error('Erreur lors de la mise à jour du profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl leading-none font-bold"
          aria-label="Fermer"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Éditer le profil de {learner.user?.first_name} {learner.user?.last_name}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Informations de compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  disabled={true} // L'email est géré par l'utilisateur, pas par le profil de l'apprenant.
                />
                <p className="text-xs text-gray-500 mt-1">L'email n'est généralement pas modifiable directement ici.</p>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promotion" className="block text-sm font-medium text-gray-700">Promotion</label>
                <input
                  type="text"
                  name="promotion"
                  id="promotion"
                  value={formData.promotion || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="formation" className="block text-sm font-medium text-gray-700">Formation</label>
                <input
                  type="text"
                  name="formation"
                  id="formation"
                  value={formData.formation || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="date"
                  name="date_debut"
                  id="date_debut"
                  value={formData.date_debut || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="date"
                  name="date_fin"
                  id="date_fin"
                  value={formData.date_fin || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Coordonnées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  id="adresse"
                  value={formData.adresse || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  name="ville"
                  id="ville"
                  value={formData.ville || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Région</label>
                <input
                  type="text"
                  name="region"
                  id="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  name="date_naissance"
                  id="date_naissance"
                  value={formData.date_naissance || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
                <select
                  name="genre"
                  id="genre"
                  value={formData.genre || 'autre'}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="niveau_etude" className="block text-sm font-medium text-gray-700">Niveau d'étude</label>
                <input
                  type="text"
                  name="niveau_etude"
                  id="niveau_etude"
                  value={formData.niveau_etude || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Compétences & Expérience</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="competences" className="block text-sm font-medium text-gray-700">Compétences</label>
                <textarea
                  name="competences"
                  id="competences"
                  value={formData.competences || ''}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Liste des compétences, séparées par des virgules..."
                ></textarea>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Expérience</label>
                <textarea
                  name="experience"
                  id="experience"
                  value={formData.experience || ''}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Décrivez votre expérience professionnelle..."
                ></textarea>
              </div>
              <div>
                <label htmlFor="statut_insertion" className="block text-sm font-medium text-gray-700">Statut d'insertion</label>
                <select
                  name="statut_insertion"
                  id="statut_insertion"
                  value={formData.statut_insertion}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="en_recherche">En recherche</option>
                  <option value="en_emploi">En emploi</option>
                  <option value="en_stage">En stage</option>
                  <option value="en_formation">En formation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}