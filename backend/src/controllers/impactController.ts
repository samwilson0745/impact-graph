import type { Session } from 'neo4j-driver';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { withSession } from '../db/driver.js';
import { getServiceById } from '../queries/services.js';
import { getSinglePointsOfFailure } from '../queries/singlePointOfFailure.js';
import { getSharedDatabaseRisk } from '../queries/sharedDatabaseRisk.js';
import { getTeamsToNotify } from '../queries/teamsToNotify.js';
import { getBlastRadius } from '../services/impactService.js';
import { NotFoundError } from '../types/errors.js';
import { serviceIdParamsSchema } from './servicesController.js';

async function requireServiceExists(session: Session, serviceId: string): Promise<void> {
  const service = await getServiceById(session, serviceId);
  if (!service) {
    throw new NotFoundError(`No service with id "${serviceId}"`);
  }
}

export const maxHopsQuerySchema = z.object({
  maxHops: z.coerce.number().int().min(1).max(6).default(4),
});

export async function getBlastRadiusHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as z.infer<typeof serviceIdParamsSchema>;
  const { maxHops } = req.query as unknown as z.infer<typeof maxHopsQuerySchema>;

  const result = await withSession((session) => getBlastRadius(session, id, maxHops));
  res.json(result);
}

export async function getTeamsToNotifyHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as z.infer<typeof serviceIdParamsSchema>;
  const { maxHops } = req.query as unknown as z.infer<typeof maxHopsQuerySchema>;

  const teams = await withSession(async (session) => {
    await requireServiceExists(session, id);
    return getTeamsToNotify(session, id, maxHops);
  });
  res.json({ teams });
}

export async function getSinglePointsOfFailureHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as z.infer<typeof serviceIdParamsSchema>;
  const { maxHops } = req.query as unknown as z.infer<typeof maxHopsQuerySchema>;

  const singlePointsOfFailure = await withSession(async (session) => {
    await requireServiceExists(session, id);
    return getSinglePointsOfFailure(session, id, maxHops);
  });
  res.json({ singlePointsOfFailure });
}

export async function getSharedDatabaseRiskHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as z.infer<typeof serviceIdParamsSchema>;

  const atRisk = await withSession(async (session) => {
    await requireServiceExists(session, id);
    return getSharedDatabaseRisk(session, id);
  });
  res.json({ atRisk });
}
