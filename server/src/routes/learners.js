import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les apprenants
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = getConnection();
    const [learners] = await connection.execute(`
      SELECT 
        l.*,
        u.email, u.first_name, u.last_name, u.phone
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true
      ORDER BY l.created_at DESC
    `);

    res.json(learners);
  } catch (error) {
    console.error('Erreur lors de la récupération des apprenants:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer un apprenant par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    const [learners] = await connection.execute(`
      SELECT 
        l.*,
        u.email, u.first_name, u.last_name, u.phone, u.created_at as user_created_at
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.is_active = true
    `, [id]);

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    // Récupérer l'historique d'insertion
    const [tracking] = await connection.execute(`
      SELECT 
        it.*,
        u.first_name as created_by_name, u.last_name as created_by_lastname
      FROM insertion_tracking it
      LEFT JOIN users u ON it.created_by = u.id
      WHERE it.learner_id = ?
      ORDER BY it.created_at DESC
    `, [id]);

    const learner = learners[0];
    learner.insertion_history = tracking;

    res.json(learner);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'apprenant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le profil d'un apprenant
router.put('/:id', authenticateToken, [
  body('promotion').optional().trim(),
  body('formation').optional().trim(),
  body('competences').optional().trim(),
  body('experience').optional().trim(),
  body('adresse').optional().trim(),
  body('ville').optional().trim(),
  body('region').optional().trim(),
  body('niveau_etude').optional().trim(),
  body('genre').optional().isIn(['homme', 'femme', 'autre']),
  body('statut_insertion').optional().isIn(['en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const connection = getConnection();

    // Vérifier les permissions
    const [learners] = await connection.execute(
      'SELECT user_id, statut_insertion FROM learners WHERE id = ?',
      [id]
    );

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    const learner = learners[0];
    if (req.user.role !== 'admin' && req.user.role !== 'coach' && req.user.id !== learner.user_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const {
      promotion, formation, date_debut, date_fin, competences, experience,
      adresse, ville, region, date_naissance, genre, niveau_etude, statut_insertion
    } = req.body;

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];

    const fields = {
      promotion, formation, date_debut, date_fin, competences, experience,
      adresse, ville, region, date_naissance, genre, niveau_etude, statut_insertion
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await connection.execute(
      `UPDATE learners SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Si le statut d'insertion a changé, l'enregistrer dans l'historique
    if (statut_insertion && statut_insertion !== learner.statut_insertion) {
      await connection.execute(
        'INSERT INTO insertion_tracking (learner_id, statut_precedent, nouveau_statut, created_by) VALUES (?, ?, ?, ?)',
        [id, learner.statut_insertion, statut_insertion, req.user.id]
      );
    }

    res.json({ message: 'Profil apprenant mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil apprenant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Ajouter une entrée dans l'historique d'insertion
router.post('/:id/tracking', authenticateToken, authorizeRoles('admin', 'coach'), [
  body('nouveau_statut').isIn(['en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre']),
  body('entreprise').optional().trim(),
  body('poste').optional().trim(),
  body('type_contrat').optional().isIn(['cdi', 'cdd', 'stage', 'freelance', 'apprentissage']),
  body('salaire').optional().isNumeric(),
  body('date_debut').optional().isISO8601(),
  body('date_fin').optional().isISO8601(),
  body('commentaires').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      nouveau_statut, entreprise, poste, type_contrat, salaire,
      date_debut, date_fin, commentaires
    } = req.body;
    const connection = getConnection();

    // Récupérer le statut actuel
    const [learners] = await connection.execute(
      'SELECT statut_insertion FROM learners WHERE id = ?',
      [id]
    );

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    const statut_precedent = learners[0].statut_insertion;

    // Ajouter l'entrée dans l'historique
    await connection.execute(
      `INSERT INTO insertion_tracking 
       (learner_id, statut_precedent, nouveau_statut, entreprise, poste, type_contrat, salaire, date_debut, date_fin, commentaires, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, statut_precedent, nouveau_statut, entreprise, poste, type_contrat, salaire, date_debut, date_fin, commentaires, req.user.id]
    );

    // Mettre à jour le statut de l'apprenant
    await connection.execute(
      'UPDATE learners SET statut_insertion = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nouveau_statut, id]
    );

    res.status(201).json({ message: 'Suivi d\'insertion ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du suivi d\'insertion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;