import { Router } from 'express';
import { getRiskiestServicesHandler, leaderboardQuerySchema } from '../controllers/leaderboardController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

export const leaderboardRouter = Router();

leaderboardRouter.get(
  '/riskiest-services',
  validate({ query: leaderboardQuerySchema }),
  asyncHandler(getRiskiestServicesHandler),
);
