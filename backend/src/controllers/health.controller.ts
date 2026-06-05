import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const checkHealth = async (req: Request, res: Response): Promise<void> => {
  let dbStatus = 'disconnected';
  let dbError: string | null = null;
  try {
    // Run a query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error: any) {
    // Extract actual cause code if present (e.g. ECONNREFUSED)
    dbError = error.code || error.message || 'Database connection error';
    console.error('❌ Database connection verification failed:', error);
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      error: dbError
    }
  });
};
