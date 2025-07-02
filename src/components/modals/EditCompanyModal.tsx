import React from 'react';
import { Company } from '../../types';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export function EditCompanyModal({ isOpen, onClose, company }: EditCompanyModalProps) {
  if (!isOpen || !company) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Éditer l'entreprise</h2>
        <div className="space-y-2 text-center">
          <div className="text-gray-600"><b>Nom :</b> {company.nom_entreprise}</div>
          <div className="text-gray-600"><b>Secteur :</b> {company.secteur_activite || 'Non renseigné'}</div>
          <div className="text-gray-600"><b>Ville :</b> {company.ville || 'Non renseignée'}</div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all">Fermer</button>
      </div>
    </div>
  );
} 