import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { eventService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateEventModal } from '../components/modals/CreateEventModal';
import { EventDetailsModal } from '../components/modals/EventDetailsModal';
import toast from 'react-hot-toast';
import { Event } from '../types';

const eventTypeColors = {
  'atelier': 'bg-blue-100 text-blue-800',
  'visite_entreprise': 'bg-green-100 text-green-800',
  'job_dating': 'bg-purple-100 text-purple-800',
  'conference': 'bg-orange-100 text-orange-800',
  'formation': 'bg-red-100 text-red-800',
  'autre': 'bg-gray-100 text-gray-800'
};

const eventTypeLabels = {
  'atelier': 'Atelier',
  'visite_entreprise': 'Visite d\'entreprise',
  'job_dating': 'Job dating',
  'conference': 'Conférence',
  'formation': 'Formation',
  'autre': 'Autre'
};

const statusColors = {
  'planifie': 'bg-yellow-100 text-yellow-800',
  'en_cours': 'bg-blue-100 text-blue-800',
  'termine': 'bg-green-100 text-green-800',
  'annule': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'planifie': 'Planifié',
  'en_cours': 'En cours',
  'termine': 'Terminé',
  'annule': 'Annulé'
};

export function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [typeFilter, statusFilter]);

  const loadEvents = async () => {
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await eventService.getAll(params);
      setEvents(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    try {
      await eventService.register(eventId);
      toast.success('Inscription réussie !');
      loadEvents(); // Recharger pour mettre à jour le nombre de participants
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.lieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.animateur?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.date_debut) > new Date() && event.statut === 'planifie'
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-600 mt-1">
              Ateliers, formations et événements de networking
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'coach') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un événement</span>
            </motion.button>
          )}
        </motion.div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total événements</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingEvents.length}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {events.filter(e => e.statut === 'termine').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participants total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {events.reduce((sum, event) => sum + (event.participants?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, lieu, animateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des événements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      eventTypeColors[event.type_evenement as keyof typeof eventTypeColors] || eventTypeColors.autre
                    }`}>
                      {eventTypeLabels[event.type_evenement as keyof typeof eventTypeLabels] || event.type_evenement}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[event.statut as keyof typeof statusColors] || statusColors.planifie
                    }`}>
                      {statusLabels[event.statut as keyof typeof statusLabels] || event.statut}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.titre}
                  </h3>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(event.date_debut), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    {event.date_fin && (
                      <> - {format(new Date(event.date_fin), 'HH:mm', { locale: fr })}</>
                    )}
                  </span>
                </div>
                
                {event.lieu && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.lieu}</span>
                  </div>
                )}

                {event.animateur && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Animé par {event.animateur}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.participants?.length || 0} participant{(event.participants?.length || 0) > 1 ? 's' : ''}
                    {event.capacite_max && ` / ${event.capacite_max} max`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewDetails(event)}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Voir détails
                </motion.button>

                {user?.role === 'apprenant' && 
                 event.statut === 'planifie' && 
                 new Date(event.date_debut) > new Date() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRegister(event.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    disabled={event.capacite_max !== undefined && (event.participants?.length || 0) >= event.capacite_max}
                  >
                    {event.capacite_max && (event.participants?.length || 0) >= event.capacite_max 
                      ? 'Complet' 
                      : 'S\'inscrire'
                    }
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600">
              Aucun événement ne correspond à vos critères de recherche.
            </p>
          </motion.div>
        )}

        {/* Modales */}
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadEvents}
        />

        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          event={selectedEvent}
        />
      </div>
    </Layout>
  );
}