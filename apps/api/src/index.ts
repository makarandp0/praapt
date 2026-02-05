import path from 'path';

import express, { json, static as expressStatic } from 'express';

import { getConfig } from './config.js';
import { errorHandler } from './lib/errorHandler.js';
import { initializeFirebase } from './lib/firebase-admin.js';
import { logger } from './lib/logger.js';
import customersRoutes from './routes/customers.js';
import demoRoutes from './routes/demo.js';
import faceRegistrationsRoutes from './routes/faceRegistrations.js';
import healthRoutes from './routes/health.js';
import imagesRoutes from './routes/images.js';
import kioskRoutes from './routes/kiosk.js';
import userRoutes from './routes/user.js';

const config = getConfig();

// Initialize Firebase Admin SDK (safe to call even if not configured)
initializeFirebase();

const app = express();

// Allow larger JSON payloads for base64 images
app.use(json({ limit: '10mb' }));

// CORS middleware for dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.corsOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

// Mount API routes - all routes define their full paths relative to /api
app.use('/api', healthRoutes);
app.use('/api', imagesRoutes);
app.use('/api', customersRoutes);
app.use('/api', faceRegistrationsRoutes);
app.use('/api', demoRoutes);
app.use('/api', kioskRoutes);
app.use('/api', userRoutes);

// Serve static frontend files in production
if (config.nodeEnv === 'production') {
  logger.info({ staticPath: config.staticPath }, 'Serving static files');
  app.use(expressStatic(config.staticPath));

  // SPA fallback - serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(config.staticPath, 'index.html'));
  });
}

// Global error handler - must be last
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'API server started');
});
