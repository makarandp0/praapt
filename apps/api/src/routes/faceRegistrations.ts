import fs from 'fs';
import path from 'path';

import { Contracts } from '@praapt/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db, faceRegistrations } from '../db.js';
import { embedBase64 } from '../faceClient.js';
import { ConflictError, ValidationError } from '../lib/errors.js';
import { IMAGES_DIR, parseImageToBuffer, sanitizeName, stripDataUrlPrefix } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';

const router = Router();
const routes = createRouteBuilder(router);

/**
 * POST /face-registrations
 * Register a new face with face embedding
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

  // Save profile image to disk with correct extension based on mime type
  const { buffer: imageBuffer, ext } = parseImageToBuffer(faceImage);
  const safeName = sanitizeName(name);
  const profileFileName = `profile-${safeName}-${Date.now()}.${ext}`;
  const profilePath = path.join(IMAGES_DIR, profileFileName);
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
 * GET /face-registrations
 * List all face registrations (without sensitive data like face embeddings)
 */
routes.fromContract(Contracts.listFaceRegistrations, async () => {
  const allRegistrations = await db.select().from(faceRegistrations);

  // Return registrations without face embeddings (they're large and sensitive)
  const sanitizedRegistrations = allRegistrations.map((reg) => ({
    id: reg.id,
    email: reg.email,
    name: reg.name,
    profileImagePath: reg.profileImagePath,
    faceRegisteredAt: reg.faceRegisteredAt?.toISOString() ?? null,
    createdAt: reg.createdAt?.toISOString() ?? null,
    updatedAt: reg.updatedAt?.toISOString() ?? null,
  }));

  return {
    ok: true as const,
    registrations: sanitizedRegistrations,
    count: sanitizedRegistrations.length,
  };
});

export default router;
