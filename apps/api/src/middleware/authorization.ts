import type { RequestHandler } from 'express';
import type { UserRole } from '@praapt/shared';

import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

/**
 * Middleware: require authentication and specific role(s).
 * Must be used AFTER requireAuth middleware.
 *
 * @param roles - Allowed roles for this endpoint
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- role from DB is validated by UserRoleSchema
    const userRole = req.user.role as UserRole | null;

    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
    }

    next();
  };
}

/**
 * Middleware: require authentication with any non-unknown role.
 * Users with 'unknown' role are denied (they need admin to assign a role).
 */
export function requireActiveRole(): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- role from DB is validated by UserRoleSchema
    const userRole = req.user.role as UserRole | null;

    if (!userRole || userRole === 'unknown') {
      throw new ForbiddenError('Access denied. Please contact an administrator to assign a role.');
    }

    next();
  };
}

