import React from 'react';
import { Company } from '../../types';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
  if (!isOpen || !company) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-2xl font-bold">{company.nom_entreprise[0]}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{company.nom_entreprise}</h2>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mb-2">{company.secteur_activite || 'Secteur inconnu'}</span>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-gray-600"><b>Adresse :</b> {company.adresse || 'Non renseignée'}</div>
          <div className="text-gray-600"><b>Ville :</b> {company.ville || 'Non renseignée'}</div>
          <div className="text-gray-600"><b>Statut partenariat :</b> {company.statut_partenariat}</div>
        </div>
      </div>
    </div>
  );
} 