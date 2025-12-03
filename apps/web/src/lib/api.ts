import {
  CompareImagesBodySchema,
  CompareImagesResponseSchema,
  ListImagesResponseSchema,
  SaveImageBodySchema,
  SaveImageResponseSchema,
} from '@praapt/shared';

export type ApiConfig = { base: string };

export async function saveImage(api: ApiConfig, name: string, dataUrl: string) {
  const body = SaveImageBodySchema.parse({ name, image: dataUrl });
  const res = await fetch(`${api.base}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to save image');
  return SaveImageResponseSchema.parse(json);
}

export async function listImages(api: ApiConfig) {
  const res = await fetch(`${api.base}/images`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to list images');
  return ListImagesResponseSchema.parse(json);
}

export async function deleteImage(api: ApiConfig, name: string) {
  const res = await fetch(`${api.base}/images/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.error || 'Failed to delete image');
  }
}

export async function compareImages(api: ApiConfig, a: string, b: string) {
  const body = CompareImagesBodySchema.parse({ a, b });
  const res = await fetch(`${api.base}/images/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to compare images');
  return CompareImagesResponseSchema.parse(json);
}
