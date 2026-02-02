import { Contracts, FaceHealth } from '@praapt/shared';
import { Router } from 'express';

import { getConfig } from '../config.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';

/** Type predicate for checking if a value is a record object */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const router = Router();
const routes = createRouteBuilder(router);

routes.fromContract(Contracts.getHealth, async () => {
  const config = getConfig();
  let face: FaceHealth = { ok: false, modelsLoaded: false, model: null, commit: 'unknown' };

  try {
    const r = await fetch(`${config.faceServiceUrl}/health`, { method: 'GET' });
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
    env: config.nodeEnv,
    commit: config.commitSha,
    face,
    config: {
      faceServiceUrl: config.faceServiceUrl,
      port: String(config.port),
      imagesDir: config.imagesDir,
      corsOrigin: config.corsOrigin,
    },
  };
});

routes.fromContract(Contracts.loadModel, async (req) => {
  const { model } = req.body;

  const { loadModel } = await import('../faceClient.js');
  await loadModel(model);

  logger.info({ model }, 'Model loaded successfully');
  return { ok: true as const, message: `Model '${model}' loaded successfully`, model };
});

export default router;
