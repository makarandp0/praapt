import express, { json } from 'express';

import { db } from './db.js';

const app = express();
app.use(json());

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
  const [user] = await db('users')
    .insert({ email, name })
    .returning('*');
  res.status(201).json(user);
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
