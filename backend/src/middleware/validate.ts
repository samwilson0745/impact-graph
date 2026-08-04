import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

/**
 * Validates req.params/req.query against Zod schemas and replaces them with
 * the parsed (coerced, defaulted) values before the handler runs. Every
 * route handler reads already-validated data — no route touches raw
 * req.params/req.query directly.
 */
export function validate(schemas: { params?: ZodType; query?: ZodType }): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({ error: 'invalid_params', issues: result.error.issues });
        return;
      }
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({ error: 'invalid_query', issues: result.error.issues });
        return;
      }
      req.query = result.data as typeof req.query;
    }

    next();
  };
}
