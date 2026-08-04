import type { NextFunction, Request, Response } from 'express';
import { isDatabaseUnreachableError } from '../db/driver.js';
import { env } from '../config/env.js';
import { NotFoundError } from '../types/errors.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'not_found', message: 'No such route.' });
}

// Express identifies error-handling middleware by arity — all four
// parameters must stay, even though `_req`/`_next` are unused.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (isDatabaseUnreachableError(err)) {
    res.status(503).json({
      error: 'database_unreachable',
      message: 'Could not reach CognoDB. Please check back shortly.',
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: 'not_found', message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'internal_error',
    message: env.NODE_ENV === 'production' ? 'Something went wrong.' : String(err),
  });
}
