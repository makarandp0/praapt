import { FaceHealth, HealthResponse } from '@praapt/shared';
import { Router } from 'express';
import { z } from 'zod';

import { NODE_ENV } from '../env.js';
import { asyncHandler } from '../lib/errorHandler.js';
import { IMAGES_DIR } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';

const LoadModelBodySchema = z.object({
  model: z.enum(['buffalo_l', 'buffalo_s']),
});

const router = Router();

router.get('/health', async (_req, res) => {
  const faceUrl = process.env.FACE_SERVICE_URL || 'http://localhost:8000';
  let face: FaceHealth = { ok: false, modelsLoaded: false, model: null, commit: 'unknown' };

  try {
    const r = await fetch(`${faceUrl}/health`, { method: 'GET' });
    const j = await r.json();
    face = {
      ...face,
      ok: Boolean(j?.ok),
      modelsLoaded: Boolean(j?.modelsLoaded),
      model: j?.model ?? face.model,
      commit: j?.commit ?? face.commit,
    };
  } catch {
    // face already initialized with defaults
  }

  const payload: HealthResponse = {
    ok: true,
    service: 'api',
    env: NODE_ENV,
    commit: process.env.GIT_COMMIT || process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    face,
    config: {
      faceServiceUrl: faceUrl,
      port: process.env.PORT || '3000',
      imagesDir: IMAGES_DIR,
      corsOrigin: process.env.CORS_ORIGIN || '*',
    },
  };

  return res.json(payload);
});

router.post(
  '/load-model',
  asyncHandler(async (req, res) => {
    const { model } = LoadModelBodySchema.parse(req.body);

    const { loadModel } = await import('../faceClient.js');
    await loadModel(model);

    logger.info({ model }, 'Model loaded successfully');
    return res.json({ ok: true, message: `Model '${model}' loaded successfully`, model });
  }),
);

export default router;
