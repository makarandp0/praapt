import { HealthResponse } from '@praapt/shared';
import { Router } from 'express';

import { NODE_ENV } from '../env.js';
import { IMAGES_DIR } from '../lib/imageUtils.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const faceUrl = process.env.FACE_SERVICE_URL || 'http://localhost:8000';
  let face: { ok: boolean; modelsLoaded?: boolean; model?: string | null } = { ok: false };

  try {
    const r = await fetch(`${faceUrl}/health`, { method: 'GET' });
    const j = await r.json();
    face = {
      ok: Boolean(j?.ok),
      modelsLoaded: Boolean(j?.modelsLoaded),
      model: j?.model || null,
    };
  } catch {
    face = { ok: false };
  }

  const payload: HealthResponse = {
    ok: true,
    service: 'api',
    env: NODE_ENV,
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
    const { model } = req.body as { model?: string };
    if (!model || (model !== 'buffalo_l' && model !== 'buffalo_s')) {
      return res.status(400).json({ error: "model must be 'buffalo_l' or 'buffalo_s'" });
    }

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
