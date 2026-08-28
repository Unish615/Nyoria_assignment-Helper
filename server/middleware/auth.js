import jwt from 'jsonwebtoken';
import db from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'nyora_secret_key_prod_2026_secure_hash';

export async function authenticateToken(req, res, next) {
  let token = req.cookies?.nyora_session;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare(`SELECT id, full_name, email, profile_image, email_verified, role, created_at, updated_at, last_login FROM users WHERE id = ?`).get(decoded.id);

    if (!user) {
      res.clearCookie('nyora_session');
      return res.status(401).json({ error: 'User account no longer exists. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('nyora_session');
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

export function requireEmailVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!req.user.email_verified) {
    return res.status(403).json({ error: 'Please verify your email before continuing.' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
