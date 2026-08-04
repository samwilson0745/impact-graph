import { Router } from 'express';
import {
  getSharedDatabaseRiskHandler,
  getSinglePointsOfFailureHandler,
  getBlastRadiusHandler,
  getTeamsToNotifyHandler,
  maxHopsQuerySchema,
} from '../controllers/impactController.js';
import { getServiceHandler, listServicesHandler, serviceIdParamsSchema } from '../controllers/servicesController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

export const servicesRouter = Router();

servicesRouter.get('/', asyncHandler(listServicesHandler));

servicesRouter.get('/:id', validate({ params: serviceIdParamsSchema }), asyncHandler(getServiceHandler));

servicesRouter.get(
  '/:id/blast-radius',
  validate({ params: serviceIdParamsSchema, query: maxHopsQuerySchema }),
  asyncHandler(getBlastRadiusHandler),
);

servicesRouter.get(
  '/:id/teams-to-notify',
  validate({ params: serviceIdParamsSchema, query: maxHopsQuerySchema }),
  asyncHandler(getTeamsToNotifyHandler),
);

servicesRouter.get(
  '/:id/single-points-of-failure',
  validate({ params: serviceIdParamsSchema, query: maxHopsQuerySchema }),
  asyncHandler(getSinglePointsOfFailureHandler),
);

servicesRouter.get(
  '/:id/shared-database-risk',
  validate({ params: serviceIdParamsSchema }),
  asyncHandler(getSharedDatabaseRiskHandler),
);
