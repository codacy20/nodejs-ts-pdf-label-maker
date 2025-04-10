import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './config/inversify.config.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import { TYPES } from './constants/types.js';
import { RequestLogger } from './utils/RequestLogger.js';
import { ILogger } from './utils/Logger.js';

const logger = container.get<ILogger>(TYPES.Logger);
const requestLogger = container.get<RequestLogger>(TYPES.RequestLogger);

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.use(requestLogger.middleware());
  
  const assetsPath = process.env.ASSETS_PATH || path.join(process.cwd(), '..', 'assets');
  app.use('/assets', express.static(assetsPath));
  logger.info(`Serving static files from: ${assetsPath}`);
});

const app = server.build();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.stack });
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
});

export { app };
