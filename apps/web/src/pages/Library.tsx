import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../components/ui/button';
import { createApiClient } from '../lib/apiClient';

type Props = { apiBase: string };

const MAX_IMAGES = 8;

export function Library({ apiBase }: Props) {
  const api = useMemo(() => {
    return createApiClient(apiBase);
  }, [apiBase]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageSlots, setImageSlots] = useState<Record<number, string>>({});
  const [slotTimestamps, setSlotTimestamps] = useState<Record<number, string | number>>({});
  const [status, setStatus] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [addingToSlot, setAddingToSlot] = useState<number | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<{
    same: boolean;
    algo: string;
    distance?: number;
    threshold?: number;
    timing_ms?: number;
    model?: string;
  } | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const slots = Array.from({ length: MAX_IMAGES }, (_, i) => imageSlots[i] || null);

  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const refresh = async () => {
    try {
      const { images: imgs } = await api.listImages();
      // Parse image names to slot numbers (format: slot-01, slot-02, etc.)
      const slotMap: Record<number, string> = {};
      imgs.forEach((img: string) => {
        const match = img.match(/^slot-(\d+)$/);
        if (match) {
          const slotNum = parseInt(match[1], 10) - 1; // Convert to 0-indexed
          if (slotNum >= 0 && slotNum < MAX_IMAGES) {
            slotMap[slotNum] = img;
          }
        }
      });
      setImageSlots(slotMap);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to load images');
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCamera = async (slot: number) => {
    setAddingToSlot(slot);
    setCameraOpen(true);
    setStatus('Opening camera...');

    // Wait a tick for the video element to render
    setTimeout(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = s;
          await videoEl.play();
          streamRef.current = s;
          setStatus('Camera ready - Click capture');
        }
      } catch {
        setStatus('Camera access denied or unavailable');
        setCameraOpen(false);
        setAddingToSlot(null);
      }
    }, 100);
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
    setAddingToSlot(null);
    setStatus('');
  };

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || addingToSlot === null) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Save immediately (backend will overwrite if file exists)
    setStatus('Saving image...');
    try {
      const slotName = `slot-${String(addingToSlot + 1).padStart(2, '0')}`;
      await api.saveImage({ name: slotName, image: dataUrl });
      await refresh();
      setSlotTimestamps((prev) => ({ ...prev, [addingToSlot]: `${Date.now()}-${Math.random()}` }));
      closeCamera();
      setStatus('');
    } catch (err: unknown) {
      console.error('Save error:', err);
      setStatus(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleFileSelect = (slot: number) => {
    setAddingToSlot(slot);
    fileInputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || addingToSlot === null) return;

    const slotToUpdate = addingToSlot; // Capture the slot number before async operations
    setStatus('Uploading image...');

    // Convert to JPEG to match camera format
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Save immediately (backend will overwrite if file exists)
      try {
        const slotName = `slot-${String(slotToUpdate + 1).padStart(2, '0')}`;
        await api.saveImage({ name: slotName, image: dataUrl });
        await refresh();
        const newTimestamp = `${Date.now()}-${Math.random()}`;
        setSlotTimestamps((prev) => {
          console.log(
            'Updating timestamp for slot',
            slotToUpdate,
            'from',
            prev[slotToUpdate],
            'to',
            newTimestamp,
          );
          return { ...prev, [slotToUpdate]: newTimestamp };
        });
        setAddingToSlot(null);
        setStatus('');
      } catch (err: unknown) {
        console.error('Upload error:', err);
        setStatus(err instanceof Error ? err.message : 'Failed to save');
      }
    };

    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = String(ev.target?.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleSelection = (slotIndex: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(slotIndex)) {
        return prev.filter((i) => i !== slotIndex);
      }
      if (prev.length >= 2) {
        return [prev[1], slotIndex];
      }
      return [...prev, slotIndex];
    });
    setCompareResult(null);
    setCompareError(null);
  };

  const doCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    const img1 = imageSlots[selectedForCompare[0]];
    const img2 = imageSlots[selectedForCompare[1]];
    if (!img1 || !img2) return;

    setComparing(true);
    setCompareResult(null);
    setCompareError(null);
    try {
      const res = await api.compareImages({ a: img1, b: img2 });
      setCompareResult({
        same: res.same,
        algo: res.algo,
        distance: res.distance,
        threshold: res.threshold,
        timing_ms: res.timing_ms,
        model: res.model,
      });
    } catch (err: unknown) {
      setCompareError(err instanceof Error ? err.message : 'Failed to compare');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Image Library</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Stock images are provided by default. Replace them with your own photos using the camera
            or upload custom images from your device.
          </p>
          <p className="text-sm text-muted-foreground">
            {Object.keys(imageSlots).length}/{MAX_IMAGES} slots filled • Select 2 images to compare
          </p>
        </div>
        {selectedForCompare.length === 2 && (
          <Button
            onClick={doCompare}
            disabled={comparing}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {comparing ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Comparing...
              </span>
            ) : (
              'Compare Selected Images'
            )}
          </Button>
        )}
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Capture Image for Slot {(addingToSlot ?? 0) + 1}
              </h3>
              <Button variant="ghost" onClick={closeCamera}>
                ✕
              </Button>
            </div>

            <video
              ref={videoRef}
              className="w-full h-[400px] rounded border bg-black object-cover"
              playsInline
              muted
              autoPlay
            />
            <Button onClick={capture} className="w-full" size="lg">
              Capture and Save
            </Button>

            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {slots.map((img, index) => (
          <div
            key={`slot-${index}-${slotTimestamps[index] || 0}`}
            className="w-full space-y-2 p-2 border rounded-lg bg-white"
          >
            {img ? (
              <>
                <div
                  className={`w-full border-2 rounded overflow-hidden transition-all cursor-pointer ${
                    selectedForCompare.includes(index)
                      ? 'ring-4 ring-blue-500'
                      : 'hover:border-gray-400'
                  }`}
                  style={{ aspectRatio: '1/1', maxHeight: '200px' }}
                  onClick={() => toggleSelection(index)}
                >
                  <div className="w-full h-full relative">
                    <img
                      key={`${img}-${slotTimestamps[index] || 0}`}
                      src={`${apiBase}/images/${img}?t=${slotTimestamps[index] || 0}`}
                      alt={img}
                      className="w-full h-full object-cover"
                    />
                    {selectedForCompare.includes(index) && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                        {selectedForCompare.indexOf(index) + 1}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                      Slot {index + 1}
                    </div>
                  </div>
                </div>
                {/* Replace buttons - below image */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCamera(index);
                    }}
                    className="text-xs flex-1"
                    title="Replace with camera"
                  >
                    📷 Camera
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileSelect(index);
                    }}
                    className="text-xs flex-1"
                    title="Upload from device"
                  >
                    📁 Upload
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full h-full border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 bg-gray-50">
                <p className="text-xs text-gray-500">Slot {index + 1}</p>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCamera(index)}
                    className="text-xs"
                    title="Take a photo with your camera"
                  >
                    📷 Camera
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFileSelect(index)}
                    className="text-xs"
                    title="Upload an image from your device"
                  >
                    📁 Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Error */}
      {compareError && selectedForCompare.length === 2 && (
        <div className="mt-6 p-4 rounded-lg border-2 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-lg font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Comparison Failed</h3>
              <p className="text-sm text-red-800">{compareError}</p>
              {compareError.includes('No model loaded') && (
                <p className="text-xs text-red-700 mt-2">
                  💡 Tip: Load a face recognition model using the buttons in the status bar above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Result */}
      {compareResult && selectedForCompare.length === 2 && (
        <div className="mt-6 p-4 rounded-lg border-2 bg-gradient-to-br from-background to-muted/20">
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
              Slot {selectedForCompare[0] + 1} vs Slot {selectedForCompare[1] + 1} • Algorithm:{' '}
              {compareResult.algo}
              {compareResult.model && ` • Model: ${compareResult.model}`}
              {compareResult.timing_ms !== undefined &&
                ` • ${compareResult.timing_ms.toFixed(0)}ms`}
            </div>
          </div>
          {compareResult.distance !== undefined && compareResult.threshold !== undefined && (
            <div className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="relative pt-8">
                  <div className="absolute -top-1 left-0">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      Distance: {compareResult.distance.toFixed(4)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        compareResult.same ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (compareResult.distance / 2.0) * 100)}%`,
                      }}
                    />
                  </div>
                  <div
                    className="absolute top-8 bottom-0 w-1 bg-blue-600 shadow-lg"
                    style={{
                      left: `${Math.min(100, (compareResult.threshold / 2.0) * 100)}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs font-semibold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-600">
                        Threshold: {compareResult.threshold.toFixed(4)}
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

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
