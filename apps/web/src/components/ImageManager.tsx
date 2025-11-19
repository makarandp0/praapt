import { useEffect, useMemo, useRef, useState } from 'react';

import { compareImages, listImages, saveImage, type ApiConfig } from '../lib/api';

import { Button } from './ui/button';

type Props = { apiBase: string };

export function ImageManager({ apiBase }: Props) {
  const api: ApiConfig = { base: apiBase };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [status, setStatus] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  // Holds the current unsaved capture/upload preview (data URL)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canSave = useMemo(() => name.trim().length > 0 && Boolean(previewUrl), [name, previewUrl]);
  const canCompare = useMemo(() => a && b && a !== b, [a, b]);
  // Library list is no longer shown; selections use dropdowns fed by `images`.

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.srcObject = s;
        await videoEl.play();
      }
      streamRef.current = s;
      setCameraOpen(true);
      setStatus('Camera opened');
    } catch {
      setStatus('Camera access denied or unavailable');
    }
  };

  const closeCamera = () => {
    const videoEl = videoRef.current;
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
      videoEl.pause();
    }
    setCameraOpen(false);
    setStatus('Camera closed');
  };

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
    setPreviewUrl(dataUrl);
    setStatus('Preview ready. Enter a name and click Save.');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = async () => {
      const dataUrl = String(fr.result);
      setPreviewUrl(dataUrl);
      setStatus('Preview ready from file. Enter a name and click Save.');
    };
    fr.readAsDataURL(file);
  };

  const savePreview = async () => {
    const n = name.trim();
    if (!n || !previewUrl) return;
    setStatus('Saving image...');
    try {
      await saveImage(api, n, previewUrl);
      setStatus('Saved');
      setName('');
      setPreviewUrl(null);
      await refresh();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save');
    }
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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Image Manager</h2>
          <p className="text-sm text-muted-foreground">
            Capture or upload, organize, and compare images.
          </p>
        </div>
        <div className="text-xs">
          <span
            className={
              'inline-flex items-center rounded-full px-2 py-1 border ' +
              (cameraOpen ? 'border-green-500 text-green-600' : 'border-slate-300 text-slate-500')
            }
          >
            Camera: {cameraOpen ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Capture/Upload */}
        <section className="space-y-3">
          <div className="relative">
            <video ref={videoRef} className="w-full rounded border bg-black/5" playsInline muted />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button variant="outline" onClick={openCamera} disabled={cameraOpen}>
                Open Camera
              </Button>
              <Button variant="outline" onClick={closeCamera} disabled={!cameraOpen}>
                Close Camera
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={capture} disabled={!cameraOpen}>
              Capture
            </Button>
            <label className="text-sm">or</label>
            <input type="file" accept="image/*" onChange={onFile} aria-label="Upload image" />
          </div>

          {previewUrl && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Preview (unsaved)</p>
                <img src={previewUrl} alt="preview" className="w-full rounded border" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Image name"
                  className="border rounded px-3 py-2 text-sm flex-1 min-w-[160px]"
                  aria-label="Image name"
                />
                <Button variant="secondary" onClick={savePreview} disabled={!canSave}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setPreviewUrl(null)}>
                  Discard
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Right: Library & Compare */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">Library</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Count: {images.length}</span>
              <Button variant="secondary" onClick={refresh}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Compare</h3>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm" htmlFor="select-a">
                A
              </label>
              <select
                id="select-a"
                className="border rounded px-2 py-2 text-sm min-w-[160px]"
                value={a}
                onChange={(e) => setA(e.target.value)}
              >
                <option value="">Select</option>
                {images.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label className="text-sm" htmlFor="select-b">
                B
              </label>
              <select
                id="select-b"
                className="border rounded px-2 py-2 text-sm min-w-[160px]"
                value={b}
                onChange={(e) => setB(e.target.value)}
              >
                <option value="">Select</option>
                {images.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <Button variant="secondary" onClick={doCompare} disabled={!canCompare}>
                Compare
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className="text-sm">
        <div className="rounded border px-3 py-2 text-muted-foreground bg-background">
          {status || 'Ready'}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
