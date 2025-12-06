import fs from 'fs';
import path from 'path';

import {
  CompareImagesBodySchema,
  ListImagesResponseSchema,
  SaveImageBodySchema,
  SaveImageResponseSchema,
} from '@praapt/shared';
import { Router } from 'express';

import { compareFiles } from '../faceClient.js';
import {
  fileNameFor,
  IMAGES_DIR,
  listImageFiles,
  parseImageToBuffer,
  sanitizeName,
} from '../lib/imageUtils.js';

const router = Router();

/**
 * POST /images
 * Save a new image with a name
 * Body: { name: string, image: string (base64) }
 */
router.post('/', async (req, res) => {
  try {
    const { name, image } = SaveImageBodySchema.parse(req.body ?? {});
    const { buffer, ext } = parseImageToBuffer(image);
    const fileName = fileNameFor(name, ext);
    const dest = path.join(IMAGES_DIR, fileName);
    fs.writeFileSync(dest, buffer);

    const payload = { ok: true as const, name: sanitizeName(name), file: fileName };
    SaveImageResponseSchema.parse(payload);
    return res.status(201).json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('save image error', err);
    return res.status(500).json({ error: 'failed to save image' });
  }
});

/**
 * GET /images
 * List all saved images
 */
router.get('/', (_req, res) => {
  const files = listImageFiles();
  const names = files.map((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
  const payload = { ok: true as const, images: names, files };
  ListImagesResponseSchema.parse(payload);
  res.json(payload);
});

/**
 * GET /images/file/:filename
 * Serve an image by exact filename (used for profile images)
 */
router.get('/file/:filename', (req, res) => {
  // Security: extract just the filename and reject any path containing directory separators
  const filename = path.basename(req.params.filename);
  if (filename !== req.params.filename || filename.includes('..')) {
    return res.status(403).json({ error: 'invalid filename' });
  }
  const filePath = path.join(IMAGES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `file not found: ${filename}` });
  }

  return res.sendFile(filePath);
});

/**
 * GET /images/:name
 * Serve an image by name
 */
router.get('/:name', (req, res) => {
  const { name } = req.params;
  const files = listImageFiles();
  const base = sanitizeName(String(name));
  const file = files.find((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, '') === base);

  if (!file) {
    return res.status(404).json({ error: `image not found: ${name}` });
  }

  const filePath = path.join(IMAGES_DIR, file);
  return res.sendFile(filePath);
});

/**
 * POST /images/compare
 * Compare two images using face recognition
 * Body: { a: string, b: string }
 */
router.post('/compare', async (req, res) => {
  try {
    const { a, b } = CompareImagesBodySchema.parse(req.body ?? {});
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

    if (!A) return res.status(404).json({ error: `image not found: ${a}` });
    if (!B) return res.status(404).json({ error: `image not found: ${b}` });

    const result = await compareFiles(A, B);
    const { distance, threshold, match, meta } = result;

    return res.json({
      ok: true,
      same: Boolean(match),
      algo: 'face-arcface' as const,
      a,
      b,
      distance,
      threshold,
      timing_ms: meta?.timing_ms,
      model: meta?.model,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('compare error', err);
    return res.status(500).json({ error: 'failed to compare images' });
  }
});

export default router;
