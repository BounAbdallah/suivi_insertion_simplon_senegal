import React from 'react';
import { Learner } from '../../types';

interface EditLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
}

export function EditLearnerModal({ isOpen, onClose, learner }: EditLearnerModalProps) {
  if (!isOpen || !learner) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Éditer l'apprenant</h2>
        <div className="space-y-2 text-center">
          <div className="text-gray-600"><b>Nom :</b> {learner.user?.first_name} {learner.user?.last_name}</div>
          <div className="text-gray-600"><b>Promotion :</b> {learner.promotion || 'Non renseignée'}</div>
          <div className="text-gray-600"><b>Formation :</b> {learner.formation || 'Non renseignée'}</div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all">Fermer</button>
      </div>
    </div>
  );
} 