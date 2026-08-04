import type { Request, Response } from 'express';
import { z } from 'zod';
import { withSession } from '../db/driver.js';
import { getRiskiestServices } from '../queries/riskiestServices.js';

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export async function getRiskiestServicesHandler(req: Request, res: Response): Promise<void> {
  const { limit } = req.query as unknown as z.infer<typeof leaderboardQuerySchema>;
  const riskiest = await withSession((session) => getRiskiestServices(session, limit));
  res.json({ riskiest });
}
