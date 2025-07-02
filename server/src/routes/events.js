import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les événements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;
    const connection = getConnection();

    let query = `
      SELECT 
        e.*,
        u.first_name as created_by_name, u.last_name as created_by_lastname,
        COUNT(ep.id) as participants_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.statut_participation != 'absent'
      WHERE 1=1
    `;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push('e.statut = ?');
      values.push(status);
    }

    if (type) {
      conditions.push('e.type_evenement = ?');
      values.push(type);
    }

    if (upcoming === 'true') {
      conditions.push('e.date_debut > NOW()');
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' GROUP BY e.id ORDER BY e.date_debut DESC';

    const [events] = await connection.execute(query, values);
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer un événement par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    const [events] = await connection.execute(`
      SELECT 
        e.*,
        u.first_name as created_by_name, u.last_name as created_by_lastname
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Récupérer les participants
    const [participants] = await connection.execute(`
      SELECT 
        ep.*,
        u.first_name, u.last_name, u.email,
        l.promotion, l.formation
      FROM event_participants ep
      JOIN learners l ON ep.learner_id = l.id
      JOIN users u ON l.user_id = u.id
      WHERE ep.event_id = ?
      ORDER BY ep.date_inscription DESC
    `, [id]);

    const event = events[0];
    event.participants = participants;

    res.json(event);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer un nouvel événement
router.post('/', authenticateToken, authorizeRoles('admin', 'coach'), [
  body('titre').trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim(),
  body('type_evenement').isIn(['atelier', 'visite_entreprise', 'job_dating', 'conference', 'formation', 'autre']),
  body('date_debut').isISO8601(),
  body('date_fin').optional().isISO8601(),
  body('lieu').optional().trim(),
  body('capacite_max').optional().isInt({ min: 1 }),
  body('animateur').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      titre, description, type_evenement, date_debut, date_fin,
      lieu, capacite_max, animateur
    } = req.body;
    const connection = getConnection();

    const [result] = await connection.execute(
      `INSERT INTO events 
       (titre, description, type_evenement, date_debut, date_fin, lieu, capacite_max, animateur, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titre, description, type_evenement, date_debut, date_fin, lieu, capacite_max, animateur, req.user.id]
    );

    res.status(201).json({
      message: 'Événement créé avec succès',
      event_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// S'inscrire à un événement
router.post('/:id/register', authenticateToken, [
  body('commentaires').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaires } = req.body;
    const connection = getConnection();

    // Vérifier que l'utilisateur est un apprenant
    if (req.user.role !== 'apprenant') {
      return res.status(403).json({ error: 'Seuls les apprenants peuvent s\'inscrire aux événements' });
    }

    // Récupérer l'ID de l'apprenant
    const [learners] = await connection.execute(
      'SELECT id FROM learners WHERE user_id = ?',
      [req.user.id]
    );

    if (learners.length === 0) {
      return res.status(400).json({ error: 'Profil apprenant non trouvé' });
    }

    const learnerId = learners[0].id;

    // Vérifier que l'événement existe et est planifié
    const [events] = await connection.execute(
      'SELECT id, statut, capacite_max, date_debut FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    const event = events[0];

    if (event.statut !== 'planifie') {
      return res.status(400).json({ error: 'Les inscriptions ne sont plus ouvertes pour cet événement' });
    }

    // Vérifier que l'événement n'est pas dans le passé
    if (new Date(event.date_debut) < new Date()) {
      return res.status(400).json({ error: 'Impossible de s\'inscrire à un événement passé' });
    }

    // Vérifier la capacité maximale
    if (event.capacite_max) {
      const [currentParticipants] = await connection.execute(
        'SELECT COUNT(*) as count FROM event_participants WHERE event_id = ? AND statut_participation != \'absent\'',
        [id]
      );

      if (currentParticipants[0].count >= event.capacite_max) {
        return res.status(400).json({ error: 'Événement complet' });
      }
    }

    // Vérifier si l'apprenant n'est pas déjà inscrit
    const [existingRegistration] = await connection.execute(
      'SELECT id FROM event_participants WHERE event_id = ? AND learner_id = ?',
      [id, learnerId]
    );

    if (existingRegistration.length > 0) {
      return res.status(400).json({ error: 'Vous êtes déjà inscrit à cet événement' });
    }

    // Créer l'inscription
    await connection.execute(
      'INSERT INTO event_participants (event_id, learner_id, commentaires) VALUES (?, ?, ?)',
      [id, learnerId, commentaires]
    );

    res.status(201).json({ message: 'Inscription à l\'événement réussie' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut de participation
router.patch('/:eventId/participants/:participantId', authenticateToken, authorizeRoles('admin', 'coach'), [
  body('statut_participation').isIn(['inscrit', 'present', 'absent', 'excuse']),
  body('commentaires').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, participantId } = req.params;
    const { statut_participation, commentaires } = req.body;
    const connection = getConnection();

    await connection.execute(
      `UPDATE event_participants 
       SET statut_participation = ?, commentaires = ?
       WHERE id = ? AND event_id = ?`,
      [statut_participation, commentaires, participantId, eventId]
    );

    res.json({ message: 'Statut de participation mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de participation:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un événement
router.put('/:id', authenticateToken, authorizeRoles('admin', 'coach'), [
  body('titre').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim(),
  body('statut').optional().isIn(['planifie', 'en_cours', 'termine', 'annule']),
  body('lieu').optional().trim(),
  body('animateur').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { titre, description, statut, lieu, animateur } = req.body;
    const connection = getConnection();

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];

    const fields = { titre, description, statut, lieu, animateur };

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
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Événement mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;