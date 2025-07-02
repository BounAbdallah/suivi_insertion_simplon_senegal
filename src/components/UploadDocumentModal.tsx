import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, File as FileIcon, Loader2 } from 'lucide-react';
import { documentService } from '../services/api';
import toast from 'react-hot-toast';

// On réutilise les labels de la page principale
const documentTypeLabels = {
  'cv_template': 'Modèle CV',
  'guide': 'Guide',
  'presentation': 'Présentation',
  'rapport': 'Rapport',
  'autre': 'Autre'
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDocumentModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [typeDocument, setTypeDocument] = useState('autre');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Veuillez sélectionner un fichier.');
      return;
    }
    if (!titre) {
        toast.error('Veuillez renseigner un titre.');
        return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('type_document', typeDocument);
    formData.append('is_public', String(isPublic));
    formData.append('documentFile', file); // Le nom 'documentFile' doit correspondre au backend

    try {
      await documentService.upload(formData);
      toast.success('Document uploadé avec succès !');
      onSuccess(); // Appelle la fonction pour rafraîchir la liste
      handleClose(); // Ferme et réinitialise la modale
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Erreur lors de l\'upload.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Réinitialiser le formulaire en fermant
    setTitre('');
    setDescription('');
    setTypeDocument('autre');
    setIsPublic(true);
    setFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant dans la modale
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Ajouter un nouveau document</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre</label>
                <input type="text" id="titre" value={titre} onChange={e => setTitre(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"/>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optionnel)</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"></textarea>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de document</label>
                <select id="type" value={typeDocument} onChange={e => setTypeDocument(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500">
                    {Object.entries(documentTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="is_public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"/>
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">Rendre ce document public</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {!file ? (
                      <>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400"/>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                            <span>Choisissez un fichier</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                          </label>
                          <p className="pl-1">ou glissez-déposez</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                          <FileIcon className="mx-auto h-12 w-12 text-green-500" />
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <button type="button" onClick={() => setFile(null)} className="text-sm text-red-600 hover:underline">Changer de fichier</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 flex items-center">
                    {isSubmitting && <Loader2 className="animate-spin mr-2" size={16}/>}
                    {isSubmitting ? 'Envoi...' : 'Ajouter le document'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}