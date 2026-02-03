import { Contracts, type UserRole, parseUserRole } from '@praapt/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db, users } from '../db.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';
import { validatedHandler } from '../lib/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

/** Roles that admins cannot modify (only developers can change these) */
const ADMIN_RESTRICTED_ROLES: UserRole[] = ['developer'];

const router = Router();
const routes = createRouteBuilder(router);

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
          role: parseUserRole(user.role),
          createdAt: user.createdAt?.toISOString() ?? null,
          updatedAt: user.updatedAt?.toISOString() ?? null,
        },
      };
    },
  ),
);

/**
 * GET /users - List all users
 * Auth: developer, admin (auto-applied from contract)
 */
routes.fromContract(Contracts.listUsers, async () => {
  const allUsers = await db.select().from(users);

  const formattedUsers = allUsers.map((u) => ({
    id: u.id,
    firebaseUid: u.firebaseUid,
    email: u.email,
    name: u.name,
    provider: u.provider,
    photoUrl: u.photoUrl,
    role: parseUserRole(u.role),
    createdAt: u.createdAt?.toISOString() ?? null,
    updatedAt: u.updatedAt?.toISOString() ?? null,
  }));

  return {
    ok: true as const,
    users: formattedUsers,
    count: formattedUsers.length,
  };
});

/**
 * PATCH /users/:id/role - Update user role
 * Auth: developer, admin (auto-applied from contract)
 *
 * Permission rules:
 * - Developers can update any user's role
 * - Admins cannot change a developer's role
 * - Admins cannot assign developer role to anyone
 */
routes.fromContract(Contracts.updateUserRole, async (req) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- params typed as Record for Express compatibility
  const { id } = req.params as { id: string };
  const { role: newRole } = req.body;

  const currentUserRole = parseUserRole(req.user!.role);

  // Admins have restrictions (developers can do anything)
  if (currentUserRole === 'admin') {
    // Cannot assign developer role
    if (ADMIN_RESTRICTED_ROLES.includes(newRole)) {
      throw new ForbiddenError('Admins cannot assign developer role');
    }

    // Check if target user is a developer (cannot modify their role)
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const targetRole = parseUserRole(targetUser?.role);
    if (targetRole && ADMIN_RESTRICTED_ROLES.includes(targetRole)) {
      throw new ForbiddenError('Admins cannot modify developer roles');
    }
  }

  // Find and update the user
  const [updatedUser] = await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (!updatedUser) {
    throw new NotFoundError(`User not found: ${id}`);
  }

  return {
    ok: true as const,
    user: {
      id: updatedUser.id,
      firebaseUid: updatedUser.firebaseUid,
      email: updatedUser.email,
      name: updatedUser.name,
      provider: updatedUser.provider,
      photoUrl: updatedUser.photoUrl,
      role: parseUserRole(updatedUser.role),
      createdAt: updatedUser.createdAt?.toISOString() ?? null,
      updatedAt: updatedUser.updatedAt?.toISOString() ?? null,
    },
  };
});

export default router;
