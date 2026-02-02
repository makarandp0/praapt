import fs from 'fs';
import path from 'path';

import { Contracts } from '@praapt/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db, faceRegistrations } from '../db.js';
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
 * Register a new face registration with face embedding
 */
routes.fromContract(Contracts.signup, async (req, res) => {
  const { email, name, faceImage } = req.body;

  // Check if email already exists
  const existing = await db
    .select()
    .from(faceRegistrations)
    .where(eq(faceRegistrations.email, email))
    .limit(1);
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

  // Insert face registration into database
  const [newRegistration] = await db
    .insert(faceRegistrations)
    .values({
      email,
      name,
      faceEmbedding: embedding,
      profileImagePath: profileFileName,
      faceRegisteredAt: new Date(),
    })
    .returning();

  logger.info({ registrationId: newRegistration.id, email }, 'Face registration created');

  // Set 201 status for created resource
  res.status(201);

  return {
    ok: true as const,
    user: {
      id: newRegistration.id,
      email: newRegistration.email,
      name: newRegistration.name,
      profileImagePath: newRegistration.profileImagePath,
    },
  };
});

/**
 * POST /auth/facelogin
 * Login by face matching
 */
routes.fromContract(
  Contracts.faceLogin,
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

    // Fetch all face registrations with embeddings
    const allRegistrations = await db.select().from(faceRegistrations);

    // Type guard to ensure faceEmbedding is number[]
    function hasFaceEmbedding(
      reg: (typeof allRegistrations)[0],
    ): reg is (typeof allRegistrations)[0] & { faceEmbedding: number[] } {
      return reg.faceEmbedding !== null && Array.isArray(reg.faceEmbedding);
    }

    const registrationsWithFace = allRegistrations.filter(hasFaceEmbedding);

    if (registrationsWithFace.length === 0) {
      return {
        ok: false as const,
        error: 'Error: No registered faces found',
      };
    }

    // Find best match and top 8 matches
    let bestMatch: (typeof registrationsWithFace)[0] | null = null;
    let bestDistance = Infinity;

    // Calculate distances for all registrations
    const regDistances = registrationsWithFace.map((reg) => ({
      reg,
      distance: cosineDistance(loginEmbedding, reg.faceEmbedding),
    }));

    // Sort by distance (ascending) and get top 8
    regDistances.sort((a, b) => a.distance - b.distance);
    const topMatches = regDistances.slice(0, 8);

    // Best match is the first one
    if (topMatches.length > 0) {
      bestMatch = topMatches[0].reg;
      bestDistance = topMatches[0].distance;
    }

    const topMatchesFormatted = topMatches.map(({ reg, distance }) => ({
      email: reg.email,
      name: reg.name,
      distance,
      profileImagePath: reg.profileImagePath,
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
      { registrationId: bestMatch.id, email: bestMatch.email, distance: bestDistance },
      'Face login successful',
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
