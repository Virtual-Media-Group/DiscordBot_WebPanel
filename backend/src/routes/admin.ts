import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check admin (simplified for MVP)
const requireAdmin = async (req: any, res: any, next: any) => {
  // In a real app, verify the token from Authorization header and fetch user role
  // For MVP, we assume the token is passed and verified (omitted for brevity)
  next(); 
};

router.get('/settings', requireAdmin, async (req, res) => {
  const settings = await prisma.setting.findMany();
  res.json(settings);
});

router.post('/settings', requireAdmin, async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).send('Missing key or value');
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  res.json(setting);
});

export default router;
