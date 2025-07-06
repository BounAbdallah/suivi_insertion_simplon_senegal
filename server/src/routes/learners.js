import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const formatLearnerWithUser = (learnerData) => {
  if (!learnerData) return null;

  const user = {
    id: learnerData.user_id,
    email: learnerData.email,
    first_name: learnerData.first_name,
    last_name: learnerData.last_name,
    phone: learnerData.phone,
    role: learnerData.role,
    is_active: learnerData.is_active,
    created_at: learnerData.user_created_at,
    updated_at: learnerData.user_updated_at,
  };

  const formattedLearner = { ...learnerData };
  delete formattedLearner.email;
  delete formattedLearner.first_name;
  delete formattedLearner.last_name;
  delete formattedLearner.phone;
  delete formattedLearner.role;
  delete formattedLearner.is_active;
  delete formattedLearner.user_created_at;
  delete formattedLearner.user_updated_at;

  formattedLearner.user = user;

  return formattedLearner;
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = getConnection();
    const [learners] = await connection.execute(`
      SELECT
        l.*,
        u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active,
        u.created_at as user_created_at, u.updated_at as user_updated_at
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true
      ORDER BY l.created_at DESC
    `);
    const formattedLearners = learners.map(learner => formatLearnerWithUser(learner));
    res.json(formattedLearners);
  } catch (error) {
    console.error('Erreur lors de la récupération des apprenants:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    const [learners] = await connection.execute(`
      SELECT
        l.*,
        u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active,
        u.created_at as user_created_at, u.updated_at as user_updated_at
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.is_active = true
    `, [id]);

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    const learnerData = learners[0];
    const [tracking] = await connection.execute(`
      SELECT
        it.*,
        u.first_name as created_by_name, u.last_name as created_by_lastname
      FROM insertion_tracking it
      LEFT JOIN users u ON it.created_by = u.id
      WHERE it.learner_id = ?
      ORDER BY it.created_at DESC
    `, [id]);

    const formattedLearner = formatLearnerWithUser(learnerData);
    if (formattedLearner) {
      formattedLearner.insertion_history = tracking;
    } else {
        return res.status(500).json({ error: 'Erreur lors du formatage des données de l\'apprenant.' });
    }

    res.json(formattedLearner);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'apprenant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.put('/:id', authenticateToken, [
  body('promotion').optional().trim(),
  body('formation').optional().trim(),
  body('date_debut').optional().isISO8601().withMessage('Date de début invalide (YYYY-MM-DD)'),
  body('date_fin').optional().isISO8601().withMessage('Date de fin invalide (YYYY-MM-DD)'),
  body('competences').optional().trim(),
  body('experience').optional().trim(),
  body('adresse').optional().trim(),
  body('ville').optional().trim(),
  body('region').optional().trim(),
  body('niveau_etude').optional().trim(),
  body('genre').optional().isIn(['homme', 'femme', 'autre']),
  body('statut_insertion').optional().isIn(['en_recherche', 'en_emploi', 'en_stage', 'en_formation', 'autre']),
  body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone('any', { strictMode: false }).withMessage('Numéro de téléphone invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const connection = getConnection();

    const [learners] = await connection.execute(
      'SELECT l.user_id, l.statut_insertion, u.email as user_email, u.phone as user_phone FROM learners l JOIN users u ON l.user_id = u.id WHERE l.id = ?',
      [id]
    );

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    const learnerRecord = learners[0];
    const currentUserId = learnerRecord.user_id;

    if (req.user.role !== 'admin' && req.user.role !== 'coach' && req.user.id !== currentUserId) {
      return res.status(403).json({ error: 'Accès non autorisé à la modification de ce profil.' });
    }

    const {
      promotion, formation, date_debut, date_fin, competences, experience,
      adresse, ville, region, date_naissance, genre, niveau_etude, statut_insertion,
      email, phone
    } = req.body;

    const learnerUpdates = [];
    const learnerValues = [];
    const learnerFields = {
      promotion, formation, date_debut, date_fin, competences, experience,
      adresse, ville, region, date_naissance, genre, niveau_etude, statut_insertion
    };

    Object.entries(learnerFields).forEach(([key, value]) => {
      if (value !== undefined) {
        learnerUpdates.push(`${key} = ?`);
        learnerValues.push(value);
      }
    });

    if (learnerUpdates.length > 0) {
      learnerUpdates.push('updated_at = CURRENT_TIMESTAMP');
      learnerValues.push(id);
      await connection.execute(
        `UPDATE learners SET ${learnerUpdates.join(', ')} WHERE id = ?`,
        learnerValues
      );
    }

    const userUpdates = [];
    const userValues = [];

    if (email !== undefined && email !== learnerRecord.user_email) {
      userUpdates.push('email = ?');
      userValues.push(email);
    }
    if (phone !== undefined && phone !== learnerRecord.user_phone) {
      userUpdates.push('phone = ?');
      userValues.push(phone);
    }

    if (userUpdates.length > 0) {
      userUpdates.push('updated_at = CURRENT_TIMESTAMP');
      userValues.push(currentUserId);
      await connection.execute(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
        userValues
      );
    }

    if (statut_insertion && statut_insertion !== learnerRecord.statut_insertion) {
      await connection.execute(
        'INSERT INTO insertion_tracking (learner_id, statut_precedent, nouveau_statut, created_by) VALUES (?, ?, ?, ?)',
        [id, learnerRecord.statut_insertion, statut_insertion, req.user.id]
      );
    }

    res.json({ message: 'Profil apprenant mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil apprenant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

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

    const [learners] = await connection.execute(
      'SELECT statut_insertion FROM learners WHERE id = ?',
      [id]
    );

    if (learners.length === 0) {
      return res.status(404).json({ error: 'Apprenant non trouvé' });
    }

    const statut_precedent = learners[0].statut_insertion;

    await connection.execute(
      `INSERT INTO insertion_tracking
       (learner_id, statut_precedent, nouveau_statut, entreprise, poste, type_contrat, salaire, date_debut, date_fin, commentaires, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, statut_precedent, nouveau_statut, entreprise, poste, type_contrat, salaire, date_debut, date_fin, commentaires, req.user.id]
    );

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