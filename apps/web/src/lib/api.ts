export type ApiConfig = {
  base: string;
};

export async function saveImage(api: ApiConfig, name: string, dataUrl: string) {
  const res = await fetch(`${api.base}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image: dataUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to save image');
  return json as { ok: true; name: string; file: string };
}

export async function listImages(api: ApiConfig) {
  const res = await fetch(`${api.base}/images`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to list images');
  return json as { ok: true; images: string[]; files: string[] };
}

export async function compareImages(api: ApiConfig, a: string, b: string) {
  const res = await fetch(`${api.base}/images/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a, b }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to compare images');
  return json as { ok: true; same: boolean; algo: string; a: string; b: string };
}
