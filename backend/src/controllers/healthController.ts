import type { Request, Response } from 'express';
import { verifyDbConnectivity } from '../db/driver.js';

export async function getHealthHandler(_req: Request, res: Response): Promise<void> {
  const dbReachable = await verifyDbConnectivity();
  res.status(dbReachable ? 200 : 503).json({
    status: dbReachable ? 'ok' : 'database_unreachable',
    database: dbReachable ? 'connected' : 'unreachable',
  });
}
