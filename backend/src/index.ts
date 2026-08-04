import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { corsOrigins, env } from './config/env.js';
import { closeDriver, verifyDbConnectivity } from './db/driver.js';
import { openApiSpec } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`ImpactGraph API listening on port ${env.PORT}`);
  console.log(`Docs: http://localhost:${env.PORT}/api/docs`);
});

verifyDbConnectivity().then((reachable) => {
  if (!reachable) {
    console.warn('Warning: could not reach CognoDB at startup. Requests will surface a 503 until it recovers.');
  } else {
    console.log('Connected to CognoDB.');
  }
});

function shutdown(): void {
  console.log('\nShutting down...');
  server.close(() => {
    closeDriver().finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
