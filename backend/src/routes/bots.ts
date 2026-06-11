import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import unzipper from 'unzipper';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/tmp' });

const botQueue = new Queue('bot-deploy', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379
  }
});

// Middleware to mock auth for MVP. In production, check JWT.
const requireAuth = async (req: any, res: any, next: any) => {
  // For MVP, we pass userId in headers or use a hardcoded one if testing
  req.userId = req.headers['x-user-id'] || 'test-user-id';
  next();
};

router.post('/upload', requireAuth, upload.single('botZip'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No zip file uploaded');
  }

  const userId = req.userId;
  const botId = uuidv4();
  const extractDir = path.resolve(`bots/${userId}/${botId}`);
  
  try {
    await fs.mkdir(extractDir, { recursive: true });

    // Extract zip
    const zipPath = req.file.path;
    await unzipper.Open.file(zipPath).then(d => d.extract({ path: extractDir, concurrency: 5 }));

    // Create DB record
    const bot = await prisma.bot.create({
      data: {
        id: botId,
        userId: userId, // Assuming user exists or relation handles it
        name: req.body.name || 'Untitled Bot',
        zipPath: zipPath,
        status: 'QUEUED',
      }
    });

    // Enqueue job
    await botQueue.add('deploy', {
      botId,
      extractDir
    });

    res.json(bot);

  } catch (error) {
    console.error(error);
    res.status(500).send('Upload failed');
  }
});

router.get('/', requireAuth, async (req, res) => {
  const bots = await prisma.bot.findMany({
    where: { userId: req.userId }
  });
  res.json(bots);
});

export default router;
