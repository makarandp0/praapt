import { FaceHealth, HealthResponse } from '@praapt/shared';
import { Router } from 'express';
import { z } from 'zod';

import { NODE_ENV } from '../env.js';
import { IMAGES_DIR } from '../lib/imageUtils.js';

const LoadModelBodySchema = z.object({
  model: z.enum(['buffalo_l', 'buffalo_s']),
});

const router = Router();

router.get('/health', async (_req, res) => {
  const faceUrl = process.env.FACE_SERVICE_URL || 'http://localhost:8000';
  let face: FaceHealth;

  try {
    const r = await fetch(`${faceUrl}/health`, { method: 'GET' });
    const j = await r.json();
    face = {
      ok: Boolean(j?.ok),
      modelsLoaded: Boolean(j?.modelsLoaded),
      model: j?.model || null,
      commit: j?.commit || 'unknown',
    };
  } catch {
    face = { ok: false };
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

router.post('/load-model', async (req, res) => {
  try {
    const { model } = LoadModelBodySchema.parse(req.body);

    const { loadModel } = await import('../faceClient.js');
    await loadModel(model);

    return res.json({ ok: true, message: `Model '${model}' loaded successfully`, model });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('load-model error', err);
    return res.status(500).json({ error: 'failed to load model' });
  }
});

export default router;
