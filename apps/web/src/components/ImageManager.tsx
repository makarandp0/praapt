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
  const [compareResult, setCompareResult] = useState<{
    same: boolean;
    algo: string;
    distance?: number;
    threshold?: number;
  } | null>(null);

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
    setCompareResult(null);
    try {
      const res = await compareImages(api, a, b);
      setCompareResult({
        same: res.same,
        algo: res.algo,
        distance: res.distance,
        threshold: res.threshold,
      });
      setStatus('');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to compare');
      setCompareResult(null);
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
            {status && (
              <div className="text-sm">
                <div className="rounded border px-3 py-2 text-muted-foreground bg-background">
                  {status}
                </div>
              </div>
            )}
            {compareResult && (
              <div className="mt-3 p-4 rounded-lg border-2 bg-gradient-to-br from-background to-muted/20">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                      compareResult.same
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-red-100 text-red-800 border-2 border-red-300'
                    }`}
                  >
                    {compareResult.same ? (
                      <>
                        <span className="text-lg">✓</span>
                        <span>Match</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✗</span>
                        <span>No Match</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Algorithm: {compareResult.algo}
                  </div>
                </div>
                {compareResult.distance !== undefined && compareResult.threshold !== undefined && (
                  <div className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <p>
                          The progress bar shows the <strong>distance</strong> between the two
                          images. Lower distance means more similar faces. The blue line marks the{' '}
                          <strong>threshold</strong> ({compareResult.threshold.toFixed(4)}):
                          distances below it indicate a match, while distances above it indicate no
                          match.
                        </p>
                        <p className="mt-2">
                          <strong>Result:</strong>{' '}
                          {compareResult.same ? (
                            <span className="text-green-700 font-semibold">
                              Distance is below threshold — Images Match
                            </span>
                          ) : (
                            <span className="text-red-700 font-semibold">
                              Distance is above threshold — Images Do Not Match
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="relative pt-8">
                        {/* Background bar representing maximum range (0-2.0 for cosine distance) */}
                        <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                          {/* Distance bar */}
                          <div
                            className={`h-full rounded-full transition-all ${
                              compareResult.same ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (compareResult.distance / 2.0) * 100)}%`,
                            }}
                          />
                          {/* Distance label */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-mono font-semibold text-xs text-white drop-shadow-md">
                              Distance: {compareResult.distance.toFixed(4)}
                            </span>
                          </div>
                        </div>
                        {/* Threshold marker */}
                        <div
                          className="absolute top-8 bottom-0 w-1 bg-blue-600 shadow-lg"
                          style={{
                            left: `${Math.min(100, (compareResult.threshold / 2.0) * 100)}%`,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="text-xs font-semibold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-600">
                              Threshold
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>0.0 (Identical)</span>
                        <span>2.0 (Opposite)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
