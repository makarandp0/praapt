import { Contracts, type UserRole } from '@praapt/shared';
import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { validatedHandler } from '../lib/errorHandler.js';

const router = Router();

// GET /me - Get current authenticated user
router.get(
  Contracts.getMe.path,
  requireAuth,
  validatedHandler(
    { response: Contracts.getMe.response },
    async (req) => {
      const user = req.user!;

      return {
        ok: true as const,
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          provider: user.provider,
          photoUrl: user.photoUrl,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- role from DB is validated by Zod schema
          role: user.role as UserRole | null,
          createdAt: user.createdAt?.toISOString() ?? null,
          updatedAt: user.updatedAt?.toISOString() ?? null,
        },
      };
    },
  ),
);

export default router;
