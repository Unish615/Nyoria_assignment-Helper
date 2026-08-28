import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db/database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, getDevEmails } from '../services/email.js';

const router = express.Router();

export function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) return false;

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length < 1) return false;
  if (!domain || !domain.includes('.')) return false;

  const domainParts = domain.split('.');
  if (domainParts.some(p => p.length === 0)) return false;
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;

  return true;
}

export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must contain at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  return { valid: true, message: 'Strong password' };
}

// ----------------------------------------------------
// 1. SIGN UP
// ----------------------------------------------------
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!isValidEmailFormat(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Duplicate email protection
    const existingUser = await db.prepare(`SELECT id FROM users WHERE email = ?`).get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in instead.' });
    }

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, profile_image, email_verified, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 'user', ?, ?)
    `).run(
      userId,
      full_name.trim(),
      cleanEmail,
      passwordHash,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      now,
      now
    );

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await db.prepare(`
      INSERT INTO verification_tokens (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, userId, expiresAt, now);

    const userObj = { id: userId, email: cleanEmail, full_name: full_name.trim() };
    const emailResult = await sendVerificationEmail(userObj, token);

    return res.status(201).json({
      message: "We've sent a verification link to your email address.",
      user_id: userId,
      email: cleanEmail,
      dev_verification_link: emailResult.actionUrl
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// ----------------------------------------------------
// 2. EMAIL VERIFICATION
// ----------------------------------------------------
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const tokenRecord = await db.prepare(`SELECT * FROM verification_tokens WHERE token = ?`).get(token);
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await db.prepare(`DELETE FROM verification_tokens WHERE token = ?`).run(token);
      return res.status(400).json({ error: 'Verification token has expired. Please request a new verification link.' });
    }

    // Mark email verified
    const now = new Date().toISOString();
    await db.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?`).run(now, tokenRecord.user_id);
    await db.prepare(`DELETE FROM verification_tokens WHERE token = ?`).run(token);

    const user = await db.prepare(`SELECT id, full_name, email FROM users WHERE id = ?`).get(tokenRecord.user_id);

    return res.json({
      message: 'Email Verified Successfully! You may now log in to your account.',
      verified: true,
      user
    });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: 'Email verification failed.' });
  }
});

// ----------------------------------------------------
// 3. RESEND VERIFICATION EMAIL
// ----------------------------------------------------
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!isValidEmailFormat(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const user = await db.prepare(`SELECT id, full_name, email, email_verified FROM users WHERE email = ?`).get(cleanEmail);
    if (!user) {
      return res.json({ message: 'If an account exists for this email, a verification link has been sent.' });
    }

    if (user.email_verified === 1) {
      return res.status(400).json({ error: 'Your email address is already verified. Please log in.' });
    }

    await db.prepare(`DELETE FROM verification_tokens WHERE user_id = ?`).run(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO verification_tokens (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, expiresAt, now);

    const emailResult = await sendVerificationEmail(user, token);

    return res.json({
      message: 'A new verification link has been sent to your email address.',
      dev_verification_link: emailResult.actionUrl
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});

// ----------------------------------------------------
// 4. LOGIN
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!isValidEmailFormat(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = await db.prepare(`SELECT * FROM users WHERE email = ?`).get(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before continuing.' });
    }

    const now = new Date().toISOString();
    await db.prepare(`UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?`).run(now, now, user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('nyora_session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      profile_image: user.profile_image,
      email_verified: Boolean(user.email_verified),
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: now
    };

    return res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
});

// ----------------------------------------------------
// 5. LOGOUT
// ----------------------------------------------------
router.post('/logout', (req, res) => {
  res.clearCookie('nyora_session');
  return res.json({ message: 'Logged out successfully' });
});

// ----------------------------------------------------
// 6. GET CURRENT USER
// ----------------------------------------------------
router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

// ----------------------------------------------------
// 7. FORGOT PASSWORD
// ----------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!isValidEmailFormat(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const user = await db.prepare(`SELECT id, full_name, email FROM users WHERE email = ?`).get(cleanEmail);
    if (!user) {
      return res.json({ message: 'If an account exists for this email, a password reset link has been sent.' });
    }

    await db.prepare(`UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?`).run(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO password_reset_tokens (token, user_id, expires_at, used, created_at)
      VALUES (?, ?, ?, 0, ?)
    `).run(token, user.id, expiresAt, now);

    const emailResult = await sendPasswordResetEmail(user, token);

    return res.json({
      message: 'If an account exists for this email, a password reset link has been sent.',
      dev_reset_link: emailResult.actionUrl
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// ----------------------------------------------------
// 8. RESET PASSWORD
// ----------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Password reset token is required.' });
    }

    const passCheck = validatePasswordStrength(new_password);
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const tokenRecord = await db.prepare(`SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0`).get(token);
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired password reset link.' });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Password reset link has expired. Please request a new link.' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    const now = new Date().toISOString();

    await db.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`).run(newHash, now, tokenRecord.user_id);
    await db.prepare(`UPDATE password_reset_tokens SET used = 1 WHERE token = ?`).run(token);

    return res.json({ message: 'Password updated successfully. You can now log in using your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ----------------------------------------------------
// 9. UPDATE PROFILE
// ----------------------------------------------------
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, profile_image, current_password, new_password, confirm_password } = req.body;
    const userId = req.user.id;
    const now = new Date().toISOString();

    const user = await db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);

    if (full_name && full_name.trim().length >= 2) {
      await db.prepare(`UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?`).run(full_name.trim(), now, userId);
    }

    if (profile_image !== undefined) {
      await db.prepare(`UPDATE users SET profile_image = ?, updated_at = ? WHERE id = ?`).run(profile_image, now, userId);
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Please enter your current password to set a new password.' });
      }

      const isCurrentMatch = bcrypt.compareSync(current_password, user.password_hash);
      if (!isCurrentMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      const passCheck = validatePasswordStrength(new_password);
      if (!passCheck.valid) {
        return res.status(400).json({ error: passCheck.message });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({ error: 'New passwords do not match.' });
      }

      const newHash = bcrypt.hashSync(new_password, 10);
      await db.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`).run(newHash, now, userId);
    }

    const updatedUser = await db.prepare(`SELECT id, full_name, email, profile_image, email_verified, role, created_at, updated_at, last_login FROM users WHERE id = ?`).get(userId);

    return res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ----------------------------------------------------
// 10. GET DEV EMAIL LOGS
// ----------------------------------------------------
router.get('/dev-emails', async (req, res) => {
  const emails = await getDevEmails();
  return res.json({ emails });
});

export default router;
