import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { CameraPreview, CameraPreviewRef } from './CameraPreview';
import { FaceDetectionResult } from '../hooks/useFaceDetection';

interface FaceCaptureFrameProps {
  cameraRef: React.RefObject<CameraPreviewRef>;
  stream: MediaStream | null;
  isActive?: boolean;
  frameClassName?: string;
  overlayClassName?: string;
  placeholderClassName?: string;
  showOvalGuide?: boolean;
  enableFaceAlignment?: boolean;
  alignmentConfig?: Partial<FaceAlignmentConfig>;
  overlayShape?: Partial<OverlayShapeConfig>;
  onAlignmentChange?: (state: FaceAlignmentState) => void;
  detectionInterval?: number;
  minConfidence?: number;
  showDebugUi?: boolean;
}

export type FaceAlignmentReason =
  | 'aligned'
  | 'disabled'
  | 'loading'
  | 'no_face'
  | 'multiple_faces'
  | 'fallback'
  | 'no_bbox'
  | 'low_confidence'
  | 'no_video'
  | 'no_overlay'
  | 'too_close'
  | 'too_far'
  | 'off_center';

export interface FaceAlignmentState {
  aligned: boolean;
  reason: FaceAlignmentReason;
}

export interface FaceAlignmentMetrics {
  overlapRatio: number | null;
  faceWidthRatio: number | null;
  faceHeightRatio: number | null;
  faceAreaRatio: number | null;
  faceCount: number;
  confidence: number | null;
  detectionMethod: FaceDetectionResult['detectionMethod'];
}

export interface OverlayShapeConfig {
  widthPct: number;
  heightPct: number;
  offsetXPct?: number;
  offsetYPct?: number;
}

export interface FaceAlignmentConfig {
  overlapThreshold: number;
  overlapSamples: number;
  minFaceWidthRatio: number;
  maxFaceWidthRatio: number;
  minFaceHeightRatio: number;
  maxFaceHeightRatio: number;
  minFaceAreaRatio: number;
  maxFaceAreaRatio: number;
  minConfidence: number;
  requireSingleFace: boolean;
  allowFallback: boolean;
}

const DEFAULT_FRAME_CLASS =
  'relative w-[480px] h-[480px] bg-[#E7E0D6] rounded-2xl overflow-hidden flex items-center justify-center';
const DEFAULT_OVAL_CLASS = 'border-4 border-[#243B6B] border-dashed rounded-full opacity-60';
const DEFAULT_PLACEHOLDER_CLASS =
  'w-[340px] h-[420px] border-4 border-[#243B6B] border-dashed rounded-full opacity-60';
const DEFAULT_OVERLAY_SHAPE: OverlayShapeConfig = {
  widthPct: 70,
  heightPct: 85,
  offsetXPct: 0,
  offsetYPct: -8,
};
const DEFAULT_ALIGNMENT_CONFIG: FaceAlignmentConfig = {
  overlapThreshold: 0.75,
  overlapSamples: 12,
  minFaceWidthRatio: 0.35,
  maxFaceWidthRatio: 1.05,
  minFaceHeightRatio: 0.35,
  maxFaceHeightRatio: 1.1,
  minFaceAreaRatio: 0.4,
  maxFaceAreaRatio: 1.2,
  minConfidence: 0.7,
  requireSingleFace: true,
  allowFallback: true,
};
const DEFAULT_ALIGNMENT_STATE: FaceAlignmentState = { aligned: false, reason: 'loading' };
const DEFAULT_ALIGNMENT_METRICS: FaceAlignmentMetrics = {
  overlapRatio: null,
  faceWidthRatio: null,
  faceHeightRatio: null,
  faceAreaRatio: null,
  faceCount: 0,
  confidence: null,
  detectionMethod: null,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function FaceCaptureFrame({
  cameraRef,
  stream,
  isActive = false,
  frameClassName = DEFAULT_FRAME_CLASS,
  overlayClassName = DEFAULT_OVAL_CLASS,
  placeholderClassName = DEFAULT_PLACEHOLDER_CLASS,
  showOvalGuide = true,
  enableFaceAlignment = false,
  alignmentConfig,
  overlayShape,
  onAlignmentChange,
  detectionInterval,
  minConfidence,
  showDebugUi = false,
}: FaceCaptureFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    type: 'move' | 'resize' | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startOffsetX: number;
    startOffsetY: number;
    frameWidth: number;
    frameHeight: number;
  } | null>(null);
  const [alignmentState, setAlignmentState] = useState<FaceAlignmentState>(DEFAULT_ALIGNMENT_STATE);
  const [alignmentMetrics, setAlignmentMetrics] = useState<FaceAlignmentMetrics>(
    DEFAULT_ALIGNMENT_METRICS,
  );
  const baseConfig = useMemo(
    () => ({ ...DEFAULT_ALIGNMENT_CONFIG, ...alignmentConfig }),
    [alignmentConfig],
  );
  const baseOverlayShape = useMemo(
    () => ({ ...DEFAULT_OVERLAY_SHAPE, ...overlayShape }),
    [overlayShape],
  );
  const [debugConfig, setDebugConfig] = useState<FaceAlignmentConfig | null>(null);
  const [debugOverlayShape, setDebugOverlayShape] = useState<OverlayShapeConfig | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  const config = debugConfig ?? baseConfig;
  const activeOverlayShape = debugOverlayShape ?? baseOverlayShape;
  const detectionMinConfidence = minConfidence ?? config.minConfidence;

  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number } | null>(null);

  const updateOverlayCenter = useCallback(() => {
    const overlayEl = overlayRef.current;
    const video = cameraRef.current?.getVideoElement();
    if (!overlayEl || !video) {
      setOverlayCenter(null);
      return;
    }
    const videoRect = video.getBoundingClientRect();
    const overlayRect = overlayEl.getBoundingClientRect();
    if (videoRect.width === 0 || videoRect.height === 0) {
      setOverlayCenter(null);
      return;
    }
    const centerX =
      (overlayRect.left + overlayRect.width / 2 - videoRect.left) / videoRect.width;
    const centerY =
      (overlayRect.top + overlayRect.height / 2 - videoRect.top) / videoRect.height;
    setOverlayCenter({ x: centerX, y: centerY });
  }, [cameraRef]);

  useEffect(() => {
    updateOverlayCenter();
    window.addEventListener('resize', updateOverlayCenter);
    return () => window.removeEventListener('resize', updateOverlayCenter);
  }, [updateOverlayCenter]);

  useEffect(() => {
    updateOverlayCenter();
  }, [
    updateOverlayCenter,
    activeOverlayShape.widthPct,
    activeOverlayShape.heightPct,
    activeOverlayShape.offsetXPct,
    activeOverlayShape.offsetYPct,
    stream,
  ]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragRef.current;
      const frameEl = frameRef.current;
      if (!dragState || !frameEl) {
        return;
      }

      const dxPct = ((event.clientX - dragState.startX) / dragState.frameWidth) * 100;
      const dyPct = ((event.clientY - dragState.startY) / dragState.frameHeight) * 100;

      if (dragState.type === 'move') {
        setDebugOverlayShape((prev) => {
          const next = prev ?? baseOverlayShape;
          return {
            ...next,
            offsetXPct: clamp(dragState.startOffsetX + dxPct, -40, 40),
            offsetYPct: clamp(dragState.startOffsetY + dyPct, -40, 25),
          };
        });
      }

      if (dragState.type === 'resize') {
        setDebugOverlayShape((prev) => {
          const next = prev ?? baseOverlayShape;
          return {
            ...next,
            widthPct: clamp(dragState.startWidth + dxPct, 40, 90),
            heightPct: clamp(dragState.startHeight + dyPct, 40, 95),
          };
        });
      }
    },
    [baseOverlayShape],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, type: 'move' | 'resize') => {
      if (!debugOpen) {
        return;
      }

      const frameEl = frameRef.current;
      const currentShape = debugOverlayShape ?? baseOverlayShape;
      if (!frameEl) {
        return;
      }

      const rect = frameEl.getBoundingClientRect();
      dragRef.current = {
        type,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: currentShape.widthPct,
        startHeight: currentShape.heightPct,
        startOffsetX: currentShape.offsetXPct ?? 0,
        startOffsetY: currentShape.offsetYPct ?? 0,
        frameWidth: rect.width,
        frameHeight: rect.height,
      };

      if (!debugOverlayShape) {
        setDebugOverlayShape(currentShape);
      }
      if (!debugConfig) {
        setDebugConfig(baseConfig);
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [baseConfig, baseOverlayShape, debugConfig, debugOpen, debugOverlayShape, handlePointerMove, handlePointerUp],
  );

  const computeAlignment = useCallback(
    (faceDetection: FaceDetectionResult): FaceAlignmentState => {
      if (!enableFaceAlignment) {
        return { aligned: true, reason: 'disabled' };
      }

      if (faceDetection.isLoading) {
        return { aligned: false, reason: 'loading' };
      }

      if (!faceDetection.faceDetected) {
        return { aligned: false, reason: 'no_face' };
      }

      if (config.requireSingleFace && faceDetection.faceCount !== 1) {
        return { aligned: false, reason: 'multiple_faces' };
      }

      if (!faceDetection.boundingBox) {
        return { aligned: false, reason: 'no_bbox' };
      }

      const video = cameraRef.current?.getVideoElement();
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        return { aligned: false, reason: 'no_video' };
      }

      const overlayEl = overlayRef.current;
      if (!overlayEl) {
        return { aligned: false, reason: 'no_overlay' };
      }

      const videoRect = video.getBoundingClientRect();
      const overlayRect = overlayEl.getBoundingClientRect();
      if (videoRect.width === 0 || videoRect.height === 0 || overlayRect.width === 0) {
        return { aligned: false, reason: 'no_overlay' };
      }

      const ellipseWidthNorm = overlayRect.width / videoRect.width;
      const ellipseHeightNorm = overlayRect.height / videoRect.height;
      const ellipseAreaNorm = Math.PI * (ellipseWidthNorm / 2) * (ellipseHeightNorm / 2);

      const faceWidthNorm = faceDetection.boundingBox.width / video.videoWidth;
      const faceHeightNorm = faceDetection.boundingBox.height / video.videoHeight;
      const faceAreaNorm = faceWidthNorm * faceHeightNorm;

      const faceWidthRatio = faceWidthNorm / ellipseWidthNorm;
      const faceHeightRatio = faceHeightNorm / ellipseHeightNorm;
      const faceAreaRatio = ellipseAreaNorm > 0 ? faceAreaNorm / ellipseAreaNorm : 0;

      setAlignmentMetrics((prev) => ({
        ...prev,
        faceWidthRatio,
        faceHeightRatio,
        faceAreaRatio,
        faceCount: faceDetection.faceCount,
        confidence: faceDetection.confidence,
        detectionMethod: faceDetection.detectionMethod,
      }));

      const ellipseCenterX = overlayCenter?.x ?? 0.5;
      const ellipseCenterY = overlayCenter?.y ?? 0.5;
      const ellipseRadiusX = ellipseWidthNorm / 2;
      const ellipseRadiusY = ellipseHeightNorm / 2;

      const faceLeftNorm =
        (video.videoWidth - (faceDetection.boundingBox.x + faceDetection.boundingBox.width)) /
        video.videoWidth;
      const faceTopNorm = faceDetection.boundingBox.y / video.videoHeight;

      const samples = Math.max(4, Math.round(config.overlapSamples));
      let inside = 0;
      const total = samples * samples;

      for (let i = 0; i < samples; i += 1) {
        for (let j = 0; j < samples; j += 1) {
          const sampleX = faceLeftNorm + ((i + 0.5) / samples) * faceWidthNorm;
          const sampleY = faceTopNorm + ((j + 0.5) / samples) * faceHeightNorm;
          const nx = (sampleX - ellipseCenterX) / ellipseRadiusX;
          const ny = (sampleY - ellipseCenterY) / ellipseRadiusY;
          if (nx * nx + ny * ny <= 1) {
            inside += 1;
          }
        }
      }

      const overlapRatio = total > 0 ? inside / total : 0;
      setAlignmentMetrics((prev) => ({
        ...prev,
        overlapRatio,
      }));

      if (!config.allowFallback && faceDetection.detectionMethod === 'fallback') {
        return { aligned: false, reason: 'fallback' };
      }

      if (faceAreaRatio < config.minFaceAreaRatio) {
        return { aligned: false, reason: 'too_far' };
      }

      if (faceAreaRatio > config.maxFaceAreaRatio) {
        return { aligned: false, reason: 'too_close' };
      }

      if (faceWidthRatio < config.minFaceWidthRatio || faceHeightRatio < config.minFaceHeightRatio) {
        return { aligned: false, reason: 'too_far' };
      }

      if (faceWidthRatio > config.maxFaceWidthRatio || faceHeightRatio > config.maxFaceHeightRatio) {
        return { aligned: false, reason: 'too_close' };
      }

      if (faceDetection.confidence !== null && faceDetection.confidence < config.minConfidence) {
        return { aligned: false, reason: 'low_confidence' };
      }

      if (overlapRatio < config.overlapThreshold) {
        return { aligned: false, reason: 'off_center' };
      }

      return { aligned: true, reason: 'aligned' };
    },
    [cameraRef, config, enableFaceAlignment, overlayCenter],
  );

  const handleFaceDetectionChange = useCallback(
    (faceDetection: FaceDetectionResult) => {
      if (!enableFaceAlignment) {
        return;
      }
      if (!faceDetection.faceDetected) {
        setAlignmentMetrics((prev) => ({
          ...prev,
          overlapRatio: null,
          faceWidthRatio: null,
          faceHeightRatio: null,
          faceAreaRatio: null,
          faceCount: faceDetection.faceCount,
          confidence: faceDetection.confidence,
          detectionMethod: faceDetection.detectionMethod,
        }));
      }
      const nextState = computeAlignment(faceDetection);
      setAlignmentState(nextState);
      onAlignmentChange?.(nextState);
    },
    [computeAlignment, enableFaceAlignment, onAlignmentChange],
  );

  const overlayStatusClass = useMemo(() => {
    if (!enableFaceAlignment) {
      return '';
    }

    if (alignmentState.aligned) {
      return 'border-green-500';
    }

    if (alignmentState.reason === 'loading' || alignmentState.reason === 'no_face') {
      return 'border-amber-400';
    }

    return 'border-red-500';
  }, [alignmentState.aligned, alignmentState.reason, enableFaceAlignment]);

  return (
    <div ref={frameRef} className={frameClassName}>
      {stream ? (
        <div className="w-full h-full">
          <CameraPreview
            ref={cameraRef}
            stream={stream}
            isActive={isActive}
            onFaceDetectionChange={handleFaceDetectionChange}
            detectionInterval={detectionInterval}
            minConfidence={detectionMinConfidence}
          />
        </div>
      ) : (
        <div className={placeholderClassName}></div>
      )}

      {showOvalGuide && (
        <div
          className={`absolute inset-0 ${debugOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div
            ref={overlayRef}
            onPointerDown={(event) => startDrag(event, 'move')}
            className={`${overlayClassName} ${overlayStatusClass} absolute ${
              debugOpen ? 'cursor-move' : ''
            }`}
            style={{
              width: `${activeOverlayShape.widthPct}%`,
              height: `${activeOverlayShape.heightPct}%`,
              left: `${50 + (activeOverlayShape.offsetXPct ?? 0)}%`,
              top: `${50 + (activeOverlayShape.offsetYPct ?? 0)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {debugOpen && (
              <div
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startDrag(event, 'resize');
                }}
                className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full border border-white bg-black/70"
              />
            )}
          </div>
        </div>
      )}

      {enableFaceAlignment && (
        <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
          {alignmentState.aligned ? 'Ready to capture' : `Adjust: ${alignmentState.reason}`}
        </div>
      )}

      {showDebugUi && enableFaceAlignment && (
        <>
          <div className="absolute bottom-3 right-3 flex items-end">
            <button
              type="button"
              onClick={() => {
                setDebugOpen((prev) => !prev);
                if (!debugConfig) {
                  setDebugConfig(baseConfig);
                }
                if (!debugOverlayShape) {
                  setDebugOverlayShape(baseOverlayShape);
                }
              }}
              className="rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white"
            >
              Debug
            </button>
          </div>
          {debugOpen &&
            debugConfig &&
            debugOverlayShape &&
            createPortal(
              <div className="fixed bottom-4 right-4 z-50 w-[280px] rounded-lg bg-white/95 p-3 text-[11px] text-neutral-800 shadow-lg">
                <div className="mb-2 font-semibold">Face Capture Debug</div>
                <div className="text-[10px] text-neutral-500">Drag the oval to move, handle to resize.</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span>Overlap %</span>
                    <input
                      type="number"
                      min={0.4}
                      max={0.9}
                      step={0.01}
                      value={debugConfig.overlapThreshold}
                      onChange={(event) =>
                        setDebugConfig({
                          ...debugConfig,
                          overlapThreshold: Number(event.target.value),
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span>Min Fill %</span>
                    <input
                      type="number"
                      min={0.2}
                      max={1.2}
                      step={0.01}
                      value={debugConfig.minFaceAreaRatio}
                      onChange={(event) =>
                        setDebugConfig({
                          ...debugConfig,
                          minFaceAreaRatio: Number(event.target.value),
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span>Max Fill %</span>
                    <input
                      type="number"
                      min={0.6}
                      max={1.6}
                      step={0.01}
                      value={debugConfig.maxFaceAreaRatio}
                      onChange={(event) =>
                        setDebugConfig({
                          ...debugConfig,
                          maxFaceAreaRatio: Number(event.target.value),
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span>Samples</span>
                    <input
                      type="number"
                      min={6}
                      max={24}
                      step={1}
                      value={debugConfig.overlapSamples}
                      onChange={(event) =>
                        setDebugConfig({
                          ...debugConfig,
                          overlapSamples: Number(event.target.value),
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-1"
                    />
                  </label>
                </div>
                <div className="mt-3 space-y-1 text-[11px]">
                  <div>Status: {alignmentState.aligned ? 'Ready' : alignmentState.reason}</div>
                  <div>
                    Overlap:{' '}
                    {alignmentMetrics.overlapRatio === null
                      ? '--'
                      : `${Math.round(alignmentMetrics.overlapRatio * 100)}%`}
                  </div>
                  <div>
                    Fill:{' '}
                    {alignmentMetrics.faceAreaRatio === null
                      ? '--'
                      : `${Math.round(alignmentMetrics.faceAreaRatio * 100)}%`}
                  </div>
                  <div>
                    Oval: {debugOverlayShape.widthPct.toFixed(1)}% w ·{' '}
                    {debugOverlayShape.heightPct.toFixed(1)}% h
                  </div>
                  <div>
                    Offset: {(debugOverlayShape.offsetXPct ?? 0).toFixed(1)}% x ·{' '}
                    {(debugOverlayShape.offsetYPct ?? 0).toFixed(1)}% y
                  </div>
                  <div>
                    Size: {alignmentMetrics.faceWidthRatio?.toFixed(2) ?? '--'}w ·{' '}
                    {alignmentMetrics.faceHeightRatio?.toFixed(2) ?? '--'}h
                  </div>
                  <div>Faces: {alignmentMetrics.faceCount}</div>
                  <div>
                    Confidence:{' '}
                    {alignmentMetrics.confidence === null
                      ? '--'
                      : `${Math.round(alignmentMetrics.confidence * 100)}%`}
                  </div>
                  <div>Method: {alignmentMetrics.detectionMethod ?? '--'}</div>
                </div>
                <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] text-neutral-700">
                  overlayShape: {'{'}widthPct: {debugOverlayShape.widthPct.toFixed(1)}, heightPct:{' '}
                  {debugOverlayShape.heightPct.toFixed(1)}, offsetXPct:{' '}
                  {(debugOverlayShape.offsetXPct ?? 0).toFixed(1)}, offsetYPct:{' '}
                  {(debugOverlayShape.offsetYPct ?? 0).toFixed(1)}
                  {'}'}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded border border-neutral-300 px-2 py-1 text-xs font-semibold"
                  onClick={() => {
                    setDebugConfig(baseConfig);
                    setDebugOverlayShape(baseOverlayShape);
                  }}
                >
                  Reset Defaults
                </button>
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
