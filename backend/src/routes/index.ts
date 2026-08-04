import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { leaderboardRouter } from './leaderboard.routes.js';
import { servicesRouter } from './services.routes.js';
import { shortestPathRouter } from './shortestPath.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/shortest-path', shortestPathRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
