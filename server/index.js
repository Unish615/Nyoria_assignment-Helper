import app from './app.js';
import { initDatabase } from './db/database.js';

const PORT = process.env.PORT || 5005;

await initDatabase();

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Nyora Backend Server listening on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
