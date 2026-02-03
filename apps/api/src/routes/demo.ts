import { Contracts } from '@praapt/shared';
import { Router } from 'express';

import { db, faceRegistrations } from '../db.js';
import { cosineDistance, embedBase64 } from '../faceClient.js';
import { ValidationError } from '../lib/errors.js';
import { stripDataUrlPrefix } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';

const router = Router();
const routes = createRouteBuilder(router);

/** Face match threshold (cosine distance). Lower = stricter. */
const FACE_MATCH_THRESHOLD = 0.4;

/**
 * POST /demo/face-match
 * Demo endpoint: Find the best matching face registration for an input image.
 * This is NOT authentication - just a demo of face matching capabilities.
 * Auth: developer, admin, volunteer, vendor (auto-applied from contract)
 */
routes.fromContract(
  Contracts.faceMatch,
  async (req) => {
    const { faceImage } = req.body;

    // Get face embedding from the input image
    let inputEmbedding: number[];
    try {
      const b64 = stripDataUrlPrefix(faceImage);
      const result = await embedBase64(b64);
      inputEmbedding = result.vector;
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
      distance: cosineDistance(inputEmbedding, reg.faceEmbedding),
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
      'Face match found',
    );

    return {
      ok: true as const,
      matchedRegistration: {
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
  { errorStatus: 400 },
);

export default router;
