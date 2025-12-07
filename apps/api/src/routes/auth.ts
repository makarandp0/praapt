import fs from 'fs';
import path from 'path';

import { LoginBodySchema, SignupBodySchema } from '@praapt/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db, users } from '../db.js';
import { cosineDistance, embedBase64 } from '../faceClient.js';
import { asyncHandler } from '../lib/errorHandler.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../lib/errors.js';
import { IMAGES_DIR, sanitizeName, stripDataUrlPrefix } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';

const router = Router();

/** Face match threshold (cosine distance). Lower = stricter. */
const FACE_MATCH_THRESHOLD = 0.4;

/**
 * POST /auth/signup
 * Register a new user with face embedding
 * Body: { email: string, name: string, faceImage: string (base64) }
 */
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const parseResult = SignupBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      throw new ValidationError(firstError?.message || 'Invalid request body');
    }
    const { email, name, faceImage } = parseResult.data;

    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Get face embedding from face service
    let embedding: number[];
    try {
      const b64 = stripDataUrlPrefix(faceImage);
      const result = await embedBase64(b64);
      embedding = result.vector;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      throw new ValidationError(`Failed to extract face: ${msg}`);
    }

    // Save profile image to disk
    const safeName = sanitizeName(name);
    const profileFileName = `profile-${safeName}-${Date.now()}.jpg`;
    const profilePath = path.join(IMAGES_DIR, profileFileName);
    const imageBuffer = Buffer.from(stripDataUrlPrefix(faceImage), 'base64');
    fs.writeFileSync(profilePath, imageBuffer);

    // Insert user into database
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        faceEmbedding: embedding,
        profileImagePath: profileFileName,
        faceRegisteredAt: new Date(),
      })
      .returning();

    logger.info({ userId: newUser.id, email }, 'User signed up');

    return res.status(201).json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profileImagePath: newUser.profileImagePath,
      },
    });
  }),
);

/**
 * POST /auth/login
 * Login by face matching
 * Body: { faceImage: string (base64) }
 * Returns the matched user if face matches within threshold
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parseResult = LoginBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      throw new ValidationError(firstError?.message || 'Invalid request body');
    }
    const { faceImage } = parseResult.data;

    // Get face embedding from the login image
    let loginEmbedding: number[];
    try {
      const b64 = stripDataUrlPrefix(faceImage);
      const result = await embedBase64(b64);
      loginEmbedding = result.vector;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      throw new ValidationError(`Failed to extract face: ${msg}`);
    }

    // Fetch all users with face embeddings
    const allUsers = await db.select().from(users);
    const usersWithFace = allUsers.filter((u) => u.faceEmbedding && Array.isArray(u.faceEmbedding));

    if (usersWithFace.length === 0) {
      throw new UnauthorizedError('No registered users with face data');
    }

    // Find best match and top 8 matches
    let bestMatch: (typeof usersWithFace)[0] | null = null;
    let bestDistance = Infinity;

    // Calculate distances for all users
    const userDistances = usersWithFace.map((user) => ({
      user,
      distance: cosineDistance(loginEmbedding, user.faceEmbedding as number[]),
    }));

    // Sort by distance (ascending) and get top 8
    userDistances.sort((a, b) => a.distance - b.distance);
    const topMatches = userDistances.slice(0, 8);

    // Best match is the first one
    if (topMatches.length > 0) {
      bestMatch = topMatches[0].user;
      bestDistance = topMatches[0].distance;
    }

    if (!bestMatch || bestDistance > FACE_MATCH_THRESHOLD) {
      logger.warn({ bestDistance, threshold: FACE_MATCH_THRESHOLD }, 'Face not recognized');
      return res.status(401).json({
        error: 'Face not recognized',
        distance: bestDistance,
        threshold: FACE_MATCH_THRESHOLD,
        topMatches: topMatches.map(({ user, distance }) => ({
          email: user.email,
          name: user.name,
          distance,
          profileImagePath: user.profileImagePath,
        })),
      });
    }

    logger.info(
      { userId: bestMatch.id, email: bestMatch.email, distance: bestDistance },
      'User logged in',
    );

    return res.json({
      ok: true,
      user: {
        id: bestMatch.id,
        email: bestMatch.email,
        name: bestMatch.name,
        profileImagePath: bestMatch.profileImagePath,
      },
      match: {
        distance: bestDistance,
        threshold: FACE_MATCH_THRESHOLD,
      },
      topMatches: topMatches.map(({ user, distance }) => ({
        email: user.email,
        name: user.name,
        distance,
        profileImagePath: user.profileImagePath,
      })),
    });
  }),
);

/**
 * GET /auth/users
 * List all registered users (for demo/debug purposes)
 */
router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const allUsers = await db.select().from(users);
    return res.json({
      ok: true,
      users: allUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        profileImagePath: u.profileImagePath,
        hasFace: Boolean(u.faceEmbedding),
        faceRegisteredAt: u.faceRegisteredAt,
      })),
    });
  }),
);

export default router;
