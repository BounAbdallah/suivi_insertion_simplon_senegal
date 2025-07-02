import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// S'assurer que le dossier d'upload existe
const uploadDir = path.join(__dirname, '../../uploads/documents');
fs.mkdir(uploadDir, { recursive: true });

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB par défaut
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Récupérer tous les documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = getConnection();
    const { type } = req.query;

    let query = `
      SELECT 
        d.id, d.titre, d.description, d.type_document, d.file_size, d.mime_type, 
        d.is_public, d.download_count, d.created_at,
        u.first_name as uploaded_by_name, 
        u.last_name as uploaded_by_lastname
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;

    const values = [];

    if (type) {
      query += ' AND d.type_document = ?';
      values.push(type);
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
        query += ' AND d.is_public = true';
    }

    query += ' ORDER BY d.created_at DESC';

    const [documents] = await connection.execute(query, values);
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Télécharger un document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const connection = getConnection();
    const { id } = req.params;
    
    const [documents] = await connection.execute('SELECT * FROM documents WHERE id = ?', [id]);

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    const document = documents[0];

    if (!document.is_public && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Accès non autorisé à ce document' });
    }

    await connection.execute('UPDATE documents SET download_count = download_count + 1 WHERE id = ?', [id]);

    const filePath = path.join(uploadDir, path.basename(document.file_path));
    res.download(filePath, document.titre, (err) => {
        if (err) {
            console.error("Erreur lors de l'envoi du fichier :", err);
            if (err.code === "ENOENT") {
                return res.status(404).json({error: "Le fichier physique n'existe plus sur le serveur."});
            }
            res.status(500).json({ error: 'Impossible de télécharger le fichier.' });
        }
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});


// Upload d'un nouveau document
router.post('/', authenticateToken, upload.single('documentFile'), [
  body('titre').trim().isLength({ min: 3, max: 200 }).withMessage('Le titre est requis.'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('type_document').isIn(['cv_template', 'guide', 'presentation', 'rapport', 'autre']),
  body('is_public').optional().isBoolean()
], async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'Aucun fichier n\'a été envoyé ou le type de fichier n\'est pas autorisé.' }] });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const connection = getConnection();
        const { titre, description, type_document, is_public } = req.body;

        // Définir les permissions selon le rôle
        let canUploadPublic = false;
        let defaultIsPublic = false;

        switch (req.user.role) {
          case 'admin':
          case 'coach':
            canUploadPublic = true;
            defaultIsPublic = true;
            break;
          case 'entreprise':
            canUploadPublic = false;
            defaultIsPublic = false;
            break;
          case 'apprenant':
            canUploadPublic = false;
            defaultIsPublic = false;
            break;
          default:
            return res.status(403).json({ error: 'Rôle non autorisé' });
        }

        // Vérifier si l'utilisateur peut rendre le document public
        const finalIsPublic = canUploadPublic ? (is_public === 'true' || is_public === true) : defaultIsPublic;

        const [result] = await connection.execute(
        `INSERT INTO documents 
        (titre, description, type_document, file_path, file_size, mime_type, uploaded_by, is_public) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            titre,
            description || null,
            type_document,
            req.file.filename,
            req.file.size,
            req.file.mimetype,
            req.user.id,
            finalIsPublic
        ]
        );

        res.status(201).json({ 
          message: 'Document uploadé avec succès', 
          documentId: result.insertId,
          isPublic: finalIsPublic
        });

    } catch (error) {
        await fs.unlink(req.file.path);
        console.error('Erreur lors de l\'upload du document:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});


// Supprimer un document
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'coach']), async (req, res) => {
  try {
    const connection = getConnection();
    const { id } = req.params;

    const [documents] = await connection.execute('SELECT file_path FROM documents WHERE id = ?', [id]);

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const filePath = path.join(uploadDir, documents[0].file_path);
    try {
      await fs.unlink(filePath);
    } catch (fsError) {
      console.warn(`Le fichier physique ${filePath} n'a pas pu être supprimé ou n'existait pas.`);
    }

    await connection.execute('DELETE FROM documents WHERE id = ?', [id]);

    res.status(200).json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;
