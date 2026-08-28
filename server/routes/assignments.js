import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireEmailVerified } from '../middleware/auth.js';
import { generateAssignmentContent } from '../services/ai.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireEmailVerified);

// 1. GET ALL USER ASSIGNMENTS (STRICT DATA ISOLATION)
router.get('/', async (req, res) => {
  try {
    const assignments = await db.prepare(`
      SELECT * FROM assignments 
      WHERE user_id = ? 
      ORDER BY datetime(created_at) DESC
    `).all(req.user.id);

    return res.json({ assignments });
  } catch (err) {
    console.error('Fetch assignments error:', err);
    return res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// 2. CREATE ASSIGNMENT
router.post('/', async (req, res) => {
  try {
    const { title, subject, topic, grade, language, assignment_type, word_count } = req.body;

    if (!title || !subject || !topic || !grade || !assignment_type) {
      return res.status(400).json({ error: 'Title, subject, topic, grade level, and assignment type are required.' });
    }

    const generatedContent = generateAssignmentContent({
      title,
      subject,
      topic,
      grade,
      language: language || 'English',
      assignmentType: assignment_type,
      wordCount: word_count || 500
    });

    const assignmentId = 'asgn_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO assignments (id, user_id, title, subject, topic, grade, language, assignment_type, word_count, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assignmentId,
      req.user.id,
      title,
      subject,
      topic,
      grade,
      language || 'English',
      assignment_type,
      parseInt(word_count) || 500,
      generatedContent,
      now,
      now
    );

    const createdAssignment = await db.prepare(`SELECT * FROM assignments WHERE id = ? AND user_id = ?`).get(assignmentId, req.user.id);

    return res.status(201).json({
      message: 'Assignment created successfully.',
      assignment: createdAssignment
    });
  } catch (err) {
    console.error('Create assignment error:', err);
    return res.status(500).json({ error: 'Failed to generate assignment.' });
  }
});

// 3. GET SINGLE ASSIGNMENT BY ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await db.prepare(`SELECT * FROM assignments WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or access denied.' });
    }

    return res.json({ assignment });
  } catch (err) {
    console.error('Get assignment error:', err);
    return res.status(500).json({ error: 'Failed to retrieve assignment.' });
  }
});

// 4. UPDATE ASSIGNMENT
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const assignmentId = req.params.id;

    const existing = await db.prepare(`SELECT * FROM assignments WHERE id = ? AND user_id = ?`).get(assignmentId, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found or access denied.' });
    }

    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE assignments 
      SET title = ?, content = ?, updated_at = ? 
      WHERE id = ? AND user_id = ?
    `).run(
      title || existing.title,
      content !== undefined ? content : existing.content,
      now,
      assignmentId,
      req.user.id
    );

    const updated = await db.prepare(`SELECT * FROM assignments WHERE id = ? AND user_id = ?`).get(assignmentId, req.user.id);

    return res.json({
      message: 'Assignment updated successfully.',
      assignment: updated
    });
  } catch (err) {
    console.error('Update assignment error:', err);
    return res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

// 5. DELETE ASSIGNMENT
router.delete('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const existing = await db.prepare(`SELECT * FROM assignments WHERE id = ? AND user_id = ?`).get(assignmentId, req.user.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found or access denied.' });
    }

    await db.prepare(`DELETE FROM assignments WHERE id = ? AND user_id = ?`).run(assignmentId, req.user.id);

    return res.json({ message: 'Assignment deleted successfully.' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    return res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

export default router;
