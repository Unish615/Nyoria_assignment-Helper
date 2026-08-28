import app from '../server/app.js';
import { initDatabase } from '../server/db/database.js';

export default async function handler(req, res) {
  await initDatabase();
  return app(req, res);
}
