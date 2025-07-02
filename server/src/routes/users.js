import express from 'express';
import { body, validationResult } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les utilisateurs (admin uniquement)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const connection = getConnection();
    const [users] = await connection.execute(`
      SELECT 
        u.id, u.email, u.role, u.first_name, u.last_name, 
        u.phone, u.is_active, u.created_at,
        CASE 
          WHEN u.role = 'apprenant' THEN l.promotion
          WHEN u.role = 'entreprise' THEN c.nom_entreprise
          ELSE NULL 
        END as additional_info
      FROM users u
      LEFT JOIN learners l ON u.id = l.user_id
      LEFT JOIN companies c ON u.id = c.user_id
      ORDER BY u.created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const [users] = await connection.execute(
      'SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, [
  body('first_name').optional().trim().isLength({ min: 2 }),
  body('last_name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { first_name, last_name, phone } = req.body;
    const connection = getConnection();

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await connection.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Désactiver/activer un utilisateur (admin uniquement)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const connection = getConnection();

    await connection.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, id]
    );

    res.json({ 
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès` 
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;