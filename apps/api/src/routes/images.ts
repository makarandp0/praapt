import fs from 'fs';
import path from 'path';

import { Contracts } from '@praapt/shared';
import { Router } from 'express';

import { compareFiles } from '../faceClient.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import {
  fileNameFor,
  IMAGES_DIR,
  listImageFiles,
  parseImageToBuffer,
  sanitizeName,
} from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';
import { requireAuth } from '../middleware/auth.js';
import { requireActiveRole } from '../middleware/authorization.js';

const router = Router();
const routes = createRouteBuilder(router);

/**
 * POST /images
 * Save a new image with a name
 * Requires authenticated user with an active role
 */
routes.fromContract(Contracts.saveImage, async (req, res) => {
  const { name, image } = req.body;
  const { buffer, ext } = parseImageToBuffer(image);
  const fileName = fileNameFor(name, ext);
  const dest = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(dest, buffer);

  logger.info({ fileName, name: sanitizeName(name) }, 'Image saved');

  // Set 201 status for created resource
  res.status(201);

  return { ok: true as const, name: sanitizeName(name), file: fileName };
});

/**
 * GET /images
 * List all saved images
 * Requires authenticated user with an active role
 */
routes.fromContract(Contracts.listImages, async () => {
  const files = listImageFiles();
  const names = files.map((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
  return { ok: true as const, images: names, files };
});

/**
 * GET /images/file/:filename
 * Serve an image by exact filename (used for profile images)
 * Public endpoint - profile images are created during public signup
 * Note: Filenames are pseudo-random (include timestamp) providing security through obscurity
 */
router.get('/images/file/:filename', (req, res, next) => {
  try {
    // Security: extract just the filename and reject any path containing directory separators
    const filename = path.basename(req.params.filename);
    if (filename !== req.params.filename || filename.includes('..')) {
      throw new ForbiddenError('Invalid filename');
    }
    const filePath = path.join(IMAGES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError(`File not found: ${filename}`);
    }

    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /images/:name
 * Serve an image by name
 * Requires authenticated user with an active role
 */
router.get('/images/:name', requireAuth, requireActiveRole(), (req, res, next) => {
  try {
    const { name } = req.params;
    const files = listImageFiles();
    const base = sanitizeName(String(name));
    const file = files.find((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, '') === base);

    if (!file) {
      throw new NotFoundError(`Image not found: ${name}`);
    }

    const filePath = path.join(IMAGES_DIR, file);
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /images/compare
 * Compare two images using face recognition
 * Requires authenticated user with an active role
 */
routes.fromContract(Contracts.compareImages, async (req) => {
  const { a, b } = req.body;
  const files = listImageFiles();

  const findFile = (key: string) => {
    const base = sanitizeName(String(key));
    const withExt =
      files.find((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, '') === base) ||
      files.find((f) => f === key);
    return withExt ? path.join(IMAGES_DIR, withExt) : null;
  };

  const A = findFile(a);
  const B = findFile(b);

  if (!A) throw new NotFoundError(`Image not found: ${a}`);
  if (!B) throw new NotFoundError(`Image not found: ${b}`);

  const result = await compareFiles(A, B);
  const { distance, threshold, match, meta } = result;

  logger.debug({ a, b, distance, match }, 'Images compared');

  return {
    ok: true as const,
    same: Boolean(match),
    algo: 'face-arcface' as const,
    a,
    b,
    distance,
    threshold,
    timing_ms: meta?.timing_ms,
    model: meta?.model,
  };
});

export default router;
