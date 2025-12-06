import path from 'path';
import { fileURLToPath } from 'url';

import express, { json, static as expressStatic } from 'express';

import { NODE_ENV } from './env.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import imagesRoutes from './routes/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Allow larger JSON payloads for base64 images
app.use(json({ limit: '10mb' }));

// CORS middleware for dev
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/auth', authRoutes);

// Serve static frontend files in production
if (NODE_ENV === 'production') {
  const staticPath = process.env.STATIC_PATH
    ? path.resolve(process.env.STATIC_PATH)
    : path.join(__dirname, '../../web/dist');

  // eslint-disable-next-line no-console
  console.log(`Serving static files from: ${staticPath}`);
  app.use(expressStatic(staticPath));

  // SPA fallback - serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
