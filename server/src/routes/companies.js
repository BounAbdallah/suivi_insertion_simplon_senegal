import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Récupérer toutes les entreprises
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = getConnection();
    const [companies] = await connection.execute(`
      SELECT 
        c.*,
        u.email, u.first_name, u.last_name, u.phone
      FROM companies c
      JOIN users u ON c.user_id = u.id
      WHERE u.is_active = true
      ORDER BY c.created_at DESC
    `);

    res.json(companies);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer une entreprise par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    const [companies] = await connection.execute(`
      SELECT 
        c.*,
        u.email, u.first_name, u.last_name, u.phone, u.created_at as user_created_at
      FROM companies c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ? AND u.is_active = true
    `, [id]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Récupérer les offres d'emploi de cette entreprise
    const [jobOffers] = await connection.execute(`
      SELECT id, titre, type_contrat, statut, date_publication, nb_postes
      FROM job_offers
      WHERE company_id = ?
      ORDER BY date_publication DESC
    `, [id]);

    const company = companies[0];
    company.job_offers = jobOffers;

    res.json(company);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour le profil d'une entreprise
router.put('/:id', authenticateToken, [
  body('nom_entreprise').optional().trim().isLength({ min: 2 }),
  body('secteur_activite').optional().trim(),
  body('taille_entreprise').optional().isIn(['tpe', 'pme', 'eti', 'ge']),
  body('adresse').optional().trim(),
  body('ville').optional().trim(),
  body('region').optional().trim(),
  body('site_web').optional().isURL(),
  body('description').optional().trim(),
  body('contact_rh_nom').optional().trim(),
  body('contact_rh_email').optional().isEmail(),
  body('contact_rh_phone').optional().trim(),
  body('statut_partenariat').optional().isIn(['actif', 'inactif', 'en_discussion'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const connection = getConnection();

    // Vérifier les permissions
    const [companies] = await connection.execute(
      'SELECT user_id FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    const company = companies[0];
    if (req.user.role !== 'admin' && req.user.role !== 'coach' && req.user.id !== company.user_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const {
      nom_entreprise, secteur_activite, taille_entreprise, adresse, ville, region,
      site_web, description, contact_rh_nom, contact_rh_email, contact_rh_phone,
      partenaire_depuis, statut_partenariat
    } = req.body;

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];

    const fields = {
      nom_entreprise, secteur_activite, taille_entreprise, adresse, ville, region,
      site_web, description, contact_rh_nom, contact_rh_email, contact_rh_phone,
      partenaire_depuis, statut_partenariat
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
      `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profil entreprise mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer les statistiques d'une entreprise
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    // Vérifier que l'entreprise existe
    const [companies] = await connection.execute(
      'SELECT user_id FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.role !== 'coach' && req.user.id !== companies[0].user_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Statistiques des offres d'emploi
    const [jobStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_offres,
        SUM(CASE WHEN statut = 'active' THEN 1 ELSE 0 END) as offres_actives,
        SUM(CASE WHEN statut = 'pourvue' THEN 1 ELSE 0 END) as offres_pourvues
      FROM job_offers
      WHERE company_id = ?
    `, [id]);

    // Statistiques des candidatures
    const [applicationStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_candidatures,
        SUM(CASE WHEN a.statut = 'en_attente' THEN 1 ELSE 0 END) as candidatures_en_attente,
        SUM(CASE WHEN a.statut = 'acceptee' THEN 1 ELSE 0 END) as candidatures_acceptees
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      WHERE jo.company_id = ?
    `, [id]);

    res.json({
      job_stats: jobStats[0],
      application_stats: applicationStats[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;