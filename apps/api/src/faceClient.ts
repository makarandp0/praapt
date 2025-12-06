import fs from 'node:fs';

const FACE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:8000';

async function fileToBase64(p: string): Promise<string> {
  const buf = await fs.promises.readFile(p);
  return buf.toString('base64');
}

export interface CompareFilesResult {
  ok: true;
  distance: number;
  threshold: number;
  match: boolean;
  meta?: {
    timing_ms?: number;
    model?: string;
  };
}

export async function compareFiles(
  aPath: string,
  bPath: string,
  threshold = 0.5,
): Promise<CompareFilesResult> {
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
  return json as CompareFilesResult;
}

export async function loadModel(model: 'buffalo_l' | 'buffalo_s'): Promise<void> {
  const res = await fetch(`${FACE_URL}/load-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.detail || json?.error || 'failed to load model';
    throw new Error(String(msg));
  }
}

/** Result from embedding a face image */
export interface EmbedResult {
  ok: true;
  vector: number[];
  meta: {
    faces: number;
    bbox: number[];
    det_score: number;
    cached: boolean;
  };
}

/**
 * Get face embedding from an image file
 * @param imagePath - Path to the image file
 * @returns 512-dimensional face embedding vector
 */
export async function embedFile(imagePath: string): Promise<EmbedResult> {
  const b64 = await fileToBase64(imagePath);
  return embedBase64(b64);
}

/**
 * Get face embedding from a base64-encoded image
 * @param imageBase64 - Base64-encoded image data
 * @returns 512-dimensional face embedding vector
 */
export async function embedBase64(imageBase64: string): Promise<EmbedResult> {
  const res = await fetch(`${FACE_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_b64: imageBase64 }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.detail || json?.error || 'failed to get embedding';
    throw new Error(String(msg));
  }
  return json as EmbedResult;
}

/**
 * Calculate cosine distance between two embedding vectors
 * Returns 0 for identical vectors, 2 for opposite vectors
 */
export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    // If either vector is all zeros, return maximum distance
    return 2.0;
  }
  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return 1 - similarity; // cosine distance
}
