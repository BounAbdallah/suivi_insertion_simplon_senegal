import express from 'express';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Statistiques générales du tableau de bord
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'coach'), async (req, res) => {
  try {
    const connection = getConnection();

    // Statistiques des utilisateurs
    const [userStats] = await connection.execute(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
      FROM users
      GROUP BY role
    `);

    // Statistiques d'insertion des apprenants
    const [insertionStats] = await connection.execute(`
      SELECT 
        statut_insertion,
        COUNT(*) as count
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true
      GROUP BY statut_insertion
    `);

    // Statistiques des offres d'emploi
    const [jobStats] = await connection.execute(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM job_offers
      GROUP BY statut
    `);

    // Statistiques des candidatures
    const [applicationStats] = await connection.execute(`
      SELECT 
        a.statut,
        COUNT(*) as count
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      GROUP BY a.statut
    `);

    // Statistiques des événements
    const [eventStats] = await connection.execute(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM events
      GROUP BY statut
    `);

    // Évolution mensuelle des insertions
    const [monthlyInsertions] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        nouveau_statut,
        COUNT(*) as count
      FROM insertion_tracking
      WHERE nouveau_statut IN ('en_emploi', 'en_stage')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month, nouveau_statut
      ORDER BY month
    `);

    res.json({
      users: userStats,
      insertion: insertionStats,
      jobs: jobStats,
      applications: applicationStats,
      events: eventStats,
      monthly_insertions: monthlyInsertions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Statistiques d'insertion par période
router.get('/insertion', authenticateToken, authorizeRoles('admin', 'coach'), async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    const connection = getConnection();

    let dateFilter = '';
    switch (period) {
      case '1month':
        dateFilter = 'AND it.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case '3months':
        dateFilter = 'AND it.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case '6months':
        dateFilter = 'AND it.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
        break;
      case '1year':
        dateFilter = 'AND it.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
    }

    // Taux d'insertion par promotion
    const [insertionByPromotion] = await connection.execute(`
      SELECT 
        l.promotion,
        COUNT(DISTINCT l.id) as total_apprenants,
        COUNT(DISTINCT CASE WHEN l.statut_insertion IN ('en_emploi', 'en_stage') THEN l.id END) as inseres,
        ROUND(
          COUNT(DISTINCT CASE WHEN l.statut_insertion IN ('en_emploi', 'en_stage') THEN l.id END) * 100.0 / 
          COUNT(DISTINCT l.id), 2
        ) as taux_insertion
      FROM learners l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true AND l.promotion IS NOT NULL
      GROUP BY l.promotion
      ORDER BY l.promotion DESC
    `);

    // Délai moyen d'insertion
    const [averageInsertionTime] = await connection.execute(`
      SELECT 
        AVG(DATEDIFF(it.created_at, l.date_fin)) as delai_moyen_jours
      FROM insertion_tracking it
      JOIN learners l ON it.learner_id = l.id
      WHERE it.nouveau_statut IN ('en_emploi', 'en_stage')
      AND l.date_fin IS NOT NULL
      ${dateFilter}
    `);

    // Types de contrats obtenus
    const [contractTypes] = await connection.execute(`
      SELECT 
        type_contrat,
        COUNT(*) as count
      FROM insertion_tracking
      WHERE nouveau_statut IN ('en_emploi', 'en_stage')
      AND type_contrat IS NOT NULL
      ${dateFilter}
      GROUP BY type_contrat
      ORDER BY count DESC
    `);

    res.json({
      insertion_by_promotion: insertionByPromotion,
      average_insertion_time: averageInsertionTime[0],
      contract_types: contractTypes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'insertion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Statistiques pour les entreprises
router.get('/companies', authenticateToken, authorizeRoles('admin', 'coach'), async (req, res) => {
  try {
    const connection = getConnection();

    // Top entreprises par nombre d'offres
    const [topCompaniesByJobs] = await connection.execute(`
      SELECT 
        c.nom_entreprise,
        c.secteur_activite,
        COUNT(jo.id) as nb_offres,
        SUM(CASE WHEN jo.statut = 'active' THEN 1 ELSE 0 END) as offres_actives
      FROM companies c
      LEFT JOIN job_offers jo ON c.id = jo.company_id
      JOIN users u ON c.user_id = u.id
      WHERE u.is_active = true
      GROUP BY c.id, c.nom_entreprise, c.secteur_activite
      ORDER BY nb_offres DESC
      LIMIT 10
    `);

    // Répartition par secteur d'activité
    const [sectorDistribution] = await connection.execute(`
      SELECT 
        secteur_activite,
        COUNT(*) as count
      FROM companies c
      JOIN users u ON c.user_id = u.id
      WHERE u.is_active = true AND secteur_activite IS NOT NULL
      GROUP BY secteur_activite
      ORDER BY count DESC
    `);

    // Statut des partenariats
    const [partnershipStatus] = await connection.execute(`
      SELECT 
        statut_partenariat,
        COUNT(*) as count
      FROM companies c
      JOIN users u ON c.user_id = u.id
      WHERE u.is_active = true
      GROUP BY statut_partenariat
    `);

    res.json({
      top_companies_by_jobs: topCompaniesByJobs,
      sector_distribution: sectorDistribution,
      partnership_status: partnershipStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques entreprises:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;