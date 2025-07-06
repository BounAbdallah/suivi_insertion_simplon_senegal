// src/components/modals/CompanyDetailsModal.tsx
import { Company } from '../../types';
import { Building2, Globe, Mail, Phone, MapPin, Users, CalendarDays, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Assurez-vous d'avoir date-fns et locale installés

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

const partnershipLabels = {
  'actif': 'Actif',
  'inactif': 'Inactif',
  'en_discussion': 'En discussion'
};

const partnershipColors = {
  'actif': 'bg-green-100 text-green-800',
  'inactif': 'bg-red-100 text-red-800',
  'en_discussion': 'bg-yellow-100 text-yellow-800'
};

const sizeLabels = {
  'tpe': 'Très Petite Entreprise (TPE)',
  'pme': 'Petite et Moyenne Entreprise (PME)',
  'eti': 'Entreprise de Taille Intermédiaire (ETI)',
  'ge': 'Grande Entreprise (GE)'
};

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
  if (!isOpen || !company) return null;

  const formattedPartnerDepuis = company.partenaire_depuis
    ? format(new Date(company.partenaire_depuis), 'dd MMMM yyyy', { locale: fr })
    : 'Non renseigné';

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

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">{company.nom_entreprise || 'Nom de l\'entreprise non renseigné'}</h2>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            partnershipColors[company.statut_partenariat] || 'bg-gray-100 text-gray-800'
          }`}>
            {partnershipLabels[company.statut_partenariat] || 'Statut inconnu'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Informations générales</h3>
            <p className="flex items-center text-gray-700">
              <ClipboardCheck className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Secteur d'activité :</span> {company.secteur_activite || 'Non renseigné'}
            </p>
            <p className="flex items-center text-gray-700">
              <Users className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Taille de l'entreprise :</span> {sizeLabels[company.taille_entreprise] || 'Non renseignée'}
            </p>
            <p className="flex items-center text-gray-700">
              <CalendarDays className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Partenaire depuis :</span> {formattedPartnerDepuis}
            </p>
            <p className="text-gray-700">
              <span className="font-medium block mb-1">Description :</span>
              {company.description || 'Aucune description fournie.'}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Coordonnées</h3>
            <p className="flex items-start text-gray-700">
              <MapPin className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-1" />
              <span className="font-medium">Adresse :</span> {company.adresse || 'Non renseignée'}
            </p>
            <p className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Ville :</span> {company.ville || 'Non renseignée'}
            </p>
            <p className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Région :</span> {company.region || 'Non renseignée'}
            </p>
            {company.site_web && (
              <p className="flex items-center text-gray-700">
                <Globe className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="font-medium">Site Web :</span>
                <a href={company.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  {company.site_web}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Contact RH</h3>
          <p className="flex items-center text-gray-700">
            <Users className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="font-medium">Nom du contact RH :</span> {company.contact_rh_nom || 'Non renseigné'}
          </p>
          {company.contact_rh_email && (
            <p className="flex items-center text-gray-700">
              <Mail className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Email RH :</span>
              <a href={`mailto:${company.contact_rh_email}`} className="text-blue-600 hover:underline ml-1">
                {company.contact_rh_email}
              </a>
            </p>
          )}
          {company.contact_rh_phone && (
            <p className="flex items-center text-gray-700">
              <Phone className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Téléphone RH :</span>
              <a href={`tel:${company.contact_rh_phone}`} className="text-blue-600 hover:underline ml-1">
                {company.contact_rh_phone}
              </a>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}