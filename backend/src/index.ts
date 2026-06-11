import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import botsRouter from './routes/bots';
import adminRouter from './routes/admin';
import updatesRouter from './routes/updates';
import { initWorker } from './jobs/worker';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/bots', botsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/updates', updatesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize the deployment worker
initWorker();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
