// types.ts

// Removed `import { ReactNode } from 'react';` as it was not used and not relevant for interface definitions here.

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'coach' | 'apprenant' | 'entreprise';
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Learner {
  id: number;
  user_id: number;
  promotion?: string;
  formation?: string;
  date_debut?: string;
  date_fin?: string;
  statut_insertion: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  cv_path?: string;
  competences?: string;
  experience?: string;
  adresse?: string;
  ville?: string;
  region?: string;
  date_naissance?: string;
  genre?: 'homme' | 'femme' | 'autre';
  niveau_etude?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user: User; // 'user' is correctly made mandatory as per your key modification
  insertion_history?: InsertionTracking[];
}

export interface Company {
  id: number;
  user_id: number;
  nom_entreprise: string;
  secteur_activite?: string;
  taille_entreprise: 'tpe' | 'pme' | 'eti' | 'ge';
  adresse?: string;
  ville?: string;
  region?: string;
  site_web?: string;
  description?: string;
  contact_rh_nom?: string;
  contact_rh_email?: string;
  contact_rh_phone?: string;
  partenaire_depuis?: string;
  statut_partenariat: 'actif' | 'inactif' | 'en_discussion';
  created_at: string;
  updated_at: string;
  // Relations
  user?: User; // Keeping optional as a company might not always have its user data directly nested
  job_offers?: JobOffer[];
}

export interface JobOffer {
  id: number;
  company_id: number;
  titre: string;
  type_contrat: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'apprentissage';
  description: string;
  competences_requises?: string;
  experience_requise?: string;
  salaire_min?: number;
  salaire_max?: number;
  ville?: string;
  region?: string;
  date_publication: string;
  date_expiration?: string;
  statut: 'active' | 'fermee' | 'pourvue';
  nb_postes: number;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
  applications?: Application[];
}

export interface Application {
  id: number;
  job_offer_id: number;
  learner_id: number;
  statut: 'en_attente' | 'vue' | 'entretien' | 'acceptee' | 'refusee';
  message_motivation?: string;
  date_candidature: string;
  date_reponse?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
  // Relations
  job_offer?: JobOffer;
  learner?: Learner;
}

export interface Event {
  id: number;
  titre: string;
  description?: string;
  type_evenement: 'atelier' | 'visite_entreprise' | 'job_dating' | 'conference' | 'formation' | 'autre';
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  capacite_max?: number;
  animateur?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Relations
  created_by_user?: User;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: number;
  event_id: number;
  learner_id: number;
  statut_participation: 'inscrit' | 'present' | 'absent' | 'excuse';
  date_inscription: string;
  commentaires?: string;
  // Relations
  event?: Event;
  learner?: Learner;
}

export interface Document {
  id: number;
  titre: string;
  description?: string;
  type_document: 'cv_template' | 'guide' | 'presentation' | 'rapport' | 'autre';
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: number;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  uploaded_by_user?: User;
}

export interface InsertionTracking {
  // Removed `[x: string]: ReactNode;` as it was incorrect for this context.
  id: number;
  learner_id: number;
  statut_precedent?: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  nouveau_statut: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  entreprise?: string;
  poste?: string;
  type_contrat?: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'apprentissage';
  salaire?: number;
  date_debut?: string;
  date_fin?: string;
  commentaires?: string;
  created_by?: number;
  created_at: string;
  // Relations (ajouts pour le frontend)
  created_by_name?: string;
  created_by_lastname?: string;
  learner?: Learner;
  created_by_user?: User;
}

// Form data interfaces for creating/updating entities
export interface LearnerFormData {
  promotion?: string;
  formation?: string;
  date_debut?: string;
  date_fin?: string;
  statut_insertion: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  competences?: string;
  experience?: string;
  adresse?: string;
  ville?: string;
  region?: string;
  date_naissance?: string;
  genre?: 'homme' | 'femme' | 'autre';
  niveau_etude?: string;
  email?: string; // Add email for learner updates
  phone?: string; // Add phone for learner updates
}

export interface CompanyFormData {
  nom_entreprise: string;
  secteur_activite?: string;
  taille_entreprise: 'tpe' | 'pme' | 'eti' | 'ge';
  adresse?: string;
  ville?: string;
  region?: string;
  site_web?: string;
  description?: string;
  contact_rh_nom?: string;
  contact_rh_email?: string;
  contact_rh_phone?: string;
  partenaire_depuis?: string;
  statut_partenariat: 'actif' | 'inactif' | 'en_discussion';
}

export interface JobOfferFormData {
  titre: string;
  type_contrat: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'apprentissage';
  description: string;
  competences_requises?: string;
  experience_requise?: string;
  salaire_min?: number;
  salaire_max?: number;
  ville?: string;
  region?: string;
  date_expiration?: string;
  nb_postes: number;
}

export interface EventFormData {
  titre: string;
  description?: string;
  type_evenement: 'atelier' | 'visite_entreprise' | 'job_dating' | 'conference' | 'formation' | 'autre';
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  capacite_max?: number;
  animateur?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
}

export interface DocumentFormData {
  titre: string;
  description?: string;
  type_document: 'cv_template' | 'guide' | 'presentation' | 'rapport' | 'autre';
  is_public?: boolean;
}

export interface InsertionTrackingFormData {
  nouveau_statut: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  entreprise?: string;
  poste?: string;
  type_contrat?: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'apprentissage';
  salaire?: number;
  date_debut?: string;
  date_fin?: string;
  commentaires?: string;
}

// Types for statistics
export interface DashboardStats {
  users: Array<{ role: string; count: number; active_count: number }>;
  insertion: Array<{ statut_insertion: string; count: number }>;
  jobs: Array<{ statut: string; count: number }>;
  applications: Array<{ statut: string; count: number }>;
  events: Array<{ statut: string; count: number }>;
  monthly_insertions: Array<{ month: string; nouveau_statut: string; count: number }>;
}