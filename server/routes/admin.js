import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// 1. GET ADMIN DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = (await db.prepare(`SELECT COUNT(*) as count FROM users`).get()).count;
    const verifiedUsers = (await db.prepare(`SELECT COUNT(*) as count FROM users WHERE email_verified = 1`).get()).count;
    const totalAssignments = (await db.prepare(`SELECT COUNT(*) as count FROM assignments`).get()).count;
    const totalQuestions = (await db.prepare(`SELECT COUNT(*) as count FROM question_sets`).get()).count;
    const totalSamples = (await db.prepare(`SELECT COUNT(*) as count FROM samples`).get()).count;
    
    const activeUsers = (await db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE last_login IS NOT NULL 
      AND datetime(last_login) >= datetime('now', '-7 days')
    `).get()).count;

    return res.json({
      stats: {
        totalUsers,
        verifiedUsers,
        totalAssignments,
        totalQuestions,
        totalSamples,
        activeUsers
      }
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin metrics.' });
  }
});

// 2. GET USER LIST
router.get('/users', async (req, res) => {
  try {
    const users = await db.prepare(`
      SELECT id, full_name, email, profile_image, email_verified, role, created_at, updated_at, last_login 
      FROM users 
      ORDER BY datetime(created_at) DESC
    `).all();

    return res.json({ users });
  } catch (err) {
    console.error('Fetch admin users error:', err);
    return res.status(500).json({ error: 'Failed to fetch user directory.' });
  }
});

// 3. TOGGLE USER VERIFICATION STATUS
router.put('/users/:id/verify', async (req, res) => {
  try {
    const userId = req.params.id;
    const { verified } = req.body;

    const targetUser = await db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date().toISOString();
    const newStatus = verified ? 1 : 0;

    await db.prepare(`UPDATE users SET email_verified = ?, updated_at = ? WHERE id = ?`).run(newStatus, now, userId);

    return res.json({ message: `User verification status updated to ${verified ? 'Verified' : 'Unverified'}.` });
  } catch (err) {
    console.error('Admin update verification error:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// 4. CHANGE USER ROLE
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified. Allowed values: user, admin.' });
    }

    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot revoke your own administrator role.' });
    }

    const targetUser = await db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date().toISOString();
    await db.prepare(`UPDATE users SET role = ?, updated_at = ? WHERE id = ?`).run(role, now, userId);

    return res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    console.error('Admin update role error:', err);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// 5. DELETE USER ACCOUNT (ADMIN)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own administrator account.' });
    }

    const targetUser = await db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);

    return res.json({ message: 'User account and associated data removed.' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
