import { useEffect, useMemo, useRef, useState } from 'react';

import { compareImages, listImages, saveImage, type ApiConfig } from '../lib/api';

import { Button } from './ui/button';

type Props = { apiBase: string };

export function ImageManager({ apiBase }: Props) {
  const api: ApiConfig = { base: apiBase };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [status, setStatus] = useState('');

  const canSave = useMemo(() => name.trim().length > 0, [name]);
  const canCompare = useMemo(() => a && b && a !== b, [a, b]);

  useEffect(() => {
    let active = true;
    const videoEl = videoRef.current;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) return;
        if (videoEl) {
          videoEl.srcObject = s;
          await videoEl.play();
        }
      } catch {
        // camera optional
      }
    })();
    return () => {
      active = false;
      const stream = (videoEl?.srcObject as MediaStream | null) || null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const refresh = async () => {
    try {
      const { images } = await listImages(api);
      setImages(images);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to load images');
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = async () => {
    const n = name.trim();
    if (!n) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setStatus('Saving capture...');
    try {
      await saveImage(api, n, dataUrl);
      setStatus('Saved');
      setName('');
      await refresh();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = name.trim();
    const file = e.target.files?.[0];
    if (!n || !file) return;
    const fr = new FileReader();
    fr.onload = async () => {
      const dataUrl = String(fr.result);
      setStatus('Uploading image...');
      try {
        await saveImage(api, n, dataUrl);
        setStatus('Saved');
        setName('');
        await refresh();
      } catch (err: unknown) {
        setStatus(err instanceof Error ? err.message : 'Failed to save');
      }
    };
    fr.readAsDataURL(file);
  };

  const doCompare = async () => {
    setStatus('Comparing...');
    try {
      const res = await compareImages(api, a, b);
      setStatus(`algo=${res.algo}, same=${res.same ? 'YES' : 'NO'}`);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to compare');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Image Manager (Prototype)</h2>
      <p className="text-sm text-muted-foreground">
        Capture or upload a named image, list images, and compare two by name.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <h3 className="font-medium">Capture / Upload</h3>
          <video ref={videoRef} className="w-full rounded border" playsInline muted />
          <div className="flex gap-2 items-center">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="image name"
              className="border rounded px-2 py-1 text-sm"
            />
            <Button onClick={capture} disabled={!canSave}>
              Capture & Save
            </Button>
            <input type="file" accept="image/*" onChange={onFile} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Images</h3>
          <div className="flex gap-2 items-center">
            <Button variant="secondary" onClick={refresh}>
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.map((n) => (
              <div
                key={n}
                className="border rounded px-2 py-1 text-sm flex items-center justify-between"
              >
                <span className="truncate" title={n}>
                  {n}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setA(n)}>
                    A
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setB(n)}>
                    B
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">A:</span>
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm">B:</span>
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <Button variant="secondary" onClick={doCompare} disabled={!canCompare}>
              Compare
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{status}</p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
