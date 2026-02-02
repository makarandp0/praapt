import { Contracts } from '@praapt/shared';
import { Router } from 'express';

import { db, faceRegistrations } from '../db.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';

const router = Router();
const routes = createRouteBuilder(router);

/**
 * GET /face-registrations
 * List all face registrations (without sensitive data like face embeddings)
 */
routes.fromContract(Contracts.listFaceRegistrations, async () => {
  const allRegistrations = await db.select().from(faceRegistrations);

  // Return registrations without face embeddings (they're large and sensitive)
  const sanitizedRegistrations = allRegistrations.map((reg) => ({
    id: reg.id,
    email: reg.email,
    name: reg.name,
    profileImagePath: reg.profileImagePath,
    faceRegisteredAt: reg.faceRegisteredAt?.toISOString() ?? null,
    createdAt: reg.createdAt?.toISOString() ?? null,
    updatedAt: reg.updatedAt?.toISOString() ?? null,
  }));

  return {
    ok: true as const,
    registrations: sanitizedRegistrations,
    count: sanitizedRegistrations.length,
  };
});

export default router;
