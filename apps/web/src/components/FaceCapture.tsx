import { useEffect, useRef, useState } from 'react';

import { Button } from './ui/button';

type Props = {
  apiBase: string;
};

export function FaceCapture({ apiBase }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  // We operate using refs; no need to track stream in state

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
        setStatus('Camera access denied or unavailable');
      }
    })();
    return () => {
      active = false;
      const currentStream = (videoEl?.srcObject as MediaStream | null) || null;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = () => {
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
    const url = canvas.toDataURL('image/jpeg', 0.92);
    setDataUrl(url);
  };

  const send = async () => {
    if (!dataUrl) return;
    setStatus('Uploading...');
    try {
      const res = await fetch(`${apiBase}/face/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Upload failed');
      setStatus(`Uploaded (${json.bytes} bytes)`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setStatus(message);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Face Capture (Prototype)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <video ref={videoRef} className="w-full rounded border" playsInline muted />
          <div className="flex gap-2">
            <Button onClick={capture}>Capture</Button>
            <Button variant="secondary" onClick={send} disabled={!dataUrl}>
              Send to Backend
            </Button>
          </div>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
        <div className="space-y-2">
          <p className="text-sm">Preview</p>
          {dataUrl ? (
            <img src={dataUrl} alt="capture" className="w-full rounded border" />
          ) : (
            <div className="w-full aspect-video rounded border flex items-center justify-center text-sm text-muted-foreground">
              No capture yet
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
