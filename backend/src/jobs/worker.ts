import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();
const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

async function detectRuntime(dir: string): Promise<'node' | 'python' | null> {
  const files = await fs.readdir(dir);
  if (files.includes('package.json')) return 'node';
  if (files.includes('requirements.txt')) return 'python';
  return null;
}

export function initWorker() {
  const worker = new Worker('bot-deploy', async (job: Job) => {
    const { botId, extractDir } = job.data;
    
    await prisma.bot.update({
      where: { id: botId },
      data: { status: 'BUILDING' }
    });

    const runtime = await detectRuntime(extractDir);
    if (!runtime) {
      throw new Error('Unsupported runtime. Needs package.json or requirements.txt');
    }

    const image = runtime === 'node' ? 'node:22-alpine' : 'python:3.12-alpine';
    const bindPath = `${extractDir}:/app`;

    // Retrieve environment variables
    const envVars = await prisma.envVar.findMany({ where: { botId } });
    const env = envVars.map(ev => `${ev.key}=${ev.encryptedValue}`); // Simplified for MVP

    const container = await docker.createContainer({
      Image: image,
      Cmd: runtime === 'node' 
        ? ['sh', '-c', 'npm install && npm start'] 
        : ['sh', '-c', 'pip install -r requirements.txt && python main.py'],
      Env: env,
      HostConfig: {
        Binds: [bindPath],
        AutoRemove: true,
        NetworkMode: 'none', // Strict isolation
        CpuPeriod: 100000,
        CpuQuota: 50000, // 50% CPU
        Memory: 256 * 1024 * 1024, // 256 MB
      },
    });

    await container.start();
    const containerInfo = await container.inspect();

    await prisma.bot.update({
      where: { id: botId },
      data: { 
        status: 'RUNNING',
        runtime,
        containerId: containerInfo.Id
      }
    });

    console.log(`Bot ${botId} running in container ${containerInfo.Id}`);
  }, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379
    }
  });

  worker.on('failed', async (job, err) => {
    console.error(`Job failed: ${job?.id}, error: ${err.message}`);
    if (job?.data?.botId) {
      await prisma.bot.update({
        where: { id: job.data.botId },
        data: { status: 'ERROR' }
      });
    }
  });

  return worker;
}
