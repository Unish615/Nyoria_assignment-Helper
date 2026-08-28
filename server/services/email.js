import db from '../db/database.js';

export async function recordDevEmail({ userId, toEmail, subject, type, actionUrl }) {
  const id = 'email_' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO dev_email_logs (id, user_id, to_email, subject, type, action_url, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, toEmail, subject, type, actionUrl, now);

  console.log(`[EMAIL DISPATCH - ${type}] Sent to: ${toEmail} | Subject: "${subject}" | Action: ${actionUrl}`);
  return { id, actionUrl };
}

export async function sendVerificationEmail(user, token) {
  const actionUrl = `http://localhost:5173/verify-email?token=${token}`;
  const subject = 'Verify Your Email — Nyora Assignment Helper';
  
  return await recordDevEmail({
    userId: user.id,
    toEmail: user.email,
    subject,
    type: 'VERIFICATION',
    actionUrl
  });
}

export async function sendPasswordResetEmail(user, token) {
  const actionUrl = `http://localhost:5173/reset-password?token=${token}`;
  const subject = 'Reset Your Password — Nyora Assignment Helper';

  return await recordDevEmail({
    userId: user.id,
    toEmail: user.email,
    subject,
    type: 'PASSWORD_RESET',
    actionUrl
  });
}

export async function getDevEmails(userId = null) {
  if (userId) {
    return await db.prepare(`SELECT * FROM dev_email_logs WHERE user_id = ? ORDER BY sent_at DESC`).all(userId);
  }
  return await db.prepare(`SELECT * FROM dev_email_logs ORDER BY sent_at DESC LIMIT 50`).all();
}
