import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireEmailVerified } from '../middleware/auth.js';
import { generateQuestionSetContent } from '../services/ai.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireEmailVerified);

// 1. GET ALL USER QUESTION SETS
router.get('/', async (req, res) => {
  try {
    const questionSets = await db.prepare(`
      SELECT * FROM question_sets 
      WHERE user_id = ? 
      ORDER BY datetime(created_at) DESC
    `).all(req.user.id);

    return res.json({ questionSets });
  } catch (err) {
    console.error('Fetch question sets error:', err);
    return res.status(500).json({ error: 'Failed to fetch question sets.' });
  }
});

// 2. GENERATE AND SAVE QUESTION SET
router.post('/', async (req, res) => {
  try {
    const { title, subject, topic, grade, question_type, count } = req.body;

    if (!title || !subject || !topic || !grade || !question_type) {
      return res.status(400).json({ error: 'Title, subject, topic, grade level, and question type are required.' });
    }

    const { questions, answers } = generateQuestionSetContent({
      title,
      subject,
      topic,
      grade,
      questionType: question_type,
      count: count || 5
    });

    const setId = 'qset_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO question_sets (id, user_id, title, subject, topic, grade, question_type, questions, answers, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      setId,
      req.user.id,
      title,
      subject,
      topic,
      grade,
      question_type,
      questions,
      answers,
      now,
      now
    );

    const createdSet = await db.prepare(`SELECT * FROM question_sets WHERE id = ? AND user_id = ?`).get(setId, req.user.id);

    return res.status(201).json({
      message: 'Question set generated successfully.',
      questionSet: createdSet
    });
  } catch (err) {
    console.error('Create question set error:', err);
    return res.status(500).json({ error: 'Failed to generate question set.' });
  }
});

// 3. GET SINGLE QUESTION SET BY ID
router.get('/:id', async (req, res) => {
  try {
    const questionSet = await db.prepare(`SELECT * FROM question_sets WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id);
    if (!questionSet) {
      return res.status(404).json({ error: 'Question set not found or access denied.' });
    }

    return res.json({ questionSet });
  } catch (err) {
    console.error('Get question set error:', err);
    return res.status(500).json({ error: 'Failed to retrieve question set.' });
  }
});

// 4. DELETE QUESTION SET
router.delete('/:id', async (req, res) => {
  try {
    const setId = req.params.id;
    const existing = await db.prepare(`SELECT * FROM question_sets WHERE id = ? AND user_id = ?`).get(setId, req.user.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Question set not found or access denied.' });
    }

    await db.prepare(`DELETE FROM question_sets WHERE id = ? AND user_id = ?`).run(setId, req.user.id);

    return res.json({ message: 'Question set deleted successfully.' });
  } catch (err) {
    console.error('Delete question set error:', err);
    return res.status(500).json({ error: 'Failed to delete question set.' });
  }
});

export default router;
