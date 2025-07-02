import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, Learner, Company, JobOffer, Event, Document, 
  LearnerFormData, CompanyFormData, JobOfferFormData, EventFormData, DocumentFormData,
  InsertionTrackingFormData, DashboardStats 
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Une erreur s\'est produite';
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    } else if (error.response?.status !== 400) {
      // Afficher les erreurs sauf les erreurs de validation (400)
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  verify: () =>
    api.get('/auth/verify')
};

// Services utilisateurs
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  updateStatus: (id: number, is_active: boolean) => 
    api.patch(`/users/${id}/status`, { is_active })
};

// Services apprenants
export const learnerService = {
  getAll: () => api.get<Learner[]>('/learners'),
  getById: (id: number) => api.get<Learner>(`/learners/${id}`),
  update: (id: number, data: LearnerFormData) => api.put(`/learners/${id}`, data),
  addTracking: (id: number, data: InsertionTrackingFormData) => api.post(`/learners/${id}/tracking`, data)
};

// Services entreprises
export const companyService = {
  getAll: () => api.get<Company[]>('/companies'),
  getById: (id: number) => api.get<Company>(`/companies/${id}`),
  update: (id: number, data: CompanyFormData) => api.put(`/companies/${id}`, data),
  getStats: (id: number) => api.get(`/companies/${id}/stats`)
};

// Services offres d'emploi
export const jobService = {
  getAll: (params?: any) => api.get<JobOffer[]>('/jobs', { params }),
  getById: (id: number) => api.get<JobOffer>(`/jobs/${id}`),
  create: (data: JobOfferFormData) => api.post('/jobs', data),
  update: (id: number, data: JobOfferFormData) => api.put(`/jobs/${id}`, data),
  apply: (id: number, data: { message_motivation?: string }) => api.post(`/jobs/${id}/apply`, data),
  updateApplication: (jobId: number, appId: number, data: { statut: string; commentaires?: string }) =>
    api.patch(`/jobs/${jobId}/applications/${appId}`, data),
  getApplications: (jobId: number) => api.get(`/jobs/${jobId}/applications`)
};

// Services événements
export const eventService = {
  getAll: (params?: any) => api.get<Event[]>('/events', { params }),
  getById: (id: number) => api.get<Event>(`/events/${id}`),
  create: (data: EventFormData) => api.post('/events', data),
  update: (id: number, data: EventFormData) => api.put(`/events/${id}`, data),
  register: (id: number, data?: any) => api.post(`/events/${id}/register`, data),
  updateParticipant: (eventId: number, participantId: number, data: any) =>
    api.patch(`/events/${eventId}/participants/${participantId}`, data),
  getParticipants: (eventId: number) => api.get(`/events/${eventId}/participants`)
};

// Services documents
export const documentService = {
  getAll: (params?: any) => api.get<Document[]>('/documents', { params }),
  getById: (id: number) => api.get<Document>(`/documents/${id}`),
  upload: (formData: FormData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: number, data: DocumentFormData) => api.put(`/documents/${id}`, data),
  download: (id: number) => api.get(`/documents/${id}/download`, {
    responseType: 'blob'
  }),
  delete: (id: number) => api.delete(`/documents/${id}`)
};

// Services statistiques
export const statsService = {
  getDashboard: () => api.get<DashboardStats>('/stats/dashboard'),
  getInsertion: (period?: string) => api.get('/stats/insertion', { 
    params: { period } 
  }),
  getCompanies: () => api.get('/stats/companies'),
  getLearners: () => api.get('/stats/learners'),
  getJobs: () => api.get('/stats/jobs'),
  getEvents: () => api.get('/stats/events')
};

// Services de suivi d'insertion
export const insertionTrackingService = {
  getAll: (learnerId?: number) => api.get('/insertion-tracking', { 
    params: { learner_id: learnerId } 
  }),
  create: (data: InsertionTrackingFormData & { learner_id: number }) => 
    api.post('/insertion-tracking', data),
  update: (id: number, data: InsertionTrackingFormData) => 
    api.put(`/insertion-tracking/${id}`, data),
  delete: (id: number) => api.delete(`/insertion-tracking/${id}`)
};