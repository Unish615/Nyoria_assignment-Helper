import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireEmailVerified } from '../middleware/auth.js';
import { analyzeSampleDocument } from '../services/ai.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireEmailVerified);

// 1. GET USER SAMPLES
router.get('/', async (req, res) => {
  try {
    const samples = await db.prepare(`
      SELECT * FROM samples 
      WHERE user_id = ? 
      ORDER BY datetime(created_at) DESC
    `).all(req.user.id);

    return res.json({ samples });
  } catch (err) {
    console.error('Fetch samples error:', err);
    return res.status(500).json({ error: 'Failed to fetch sample papers.' });
  }
});

// 2. CREATE SAMPLE / ANALYZE
router.post('/', async (req, res) => {
  try {
    const { file_name, file_type, extracted_text } = req.body;

    if (!file_name || !extracted_text) {
      return res.status(400).json({ error: 'File name and text content are required.' });
    }

    const sampleId = 'smpl_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const analysisResult = analyzeSampleDocument({
      fileName: file_name,
      extractedText: extracted_text
    });

    await db.prepare(`
      INSERT INTO samples (id, user_id, file_name, file_url, file_type, extracted_text, analysis, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sampleId,
      req.user.id,
      file_name,
      '',
      file_type || 'TXT',
      extracted_text,
      analysisResult,
      now
    );

    const createdSample = await db.prepare(`SELECT * FROM samples WHERE id = ? AND user_id = ?`).get(sampleId, req.user.id);

    return res.status(201).json({
      message: 'Sample analyzed and saved successfully.',
      sample: createdSample
    });
  } catch (err) {
    console.error('Analyze sample error:', err);
    return res.status(500).json({ error: 'Failed to process sample document.' });
  }
});

// 3. DELETE SAMPLE
router.delete('/:id', async (req, res) => {
  try {
    const sampleId = req.params.id;
    const existing = await db.prepare(`SELECT * FROM samples WHERE id = ? AND user_id = ?`).get(sampleId, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Sample paper not found or access denied.' });
    }

    await db.prepare(`DELETE FROM samples WHERE id = ? AND user_id = ?`).run(sampleId, req.user.id);

    return res.json({ message: 'Sample paper deleted successfully.' });
  } catch (err) {
    console.error('Delete sample error:', err);
    return res.status(500).json({ error: 'Failed to delete sample paper.' });
  }
});

export default router;
