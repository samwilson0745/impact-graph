import { Router } from 'express';
import { getShortestPathHandler, shortestPathQuerySchema } from '../controllers/shortestPathController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

export const shortestPathRouter = Router();

shortestPathRouter.get(
  '/',
  validate({ query: shortestPathQuerySchema }),
  asyncHandler(getShortestPathHandler),
);
