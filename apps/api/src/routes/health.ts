import {
  FaceHealth,
  HealthResponseSchema,
  LoadModelBodySchema,
  LoadModelResponseSchema,
} from '@praapt/shared';
import { Router } from 'express';

import { NODE_ENV } from '../env.js';
import { validatedHandler } from '../lib/errorHandler.js';
import { IMAGES_DIR } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';

/** Type predicate for checking if a value is a record object */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const router = Router();

router.get(
  '/health',
  validatedHandler({ response: HealthResponseSchema }, async () => {
    const faceUrl = process.env.FACE_SERVICE_URL || 'http://localhost:8001';
    let face: FaceHealth = { ok: false, modelsLoaded: false, model: null, commit: 'unknown' };

    try {
      const r = await fetch(`${faceUrl}/health`, { method: 'GET' });
      const j: unknown = await r.json();
      if (isRecord(j)) {
        face = {
          ...face,
          ok: Boolean(j.ok),
          modelsLoaded: Boolean(j.modelsLoaded),
          model: typeof j.model === 'string' ? j.model : face.model,
          commit: typeof j.commit === 'string' ? j.commit : face.commit,
        };
      }
    } catch {
      // face already initialized with defaults
    }

    return {
      ok: true as const,
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
  }),
);

router.post(
  '/load-model',
  validatedHandler(
    { body: LoadModelBodySchema, response: LoadModelResponseSchema },
    async (req) => {
      const { model } = req.body;

      const { loadModel } = await import('../faceClient.js');
      await loadModel(model);

      logger.info({ model }, 'Model loaded successfully');
      return { ok: true as const, message: `Model '${model}' loaded successfully`, model };
    },
  ),
);

export default router;
