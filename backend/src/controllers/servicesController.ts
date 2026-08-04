import type { Request, Response } from 'express';
import { z } from 'zod';
import { withSession } from '../db/driver.js';
import { getServiceById, listServices } from '../queries/services.js';
import { NotFoundError } from '../types/errors.js';

export const serviceIdParamsSchema = z.object({
  id: z.string().min(1),
});

export async function listServicesHandler(_req: Request, res: Response): Promise<void> {
  const services = await withSession((session) => listServices(session));
  res.json({ services });
}

export async function getServiceHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as z.infer<typeof serviceIdParamsSchema>;
  const service = await withSession((session) => getServiceById(session, id));
  if (!service) {
    throw new NotFoundError(`No service with id "${id}"`);
  }
  res.json({ service });
}
