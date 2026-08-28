import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import assignmentsRouter from './routes/assignments.js';
import samplesRouter from './routes/samples.js';
import questionsRouter from './routes/questions.js';
import adminRouter from './routes/admin.js';
import documentsRouter from './routes/documents.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/samples', samplesRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/documents', documentsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Nyora Assignment Helper Backend',
    timestamp: new Date().toISOString()
  });
});

export default app;
