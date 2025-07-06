// LearnerDetailsModal.tsx

import { Learner, InsertionTracking } from '../../types'; // Assurez-vous que vos types sont à jour
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LearnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
}

const statusLabels = {
  'en_recherche': 'En recherche',
  'en_emploi': 'En emploi',
  'en_stage': 'En stage',
  'en_formation': 'En formation',
  'autre': 'Autre'
};

const statusColors = {
  'en_recherche': 'bg-yellow-100 text-yellow-800',
  'en_emploi': 'bg-green-100 text-green-800',
  'en_stage': 'bg-blue-100 text-blue-800',
  'en_formation': 'bg-purple-100 text-purple-800',
  'autre': 'bg-gray-100 text-gray-800'
};

export function LearnerDetailsModal({ isOpen, onClose, learner }: LearnerDetailsModalProps) {
  if (!isOpen || !learner) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non renseignée';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM Carlyle', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de la date :', dateString, error);
      return 'Date invalide';
    }
  };

  const renderInfoRow = (label: string, value: string | undefined | null | boolean | number) => {
    let displayValue: string;
    if (typeof value === 'boolean') {
      displayValue = value ? 'Oui' : 'Non';
    } else if (value === null || value === undefined || value === '') {
      displayValue = 'Non renseigné';
    } else {
      displayValue = String(value);
    }
    return (
      <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600 font-medium">{label} :</span>
        <span className="text-gray-800">{displayValue}</span>
      </div>
    );
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

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-3">
            <span className="text-white text-3xl font-bold">
              {learner.user?.first_name ? learner.user.first_name[0] : ''}
              {learner.user?.last_name ? learner.user.last_name[0] : ''}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {learner.user?.first_name} {learner.user?.last_name}
          </h2>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            statusColors[learner.statut_insertion as keyof typeof statusColors] || statusColors.autre
          }`}>
            {statusLabels[learner.statut_insertion as keyof typeof statusLabels] || 'Autre'}
          </span>
        </div>

        {/* Coordonnées */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Coordonnées</h3>
          {renderInfoRow('Email', learner.user?.email)}
          {renderInfoRow('Téléphone', learner.user?.phone)}
          {renderInfoRow('Adresse', learner.adresse)}
          {renderInfoRow('Ville', learner.ville)}
          {renderInfoRow('Région', learner.region)}
        </div>

        {/* Informations sur la formation */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Formation & Carrière</h3>
          {renderInfoRow('Promotion', learner.promotion)}
          {renderInfoRow('Formation', learner.formation)}
          {renderInfoRow('Niveau d\'étude', learner.niveau_etude)}
          {renderInfoRow('Compétences', learner.competences)}
          {renderInfoRow('Expérience', learner.experience)}
          {renderInfoRow('Date de début', formatDate(learner.date_debut))}
          {renderInfoRow('Date de fin', formatDate(learner.date_fin))}
        </div>

        {/* Informations personnelles & Compte */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Informations Personnelles & Compte</h3>
          {renderInfoRow('Genre', learner.genre)}
          {renderInfoRow('Date de naissance', formatDate(learner.date_naissance))}
          {renderInfoRow('Rôle utilisateur', learner.user?.role)}
          {renderInfoRow('Compte actif', learner.user?.is_active)}
          {renderInfoRow('Compte créé le', formatDate(learner.user?.created_at))}
        </div>

        {/* Historique d'insertion */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Historique d'insertion</h3>
          {learner.insertion_history && learner.insertion_history.length > 0 ? (
            <div className="space-y-4">
              {learner.insertion_history.map((entry: InsertionTracking, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[entry.nouveau_statut as keyof typeof statusColors] || statusColors.autre
                    }`}>
                      {statusLabels[entry.nouveau_statut as keyof typeof statusLabels] || 'Autre'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    Passé de <span className="font-semibold">{statusLabels[entry.statut_precedent as keyof typeof statusColors] || 'N/A'}</span> à <span className="font-semibold">{statusLabels[entry.nouveau_statut as keyof typeof statusColors] || 'N/A'}</span>
                  </p>
                  {entry.entreprise && <p className="text-sm text-gray-700">Entreprise: <span className="font-medium">{entry.entreprise}</span></p>}
                  {entry.poste && <p className="text-sm text-gray-700">Poste: <span className="font-medium">{entry.poste}</span></p>}
                  {entry.type_contrat && <p className="text-sm text-gray-700">Type de contrat: <span className="font-medium">{entry.type_contrat}</span></p>}
                  {entry.salaire && <p className="text-sm text-gray-700">Salaire: <span className="font-medium">{entry.salaire}</span></p>}
                  {entry.date_debut && <p className="text-sm text-gray-700">Période: {formatDate(entry.date_debut)} {entry.date_fin ? `au ${formatDate(entry.date_fin)}` : ''}</p>}
                  {entry.commentaires && <p className="text-sm text-gray-700 mt-2">Commentaires: <span className="italic">{entry.commentaires}</span></p>}
                  {(entry.created_by_name || entry.created_by_lastname) && (
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      Mis à jour par {entry.created_by_name || ''} {entry.created_by_lastname || ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Aucun historique d'insertion disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
}