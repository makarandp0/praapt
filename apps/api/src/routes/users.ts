import { ListUsersResponseSchema } from '@praapt/shared';
import { Router } from 'express';

import { db, users } from '../db.js';
import { validatedHandler } from '../lib/errorHandler.js';

const router = Router();

/**
 * GET /users
 * List all users (without sensitive data like face embeddings)
 */
router.get(
  '/',
  validatedHandler({ response: ListUsersResponseSchema }, async () => {
    const allUsers = await db.select().from(users);

    // Return users without face embeddings (they're large and sensitive)
    const sanitizedUsers = allUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImagePath: user.profileImagePath,
      faceRegisteredAt: user.faceRegisteredAt?.toISOString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? null,
      updatedAt: user.updatedAt?.toISOString() ?? null,
    }));

    return {
      ok: true as const,
      users: sanitizedUsers,
      count: sanitizedUsers.length,
    };
  }),
);

export default router;
