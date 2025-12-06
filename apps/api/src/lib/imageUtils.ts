import fs from 'fs';
import path from 'path';

// Configure images directory (env IMAGES_DIR or default to ./images under CWD)
export const IMAGES_DIR = process.env.IMAGES_DIR
  ? path.resolve(process.env.IMAGES_DIR)
  : path.join(process.cwd(), 'images');

// Ensure directory exists
fs.mkdirSync(IMAGES_DIR, { recursive: true });

/**
 * Sanitize a name for use as a filename
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Parse a base64 or data URL image into a Buffer with file extension
 */
export function parseImageToBuffer(image: string): { buffer: Buffer; ext: string } {
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

/**
 * List all image files in the images directory
 */
export function listImageFiles(): string[] {
  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(jpg|jpeg|png|webp)$/i.test(n))
    .sort();
  return files;
}

/**
 * Generate a filename from a name and extension
 */
export function fileNameFor(name: string, ext: string): string {
  return `${sanitizeName(name)}.${ext}`;
}

/**
 * Strip data URL prefix from base64 string if present
 */
export function stripDataUrlPrefix(data: string): string {
  return data.startsWith('data:') ? data.split(',')[1] : data;
}
