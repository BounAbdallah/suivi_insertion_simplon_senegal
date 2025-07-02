import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Récupérer toutes les offres d'emploi
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type_contrat, region, search } = req.query;
    const connection = getConnection();

    let query = `
      SELECT 
        jo.*,
        c.nom_entreprise, c.ville as company_ville, c.secteur_activite
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.is_active = true
    `;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push('jo.statut = ?');
      values.push(status);
    }

    if (type_contrat) {
      conditions.push('jo.type_contrat = ?');
      values.push(type_contrat);
    }

    if (region) {
      conditions.push('jo.region = ?');
      values.push(region);
    }

    if (search) {
      conditions.push('(jo.titre LIKE ? OR jo.description LIKE ? OR c.nom_entreprise LIKE ?)');
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY jo.date_publication DESC';

    const [jobs] = await connection.execute(query, values);
    res.json(jobs);
  } catch (error) {
    console.error('Erreur lors de la récupération des offres d\'emploi:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer une offre d'emploi par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    const [jobs] = await connection.execute(`
      SELECT 
        jo.*,
        c.nom_entreprise, c.ville as company_ville, c.secteur_activite,
        c.description as company_description, c.site_web
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE jo.id = ? AND u.is_active = true
    `, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Offre d\'emploi non trouvée' });
    }

    // Récupérer les candidatures pour cette offre (si l'utilisateur a les droits)
    if (req.user.role === 'admin' || req.user.role === 'coach' || req.user.role === 'entreprise') {
      const [applications] = await connection.execute(`
        SELECT 
          a.*,
          u.first_name, u.last_name, u.email,
          l.promotion, l.formation, l.competences
        FROM applications a
        JOIN learners l ON a.learner_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE a.job_offer_id = ?
        ORDER BY a.date_candidature DESC
      `, [id]);

      jobs[0].applications = applications;
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre d\'emploi:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer une nouvelle offre d'emploi
router.post('/', authenticateToken, [
  body('titre').trim().isLength({ min: 5, max: 200 }),
  body('type_contrat').isIn(['cdi', 'cdd', 'stage', 'freelance', 'apprentissage']),
  body('description').trim().isLength({ min: 50 }),
  body('competences_requises').optional().trim(),
  body('experience_requise').optional().trim(),
  body('salaire_min').optional().isNumeric(),
  body('salaire_max').optional().isNumeric(),
  body('ville').optional().trim(),
  body('region').optional().trim(),
  body('date_expiration').optional().isISO8601(),
  body('nb_postes').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = getConnection();

    // Récupérer l'ID de l'entreprise associée à l'utilisateur
    let companyId;

    if (req.user.role === 'entreprise') {
      const [companies] = await connection.execute(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );

      if (companies.length === 0) {
        return res.status(400).json({ error: 'Profil entreprise non trouvé' });
      }

      companyId = companies[0].id;
    } else if (req.user.role === 'admin' || req.user.role === 'coach') {
      // Admin/Coach peut créer pour n'importe quelle entreprise
      const { company_id } = req.body;
      if (!company_id) {
        return res.status(400).json({ error: 'ID entreprise requis' });
      }
      companyId = company_id;
    } else {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    const {
      titre, type_contrat, description, competences_requises, experience_requise,
      salaire_min, salaire_max, ville, region, date_expiration, nb_postes
    } = req.body;

    const [result] = await connection.execute(
      `INSERT INTO job_offers 
       (company_id, titre, type_contrat, description, competences_requises, experience_requise, 
        salaire_min, salaire_max, ville, region, date_expiration, nb_postes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, titre, type_contrat, description, competences_requises, experience_requise,
       salaire_min, salaire_max, ville, region, date_expiration, nb_postes || 1]
    );

    res.status(201).json({
      message: 'Offre d\'emploi créée avec succès',
      job_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'emploi:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Candidater à une offre d'emploi
router.post('/:id/apply', authenticateToken, [
  body('message_motivation').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { message_motivation } = req.body;
    const connection = getConnection();

    // Vérifier que l'utilisateur est un apprenant
    if (req.user.role !== 'apprenant') {
      return res.status(403).json({ error: 'Seuls les apprenants peuvent candidater' });
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

    // Vérifier que l'offre existe et est active
    const [jobs] = await connection.execute(
      'SELECT id, statut FROM job_offers WHERE id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Offre d\'emploi non trouvée' });
    }

    if (jobs[0].statut !== 'active') {
      return res.status(400).json({ error: 'Cette offre n\'est plus active' });
    }

    // Vérifier si l'apprenant n'a pas déjà candidaté
    const [existingApplication] = await connection.execute(
      'SELECT id FROM applications WHERE job_offer_id = ? AND learner_id = ?',
      [id, learnerId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà candidaté à cette offre' });
    }

    // Créer la candidature - gérer les valeurs undefined
    const motivationMessage = message_motivation || null;
    await connection.execute(
      'INSERT INTO applications (job_offer_id, learner_id, message_motivation) VALUES (?, ?, ?)',
      [id, learnerId, motivationMessage]
    );

    res.status(201).json({ message: 'Candidature envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la candidature:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le statut d'une candidature
router.patch('/:jobId/applications/:appId', authenticateToken, [
  body('statut').isIn(['en_attente', 'vue', 'entretien', 'acceptee', 'refusee']),
  body('commentaires').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, appId } = req.params;
    const { statut, commentaires } = req.body;
    const connection = getConnection();

    console.log('Mise à jour candidature:', { jobId, appId, statut, commentaires, userId: req.user.id, userRole: req.user.role });

    // Vérifier les permissions (entreprise propriétaire, admin ou coach)
    if (req.user.role === 'entreprise') {
      const [jobs] = await connection.execute(`
        SELECT jo.id 
        FROM job_offers jo
        JOIN companies c ON jo.company_id = c.id
        WHERE jo.id = ? AND c.user_id = ?
      `, [jobId, req.user.id]);

      if (jobs.length === 0) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
    } else if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    // Vérifier que la candidature existe
    const [existingApp] = await connection.execute(
      'SELECT id FROM applications WHERE id = ? AND job_offer_id = ?',
      [appId, jobId]
    );

    if (existingApp.length === 0) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    // Mettre à jour la candidature - gérer les valeurs undefined
    const updateQuery = `
      UPDATE applications 
      SET statut = ?, commentaires = ?, date_reponse = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND job_offer_id = ?
    `;
    
    const commentairesValue = commentaires || null;
    await connection.execute(updateQuery, [statut, commentairesValue, appId, jobId]);

    console.log('Candidature mise à jour avec succès');
    res.json({ message: 'Statut de candidature mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la candidature:', error);
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
});

export default router;