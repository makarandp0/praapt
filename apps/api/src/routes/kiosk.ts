import { Contracts } from '@praapt/shared';
import { eq, inArray } from 'drizzle-orm';
import { Router } from 'express';

import { db, customerFaces, customers } from '../db.js';
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
 * POST /kiosk/pin-lookup
 * Confirm the PIN is registered and has faces.
 * Auth: public (kiosk)
 */
routes.fromContract(Contracts.kioskPinLookup, async (req) => {
  const { pin } = req.body;

  const candidateCustomers = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.pin, pin));

  if (candidateCustomers.length === 0) {
    return {
      ok: false as const,
      error: 'PIN not recognized',
    };
  }

  const customerIds = candidateCustomers.map((customer) => customer.id);
  const faces = await db
    .select({ customerId: customerFaces.customerId })
    .from(customerFaces)
    .where(inArray(customerFaces.customerId, customerIds));

  if (faces.length === 0) {
    return {
      ok: false as const,
      error: 'PIN not recognized',
    };
  }

  return {
    ok: true as const,
    eligible: true as const,
  };
});

/**
 * POST /kiosk/face-match
 * Match a face against customers sharing the provided PIN.
 * Auth: public (kiosk)
 */
routes.fromContract(Contracts.kioskFaceMatch, async (req) => {
  const { pin, faceImage } = req.body;

  let inputEmbedding: number[];
  try {
    const b64 = stripDataUrlPrefix(faceImage);
    const result = await embedBase64(b64);
    inputEmbedding = result.vector;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    throw new ValidationError(`Error: Failed to extract face - ${msg}`);
  }

  const candidateCustomers = await db.select().from(customers).where(eq(customers.pin, pin));

  if (candidateCustomers.length === 0) {
    return {
      ok: false as const,
      error: 'No customers found for pin',
      reason: 'no_customers' as const,
    };
  }

  const customerIds = candidateCustomers.map((customer) => customer.id);

  const faces = await db
    .select()
    .from(customerFaces)
    .where(inArray(customerFaces.customerId, customerIds));

  if (faces.length === 0) {
    return {
      ok: false as const,
      error: 'No faces found for pin',
      reason: 'no_faces' as const,
    };
  }

  const bestFaceByCustomer = new Map<
    string,
    { distance: number; imagePath: string | null }
  >();

  for (const face of faces) {
    const distance = cosineDistance(inputEmbedding, face.faceEmbedding);
    const existing = bestFaceByCustomer.get(face.customerId);
    if (!existing || distance < existing.distance) {
      bestFaceByCustomer.set(face.customerId, {
        distance,
        imagePath: face.imagePath ?? null,
      });
    }
  }

  const customerById = new Map(candidateCustomers.map((customer) => [customer.id, customer]));

  const candidates = Array.from(bestFaceByCustomer.entries())
    .map(([customerId, bestFace]) => {
      const customer = customerById.get(customerId);
      if (!customer) return null;
      return {
        customerId,
        name: customer.name,
        imagePath: bestFace.imagePath,
        distance: bestFace.distance,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.distance - b.distance);

  const matches = candidates.filter((candidate) => candidate.distance <= FACE_MATCH_THRESHOLD);

  if (matches.length === 0) {
    logger.warn({ pin, threshold: FACE_MATCH_THRESHOLD }, 'No kiosk face match found');
    return {
      ok: false as const,
      error: 'No matches found',
      reason: 'no_match' as const,
      threshold: FACE_MATCH_THRESHOLD,
      candidates,
    };
  }

  logger.info(
    { pin, customerIds: matches.map((match) => match.customerId) },
    'Kiosk face matches found',
  );

  return {
    ok: true as const,
    threshold: FACE_MATCH_THRESHOLD,
    matches,
  };
});

export default router;
