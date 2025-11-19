import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import {
  CompareImagesBodySchema,
  ListImagesResponseSchema,
  SaveImageBodySchema,
  SaveImageResponseSchema,
} from '@praapt/shared';
import express, { json } from 'express';

import { db } from './db.js';
import { compareFiles as faceCompareFiles } from './faceClient.js';

const app = express();
// Allow larger JSON payloads for base64 images in prototypes
app.use(json({ limit: '10mb' }));

// Configure images directory (env IMAGES_DIR or default to ./images under CWD)
const IMAGES_DIR = process.env.IMAGES_DIR
  ? path.resolve(process.env.IMAGES_DIR)
  : path.join(process.cwd(), 'images');
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Helpers
function sanitizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');
}

function parseImageToBuffer(image: string): { buffer: Buffer; ext: string } {
  // Supports data URL or raw base64; determine ext from mime if provided
  if (image.startsWith('data:')) {
    const [meta, b64] = image.split(',');
    const m = /data:(.+?);base64/.exec(meta || '');
    const mime = (m?.[1] || 'image/jpeg').toLowerCase();
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    return { buffer: Buffer.from(b64, 'base64'), ext };
  }
  // Default to jpeg extension when not specified
  return { buffer: Buffer.from(image, 'base64'), ext: 'jpg' };
}

function listImageFiles(): string[] {
  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(jpg|jpeg|png|webp)$/i.test(n))
    .sort();
  return files;
}

function fileNameFor(name: string, ext: string): string {
  return `${sanitizeName(name)}.${ext}`;
}

function sha256Of(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  const h = crypto.createHash('sha256');
  h.update(buf);
  return h.digest('hex');
}

// Minimal CORS for dev: allow browser requests from Vite
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // End preflight early
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api' });
});

app.get('/users', async (_req, res) => {
  const users = await db('users').select('*').orderBy('id', 'asc');
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { email, name } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const [user] = await db('users').insert({ email, name }).returning('*');
  res.status(201).json(user);
});

// 1) Capture and name the image. Body: { name: string, image: string }
app.post('/images', async (req, res) => {
  try {
    const { name, image } = SaveImageBodySchema.parse(req.body ?? {});
    const { buffer, ext } = parseImageToBuffer(image);
    const fileName = fileNameFor(name, ext);
    const dest = path.join(IMAGES_DIR, fileName);
    fs.writeFileSync(dest, buffer);
    const payload = { ok: true as const, name: sanitizeName(name), file: fileName };
    // Validate server response shape during dev
    SaveImageResponseSchema.parse(payload);
    return res.status(201).json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('save image error', err);
    return res.status(500).json({ error: 'failed to save image' });
  }
});

// 2) Return names of all images (filename stems)
app.get('/images', (_req, res) => {
  const files = listImageFiles();
  const names = files.map((f) => f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
  const payload = { ok: true as const, images: names, files };
  ListImagesResponseSchema.parse(payload);
  res.json(payload);
});

// 3) Compare two images by names (sha256 equality)
// Body: { a: string, b: string }
app.post('/images/compare', async (req, res) => {
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

    // Try face match via Python microservice
    try {
      const { distance, threshold, match } = await faceCompareFiles(A, B);
      return res.json({
        ok: true,
        same: Boolean(match),
        algo: 'face-arcface' as const,
        a,
        b,
        distance,
        threshold,
      });
    } catch {
      // Fallback to sha256 equality if face service unavailable
      const ha = sha256Of(A);
      const hb = sha256Of(B);
      return res.json({ ok: true, same: ha === hb, algo: 'sha256' as const, a, b });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('compare error', err);
    return res.status(500).json({ error: 'failed to compare images' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await db.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.destroy();
  process.exit(0);
});
