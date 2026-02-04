import type { Request, Response, NextFunction } from 'express';
import { sql } from 'drizzle-orm';

import { isFirebaseConfigured } from '../config.js';
import { db, users, type User } from '../db.js';
import { getFirebaseAuth } from '../lib/firebase-admin.js';
import { logger } from '../lib/logger.js';

// Extend Express Request type to include user
 
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Extract Bearer token from Authorization header.
 */
function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Authentication middleware that verifies Firebase tokens and attaches user to request.
 * Creates user in database if they don't exist (upsert by firebaseUid).
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // If Firebase is not configured, return 503
  if (!isFirebaseConfigured()) {
    res.status(503).json({ ok: false, error: 'Authentication service not configured' });
    return;
  }

  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ ok: false, error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    // Verify token with Firebase
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);

    const { uid, email, name, picture } = decodedToken;
    const provider = decodedToken.firebase?.sign_in_provider ?? null;

    if (!email) {
      res.status(401).json({ ok: false, error: 'Token missing email claim' });
      return;
    }

    // Upsert user in database using atomic operation to avoid race conditions
    const [user] = await db
      .insert(users)
      .values({
        firebaseUid: uid,
        email,
        name: name ?? null,
        provider: provider ?? null,
        photoUrl: picture ?? null,
        role: 'unknown',
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email,
          // Use COALESCE to preserve existing values when new values are null
          name: sql`COALESCE(${name ?? null}, ${users.name})`,
          provider: sql`COALESCE(${provider ?? null}, ${users.provider})`,
          photoUrl: sql`COALESCE(${picture ?? null}, ${users.photoUrl})`,
        },
      })
      .returning();

    logger.debug({ userId: user.id, email }, 'User upserted');

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Log detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Extract error code if present (Firebase errors have a code property)
    let errorCode: string | undefined;
    if (error && typeof error === 'object' && 'code' in error) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrowed by 'in' check above
      const errWithCode = error as Record<string, unknown>;
      errorCode = typeof errWithCode.code === 'string' ? errWithCode.code : undefined;
    }

    // Distinguish Firebase auth errors from internal server errors
    const isAuthError =
      (typeof errorCode === 'string' && errorCode.startsWith('auth/')) ||
      (error instanceof Error && error.name === 'FirebaseAuthError');

    const isDev = process.env.NODE_ENV !== 'production';

    if (isAuthError) {
      logger.warn({ error, errorCode, errorMessage }, 'Token verification failed');
      res.status(401).json({
        ok: false,
        error: isDev
          ? `Token verification failed: ${errorCode ?? errorMessage}`
          : 'Invalid or expired token',
      });
    } else {
      // Non-authentication failures (e.g. database/persistence issues)
      logger.error({ error, errorCode, errorMessage }, 'Auth middleware internal error');
      res.status(500).json({
        ok: false,
        error: isDev
          ? `Authentication service error: ${errorMessage}`
          : 'Internal server error',
      });
    }
  }
}

/**
 * Optional authentication middleware - attaches user if token is present,
 * but doesn't fail if no token is provided.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    next();
    return;
  }

  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    next();
    return;
  }

  // If token is present, verify it (will fail on invalid tokens)
  await requireAuth(req, res, next);
}
