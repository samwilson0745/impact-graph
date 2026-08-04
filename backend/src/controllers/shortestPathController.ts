import type { Request, Response } from 'express';
import { z } from 'zod';
import { withSession } from '../db/driver.js';
import { getServiceById } from '../queries/services.js';
import { getShortestPath } from '../queries/shortestPath.js';
import { NotFoundError } from '../types/errors.js';

export const shortestPathQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export async function getShortestPathHandler(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as unknown as z.infer<typeof shortestPathQuerySchema>;

  const result = await withSession(async (session) => {
    // A single Session serializes queries one at a time — running these two
    // concurrently via Promise.all corrupts the session's request/response
    // ordering, so they're awaited sequentially instead.
    const fromService = await getServiceById(session, from);
    if (!fromService) throw new NotFoundError(`No service with id "${from}"`);
    const toService = await getServiceById(session, to);
    if (!toService) throw new NotFoundError(`No service with id "${to}"`);

    return getShortestPath(session, from, to);
  });

  if (!result) {
    res.status(404).json({
      error: 'no_path_found',
      message: `No path connects "${from}" and "${to}".`,
    });
    return;
  }

  res.json(result);
}
