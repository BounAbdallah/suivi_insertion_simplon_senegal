import React from 'react';
import { User } from '../../types';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-2xl font-bold">{user.first_name[0]}{user.last_name[0]}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.first_name} {user.last_name}</h2>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mb-2">{user.role}</span>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-gray-600"><b>Email :</b> {user.email}</div>
          {user.phone && <div className="text-gray-600"><b>Téléphone :</b> {user.phone}</div>}
          <div className="text-gray-600"><b>Statut :</b> {user.is_active ? 'Actif' : 'Inactif'}</div>
          <div className="text-gray-600"><b>Date de création :</b> {new Date(user.created_at).toLocaleString()}</div>
          {user.hasOwnProperty('additional_info') && (
            <div className="text-gray-600"><b>Info supplémentaire :</b> {(user as any).additional_info || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
} 