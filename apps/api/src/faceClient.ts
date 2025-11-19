import fs from 'node:fs';

const FACE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:8000';

async function fileToBase64(p: string): Promise<string> {
  const buf = await fs.promises.readFile(p);
  return buf.toString('base64');
}

export async function compareFiles(aPath: string, bPath: string, threshold = 0.4) {
  const [a, b] = await Promise.all([fileToBase64(aPath), fileToBase64(bPath)]);
  const res = await fetch(`${FACE_URL}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a_b64: a, b_b64: b, threshold }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.detail || json?.error || 'face service error';
    throw new Error(String(msg));
  }
  return json as { ok: true; distance: number; threshold: number; match: boolean };
}
