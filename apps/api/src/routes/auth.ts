import fs from 'fs';
import path from 'path';

import { Contracts } from '@praapt/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db, users } from '../db.js';
import { cosineDistance, embedBase64 } from '../faceClient.js';
import { ConflictError, ValidationError } from '../lib/errors.js';
import { IMAGES_DIR, sanitizeName, stripDataUrlPrefix } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';

const router = Router();
const routes = createRouteBuilder(router);

/** Face match threshold (cosine distance). Lower = stricter. */
const FACE_MATCH_THRESHOLD = 0.4;

/**
 * POST /auth/signup
 * Register a new user with face embedding
 */
routes.fromContract(Contracts.signup, async (req, res) => {
  const { email, name, faceImage } = req.body;

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
    throw new ValidationError(`Error: Failed to extract face - ${msg}`);
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

  // Set 201 status for created resource
  res.status(201);

  return {
    ok: true as const,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profileImagePath: newUser.profileImagePath,
    },
  };
});

/**
 * POST /auth/login
 * Login by face matching
 */
routes.fromContract(
  Contracts.login,
  async (req) => {
    const { faceImage } = req.body;

    // Get face embedding from the login image
    let loginEmbedding: number[];
    try {
      const b64 = stripDataUrlPrefix(faceImage);
      const result = await embedBase64(b64);
      loginEmbedding = result.vector;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      throw new ValidationError(`Error: Failed to extract face - ${msg}`);
    }

    // Fetch all users with face embeddings
    const allUsers = await db.select().from(users);

    // Type guard to ensure faceEmbedding is number[]
    function hasFaceEmbedding(
      user: (typeof allUsers)[0],
    ): user is (typeof allUsers)[0] & { faceEmbedding: number[] } {
      return user.faceEmbedding !== null && Array.isArray(user.faceEmbedding);
    }

    const usersWithFace = allUsers.filter(hasFaceEmbedding);

    if (usersWithFace.length === 0) {
      return {
        ok: false as const,
        error: 'Error: No registered users with face data',
      };
    }

    // Find best match and top 8 matches
    let bestMatch: (typeof usersWithFace)[0] | null = null;
    let bestDistance = Infinity;

    // Calculate distances for all users
    const userDistances = usersWithFace.map((user) => ({
      user,
      distance: cosineDistance(loginEmbedding, user.faceEmbedding),
    }));

    // Sort by distance (ascending) and get top 8
    userDistances.sort((a, b) => a.distance - b.distance);
    const topMatches = userDistances.slice(0, 8);

    // Best match is the first one
    if (topMatches.length > 0) {
      bestMatch = topMatches[0].user;
      bestDistance = topMatches[0].distance;
    }

    const topMatchesFormatted = topMatches.map(({ user, distance }) => ({
      email: user.email,
      name: user.name,
      distance,
      profileImagePath: user.profileImagePath,
    }));

    if (!bestMatch || bestDistance > FACE_MATCH_THRESHOLD) {
      logger.warn({ bestDistance, threshold: FACE_MATCH_THRESHOLD }, 'Face not recognized');

      return {
        ok: false as const,
        error: 'Error: Face not recognized',
        distance: bestDistance,
        threshold: FACE_MATCH_THRESHOLD,
        topMatches: topMatchesFormatted,
      };
    }

    logger.info(
      { userId: bestMatch.id, email: bestMatch.email, distance: bestDistance },
      'User logged in',
    );

    return {
      ok: true as const,
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
      topMatches: topMatchesFormatted,
    };
  },
  { errorStatus: 401 },
);

export default router;
