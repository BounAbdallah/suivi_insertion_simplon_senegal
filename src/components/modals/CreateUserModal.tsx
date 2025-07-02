import  { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateUserForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'coach' | 'apprenant' | 'entreprise';
  is_active: boolean;
  promotion?: string;
  formation?: string;
  date_debut?: string;
  date_fin?: string;
  statut_insertion?: 'en_recherche' | 'en_emploi' | 'en_stage' | 'en_formation' | 'autre';
  cv_path?: string;
  competences?: string;
  experience?: string;
  adresse?: string;
  ville?: string;
  region?: string;
  date_naissance?: string;
  genre?: 'homme' | 'femme' | 'autre';
  niveau_etude?: string;
  nom_entreprise?: string;
  secteur_activite?: string;
  taille_entreprise?: 'tpe' | 'pme' | 'eti' | 'ge';
  site_web?: string;
  description?: string;
  contact_rh_nom?: string;
  contact_rh_email?: string;
  contact_rh_phone?: string;
  partenaire_depuis?: string;
  statut_partenariat?: 'actif' | 'inactif' | 'en_discussion';
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateUserForm>();
  const selectedRole = watch('role');

  if (!isOpen) return null;

  const onSubmit = async (data: CreateUserForm) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Utilisateur créé avec succès');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Créer un utilisateur</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              {...register('role', { required: 'Rôle requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="admin">Administrateur</option>
              <option value="coach">Coach</option>
              <option value="apprenant">Apprenant</option>
              <option value="entreprise">Entreprise</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  {...register('first_name', { required: 'Prénom requis' })}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Jean"
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                {...register('last_name', { required: 'Nom requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Dupont"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email requis',
                  pattern: { value: /^\S+@\S+$/, message: 'Email invalide' }
                })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                {...register('phone')}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+221 70 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                {...register('password', { 
                  required: 'Mot de passe requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' }
                })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              {...register('is_active', { required: 'Statut requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              defaultValue={"true"}
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {selectedRole === 'apprenant' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promotion</label>
                  <input type="text" {...register('promotion')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Promotion" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formation</label>
                  <input type="text" {...register('formation')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Formation" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                  <input type="date" {...register('date_debut')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                  <input type="date" {...register('date_fin')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut d'insertion</label>
                <select {...register('statut_insertion')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Sélectionner</option>
                  <option value="en_recherche">En recherche</option>
                  <option value="en_emploi">En emploi</option>
                  <option value="en_stage">En stage</option>
                  <option value="en_formation">En formation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CV (lien ou chemin)</label>
                <input type="text" {...register('cv_path')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Lien du CV" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <textarea {...register('competences')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Compétences"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                <textarea {...register('experience')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Expérience"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input type="text" {...register('ville')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ville" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                  <input type="text" {...register('region')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Région" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <input type="date" {...register('date_naissance')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <select {...register('genre')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'étude</label>
                <input type="text" {...register('niveau_etude')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Niveau d'étude" />
              </div>
            </>
          )}

          {selectedRole === 'entreprise' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <input type="text" {...register('nom_entreprise')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nom de l'entreprise" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
                <input type="text" {...register('secteur_activite')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Secteur d'activité" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille de l'entreprise</label>
                <select {...register('taille_entreprise')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Sélectionner</option>
                  <option value="tpe">TPE</option>
                  <option value="pme">PME</option>
                  <option value="eti">ETI</option>
                  <option value="ge">Grande entreprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input type="text" {...register('adresse')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Adresse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input type="text" {...register('ville')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ville" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                  <input type="text" {...register('region')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Région" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input type="text" {...register('site_web')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Site web" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea {...register('description')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Description"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact RH - Nom</label>
                  <input type="text" {...register('contact_rh_nom')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nom RH" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact RH - Email</label>
                  <input type="email" {...register('contact_rh_email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email RH" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact RH - Téléphone</label>
                <input type="text" {...register('contact_rh_phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Téléphone RH" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partenaire depuis</label>
                  <input type="date" {...register('partenaire_depuis')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut partenariat</label>
                  <select {...register('statut_partenariat')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Sélectionner</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="en_discussion">En discussion</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}