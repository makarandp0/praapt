import fs from 'fs';
import path from 'path';

import express, { json } from 'express';

import { db } from './db.js';

const app = express();
// Allow larger JSON payloads for base64 images in prototypes
app.use(json({ limit: '10mb' }));

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

// Prototype endpoint: accept a base64-encoded image captured from the browser
// Body: { image: string (data URL or base64), tag?: string }
app.post('/face/capture', async (req, res) => {
  try {
    const { image, tag } = req.body ?? {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'image (base64 or data URL) required' });
    }

    // Support both raw base64 and data URLs like "data:image/jpeg;base64,...."
    const base64 = image.startsWith('data:') ? image.split(',')[1] : image;
    if (!base64) {
      return res.status(400).json({ error: 'invalid image payload' });
    }

    const buffer = Buffer.from(base64, 'base64');

    // Save to a temp folder for debugging/inspection
    const uploadsDir = path.join(process.cwd(), '.tmp', 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `capture-${ts}${tag ? `-${String(tag)}` : ''}.jpg`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return res.status(201).json({
      ok: true,
      bytes: buffer.length,
      saved: path.relative(process.cwd(), filePath),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('capture error', err);
    return res.status(500).json({ error: 'failed to process image' });
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
