import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Download, FileText, Trash2, Users, FileCheck, FolderKanban } from 'lucide-react';
import { Layout } from '../components/Layout';
import { documentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { Document } from '../types';

// --- Types & Data ---
const documentTypeInfo = {
  'cv_template': { label: 'Modèle CV', color: 'blue', icon: <FileText size={16} /> },
  'guide': { label: 'Guide', color: 'green', icon: <FolderKanban size={16} /> },
  'presentation': { label: 'Présentation', color: 'purple', icon: <FileCheck size={16} /> },
  'rapport': { label: 'Rapport', color: 'orange', icon: <FileText size={16} /> },
  'autre': { label: 'Autre', color: 'gray', icon: <FileText size={16} /> }
};

const getColorClasses = (color: string) => {
  const colors: { [key: string]: { bg: string, text: string, iconBg: string } } = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-700', iconBg: 'bg-gray-100' },
  };
  return colors[color] || colors.gray;
};

// --- Helper Components ---
const StatCard = ({ title, value, icon, delay }: { title: string, value: string | number, icon: React.ReactNode, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  </motion.div>
);

// --- Main Component ---
export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [typeFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      const response = await documentService.getAll(params);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId: number, titre: string) => {
    toast.promise(
        documentService.download(documentId).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', titre);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            loadDocuments(); // Refresh stats
        }),
        {
            loading: 'Préparation du téléchargement...',
            success: 'Téléchargement démarré !',
            error: (err) => err.response?.data?.error || 'Erreur de téléchargement.',
        }
    );
  };
  
  const handleDelete = (documentId: number) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">Confirmer la suppression ?</p>
        <p className="text-sm text-gray-600">Cette action est irréversible.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              proceedWithDelete(documentId);
            }}
            className="px-4 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Supprimer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 rounded-md bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200"
          >
            Annuler
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const proceedWithDelete = async (documentId: number) => {
    toast.promise(documentService.delete(documentId), {
      loading: 'Suppression en cours...',
      success: () => {
        loadDocuments();
        return 'Document supprimé.';
      },
      error: (err) => err.response?.data?.error || 'Erreur de suppression.',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bibliothèque de Documents</h1>
              <p className="text-gray-500 mt-1">Gérez et partagez les ressources clés pour la réussite.</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'coach') && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Upload size={18} />
                <span>Ajouter un document</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total documents" value={documents.length} icon={<FileText className="text-blue-500" />} delay={0.1} />
          <StatCard title="Modèles CV" value={documents.filter(d => d.type_document === 'cv_template').length} icon={<Users className="text-green-500" />} delay={0.2} />
          <StatCard title="Guides & Rapports" value={documents.filter(d => ['guide', 'rapport'].includes(d.type_document)).length} icon={<FolderKanban className="text-purple-500" />} delay={0.3} />
          <StatCard title="Téléchargements" value={documents.reduce((sum, doc) => sum + (doc.download_count || 0), 0)} icon={<Download className="text-orange-500" />} delay={0.4} />
        </div>

        {/* Filters & Main Content Area */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm"
        >
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full sm:w-52 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all bg-white"
                >
                    <option value="">Tous les types</option>
                    {Object.entries(documentTypeInfo).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full" />
                </div>
              ) : filteredDocuments.length > 0 ? (
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Taille</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ajouté</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">DLs</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDocuments.map((doc) => (
                      <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(documentTypeInfo[doc.type_document]?.color).iconBg}`}>
                                <div className={getColorClasses(documentTypeInfo[doc.type_document]?.color).text}>
                                    {documentTypeInfo[doc.type_document]?.icon}
                                </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{doc.titre}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{doc.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getColorClasses(documentTypeInfo[doc.type_document]?.color).bg} ${getColorClasses(documentTypeInfo[doc.type_document]?.color).text}`}>
                            {documentTypeInfo[doc.type_document]?.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{formatFileSize(doc.file_size ?? 0)}</td>
                        <td className="px-5 py-4 text-sm text-gray-600" title={format(new Date(doc.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}>
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: fr })}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-600 text-center">{doc.download_count || 0}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDownload(doc.id, doc.titre)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Télécharger"><Download size={18}/></button>
                            {(user?.role === 'admin' || user?.role === 'coach') && (
                              <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md" title="Supprimer"><Trash2 size={18}/></button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun document trouvé</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Il semble qu'aucun document ne corresponde à votre recherche. Essayez de modifier vos filtres ou ajoutez de nouvelles ressources.
                  </p>
                </div>
              )}
            </div>
        </motion.div>
      </div>
      
      <UploadDocumentModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          loadDocuments();
        }}
      />
    </Layout>
  );
}
