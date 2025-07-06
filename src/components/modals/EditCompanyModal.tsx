// src/components/modals/EditCompanyModal.tsx
import React, { useState, useEffect } from 'react';
import { Company, CompanyFormData } from '../../types'; // Assurez-vous d'avoir CompanyFormData dans types.ts
import { companyService } from '../../services/api'; // Votre service API pour les requêtes
import toast from 'react-hot-toast';
import { format } from 'date-fns'; // Pour formater les dates

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUpdateSuccess: () => void; // Pour rafraîchir la liste après mise à jour
}

// Options pour la taille de l'entreprise
const sizeOptions = [
  { value: 'tpe', label: 'TPE (Très Petite Entreprise)' },
  { value: 'pme', label: 'PME (Petite et Moyenne Entreprise)' },
  { value: 'eti', label: 'ETI (Entreprise de Taille Intermédiaire)' },
  { value: 'ge', label: 'Grande Entreprise' },
];

// Options pour le statut de partenariat
const statutOptions = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'en_discussion', label: 'En discussion' },
];

export function EditCompanyModal({ isOpen, onClose, company, onUpdateSuccess }: EditCompanyModalProps) {
  // État du formulaire, initialisé avec les valeurs de l'entreprise sélectionnée
  const [formData, setFormData] = useState<CompanyFormData>({
    nom_entreprise: '',
    taille_entreprise: 'tpe', // Valeur par défaut
    statut_partenariat: 'en_discussion', // Valeur par défaut
    // Initialisez tous les champs qui ne sont pas garantis d'être présents avec une valeur par défaut vide
    secteur_activite: '',
    adresse: '',
    ville: '',
    region: '',
    site_web: '',
    description: '',
    contact_rh_nom: '',
    contact_rh_email: '',
    contact_rh_phone: '',
    partenaire_depuis: '',
  });
  const [loading, setLoading] = useState(false); // État de chargement pour le bouton de soumission

  // Effet pour mettre à jour le formulaire lorsque l'entreprise sélectionnée change
  useEffect(() => {
    if (company) {
      setFormData({
        nom_entreprise: company.nom_entreprise || '',
        secteur_activite: company.secteur_activite || '',
        taille_entreprise: company.taille_entreprise,
        adresse: company.adresse || '',
        ville: company.ville || '',
        region: company.region || '',
        site_web: company.site_web || '',
        description: company.description || '',
        contact_rh_nom: company.contact_rh_nom || '',
        contact_rh_email: company.contact_rh_email || '',
        contact_rh_phone: company.contact_rh_phone || '',
        // Formatage de la date pour l'input de type 'date'
        // Si company.partenaire_depuis existe, on la formate. Sinon, on utilise une chaîne vide.
        partenaire_depuis: company.partenaire_depuis ? format(new Date(company.partenaire_depuis), 'yyyy-MM-dd') : '',
        statut_partenariat: company.statut_partenariat,
      });
    }
  }, [company]);

  // Si la modale n'est pas ouverte ou aucune entreprise n'est sélectionnée, ne rien afficher
  if (!isOpen || !company) return null;

  // Gère les changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!company || !company.id) {
      toast.error("Erreur: ID de l'entreprise manquant.");
      return;
    }

    setLoading(true); // Active l'état de chargement
    try {
      // Crée une copie des données du formulaire pour la modification
      const dataToUpdate = { ...formData };

      // --- CORRECTION CLÉ ICI ---
      // Si `partenaire_depuis` est une chaîne vide, la convertir en `null`
      // car votre backend s'attend probablement à `null` ou à une date valide,
      // et non à une chaîne vide, pour un champ optionnel avec validation de date.
      if (dataToUpdate.partenaire_depuis === '') {
        (dataToUpdate as any).partenaire_depuis = null; // Cast pour permettre l'assignation de null si votre type CompanyFormData ne le permet pas directement
      }
      // --- FIN DE LA CORRECTION CLÉ ---

      await companyService.update(company.id, dataToUpdate); // Utilisez dataToUpdate
      toast.success('Profil entreprise mis à jour avec succès !');
      onUpdateSuccess(); // Appel de la fonction de succès pour rafraîchir la liste
      onClose(); // Ferme la modale
    } catch (error: any) {
      console.error("Erreur complète lors de la mise à jour de l'entreprise:", error);
      console.error("Détails de l'erreur du serveur:", error.response?.data); // Log les détails pour un meilleur diagnostic

      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour du profil de l\'entreprise.';

      if (error.response && error.response.data && error.response.data.errors) {
         // Afficher les erreurs de validation spécifiques du backend
         error.response.data.errors.forEach((err: any) => {
           toast.error(`${err.param}: ${err.msg}`);
         });
      } else {
         toast.error(errorMessage);
      }
    } finally {
      setLoading(false); // Désactive l'état de chargement
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Éditer le profil de {company.nom_entreprise}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Informations générales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                <input type="text" name="nom_entreprise" id="nom_entreprise" value={formData.nom_entreprise} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="secteur_activite" className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
                <input type="text" name="secteur_activite" id="secteur_activite" value={formData.secteur_activite || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="taille_entreprise" className="block text-sm font-medium text-gray-700">Taille de l'entreprise</label>
                <select name="taille_entreprise" id="taille_entreprise" value={formData.taille_entreprise} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  {sizeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
               <div>
                <label htmlFor="site_web" className="block text-sm font-medium text-gray-700">Site Web</label>
                <input type="url" name="site_web" id="site_web" value={formData.site_web || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="https://www.exemple.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Décrivez l'entreprise et ses activités..."
              ></textarea>
            </div>
          </div>

          {/* Section Coordonnées */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Coordonnées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                <input type="text" name="adresse" id="adresse" value={formData.adresse || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                <input type="text" name="ville" id="ville" value={formData.ville || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Région</label>
                <input type="text" name="region" id="region" value={formData.region || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section Contact RH */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Contact RH</h3>
            <p className="text-sm text-gray-600 mb-4">Ces informations sont spécifiques au contact des ressources humaines de l'entreprise, non pas le contact principal du compte.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_rh_nom" className="block text-sm font-medium text-gray-700">Nom du contact RH</label>
                <input type="text" name="contact_rh_nom" id="contact_rh_nom" value={formData.contact_rh_nom || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact_rh_email" className="block text-sm font-medium text-gray-700">Email du contact RH</label>
                <input type="email" name="contact_rh_email" id="contact_rh_email" value={formData.contact_rh_email || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact_rh_phone" className="block text-sm font-medium text-gray-700">Téléphone du contact RH</label>
                <input type="text" name="contact_rh_phone" id="contact_rh_phone" value={formData.contact_rh_phone || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section Statut Partenariat */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Statut du partenariat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="statut_partenariat" className="block text-sm font-medium text-gray-700">Statut du partenariat</label>
                <select name="statut_partenariat" id="statut_partenariat" value={formData.statut_partenariat} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  {statutOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="partenaire_depuis" className="block text-sm font-medium text-gray-700">Partenaire depuis</label>
                <input type="date" name="partenaire_depuis" id="partenaire_depuis" value={formData.partenaire_depuis || ''} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
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