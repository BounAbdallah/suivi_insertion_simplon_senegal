import React from 'react';
import { Learner } from '../../types';

interface LearnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
}

export function LearnerDetailsModal({ isOpen, onClose, learner }: LearnerDetailsModalProps) {
  if (!isOpen || !learner) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-2xl font-bold">{learner.user?.first_name[0]}{learner.user?.last_name[0]}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{learner.user?.first_name} {learner.user?.last_name}</h2>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-2">{learner.statut_insertion}</span>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-gray-600"><b>Promotion :</b> {learner.promotion || 'Non renseignée'}</div>
          <div className="text-gray-600"><b>Formation :</b> {learner.formation || 'Non renseignée'}</div>
          <div className="text-gray-600"><b>Ville :</b> {learner.ville || 'Non renseignée'}</div>
        </div>
      </div>
    </div>
  );
} 