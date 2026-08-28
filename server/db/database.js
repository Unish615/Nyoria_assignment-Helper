import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel / serverless, filesystem is read-only except /tmp
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const dataDir = process.env.DATABASE_DIR || (isVercel ? '/tmp' : path.join(__dirname, '..', 'data'));

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

const dbPath = path.join(dataDir, 'nyora.db');
const rawDb = new sqlite3.Database(dbPath);

rawDb.run('PRAGMA foreign_keys = ON');

class SQLiteWrapper {
  exec(sql) {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  prepare(sql) {
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          rawDb.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          rawDb.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          rawDb.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      }
    };
  }
}

const db = new SQLiteWrapper();

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;
  console.log('Initializing Nyora Database at:', dbPath);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile_image TEXT DEFAULT '',
      email_verified INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      grade TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'English',
      assignment_type TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 500,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS samples (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT,
      file_type TEXT NOT NULL,
      extracted_text TEXT,
      analysis TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS question_sets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      grade TEXT NOT NULL,
      question_type TEXT NOT NULL,
      questions TEXT NOT NULL,
      answers TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS dev_email_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL,
      action_url TEXT NOT NULL,
      sent_at TEXT NOT NULL
    );
  `);

  const existingAdmin = await db.prepare(`SELECT * FROM users WHERE email = ?`).get('admin@nyora.edu');
  if (!existingAdmin) {
    const adminId = 'usr_admin_' + Math.random().toString(36).substr(2, 9);
    const passHash = bcrypt.hashSync('AdminPass123!', 10);
    const now = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, profile_image, email_verified, role, created_at, updated_at, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'Nyora System Administrator',
      'admin@nyora.edu',
      passHash,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      1,
      'admin',
      now,
      now,
      now
    );
    console.log('Seeded initial admin user: admin@nyora.edu');
  }

  isInitialized = true;
  console.log('Database initialized successfully.');
}

export default db;
