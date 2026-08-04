import { Router } from 'express';
import { getHealthHandler } from '../controllers/healthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(getHealthHandler));
