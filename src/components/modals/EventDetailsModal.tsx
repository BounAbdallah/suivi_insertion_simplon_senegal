import { Event } from '../../types';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  // Labels pour les types et statuts
  const eventTypeLabels: Record<string, string> = {
    'atelier': 'Atelier',
    'visite_entreprise': "Visite d'entreprise",
    'job_dating': 'Job dating',
    'conference': 'Conférence',
    'formation': 'Formation',
    'autre': 'Autre',
  };
  const statusLabels: Record<string, string> = {
    'planifie': 'Planifié',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Détails de l'événement</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{event.titre}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {eventTypeLabels[event.type_evenement] || event.type_evenement}
              </span>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                {statusLabels[event.statut] || event.statut}
              </span>
            </div>
            {event.description && (
              <p className="text-gray-700 mb-2 whitespace-pre-line">{event.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(event.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                {event.date_fin && (
                  <> - {format(new Date(event.date_fin), 'HH:mm', { locale: fr })}</>
                )}
              </span>
            </div>
            {event.lieu && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{event.lieu}</span>
              </div>
            )}
            {event.animateur && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Animé par {event.animateur}</span>
              </div>
            )}
            {event.capacite_max && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Capacité max : {event.capacite_max}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {event.participants?.length || 0} participant{(event.participants?.length || 0) > 1 ? 's' : ''}
                {event.capacite_max && ` / ${event.capacite_max} max`}
              </span>
            </div>
          </div>

          {/* Créateur */}
          {event.created_by_user && (
            <div className="text-sm text-gray-500 mt-2">
              Créé par : {event.created_by_user.first_name} {event.created_by_user.last_name}
            </div>
          )}

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Participants</h4>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium">Nom</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.participants.map((p: any) => (
                      <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                        <td className="px-3 py-1">{p.first_name} {p.last_name}</td>
                        <td className="px-3 py-1">{p.email}</td>
                        <td className="px-3 py-1">{p.statut_participation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
} 