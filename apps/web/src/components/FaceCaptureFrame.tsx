import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { CameraPreview, CameraPreviewRef } from './CameraPreview';
import {
  FaceAlignmentConfig,
  FaceAlignmentState,
  OverlayShapeConfig,
  getFaceAlignmentLabel,
} from './faceCaptureTypes';
import { FACE_CAPTURE_ALIGNMENT_CONFIG, FACE_CAPTURE_OVERLAY_SHAPE } from './faceCaptureDefaults';
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

export interface FaceAlignmentMetrics {
  overlapRatio: number | null;
  faceWidthRatio: number | null;
  faceHeightRatio: number | null;
  faceAreaRatio: number | null;
  faceCount: number;
  confidence: number | null;
  detectionMethod: FaceDetectionResult['detectionMethod'];
}

const DEFAULT_FRAME_CLASS =
  'relative w-[480px] h-[480px] bg-[#E7E0D6] rounded-2xl overflow-hidden flex items-center justify-center';
const DEFAULT_OVAL_CLASS = 'border-4 border-[#243B6B] border-dashed rounded-full opacity-60';
const DEFAULT_PLACEHOLDER_CLASS =
  'w-[340px] h-[420px] border-4 border-[#243B6B] border-dashed rounded-full opacity-60';
const DEFAULT_ALIGNMENT_CONFIG: FaceAlignmentConfig = FACE_CAPTURE_ALIGNMENT_CONFIG;
const DEFAULT_OVERLAY_SHAPE: OverlayShapeConfig = FACE_CAPTURE_OVERLAY_SHAPE;
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
  const [debugEditOpen, setDebugEditOpen] = useState(false);

  const config = debugConfig ?? baseConfig;
  const activeOverlayShape = debugOverlayShape ?? baseOverlayShape;
  const detectionMinConfidence = minConfidence ?? config.minConfidence;

  const ellipseCenterX = 0.5 + (activeOverlayShape.offsetXPct ?? 0) / 100;
  const ellipseCenterY = 0.5 + (activeOverlayShape.offsetYPct ?? 0) / 100;
  const ellipseWidthNorm = activeOverlayShape.widthPct / 100;
  const ellipseHeightNorm = activeOverlayShape.heightPct / 100;

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

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, type: 'move' | 'resize') => {
      if (!debugOpen || !debugEditOpen) {
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
    [
      baseConfig,
      baseOverlayShape,
      debugConfig,
      debugEditOpen,
      debugOpen,
      debugOverlayShape,
      handlePointerMove,
      handlePointerUp,
    ],
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

      if (ellipseWidthNorm <= 0 || ellipseHeightNorm <= 0) {
        return { aligned: false, reason: 'no_overlay' };
      }

      const ellipseAreaNorm = Math.PI * (ellipseWidthNorm / 2) * (ellipseHeightNorm / 2);

      const faceWidthNorm = faceDetection.boundingBox.width / video.videoWidth;
      const faceHeightNorm = faceDetection.boundingBox.height / video.videoHeight;
      const faceAreaNorm = faceWidthNorm * faceHeightNorm;

      const faceWidthRatio = faceWidthNorm / ellipseWidthNorm;
      const faceHeightRatio = faceHeightNorm / ellipseHeightNorm;
      const faceAreaRatio = ellipseAreaNorm > 0 ? faceAreaNorm / ellipseAreaNorm : 0;

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
        faceWidthRatio,
        faceHeightRatio,
        faceAreaRatio,
        overlapRatio,
        faceCount: faceDetection.faceCount,
        confidence: faceDetection.confidence,
        detectionMethod: faceDetection.detectionMethod,
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
    [
      cameraRef,
      config,
      ellipseCenterX,
      ellipseCenterY,
      ellipseHeightNorm,
      ellipseWidthNorm,
      enableFaceAlignment,
    ],
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
          className={`absolute inset-0 ${debugOpen && debugEditOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div
            ref={overlayRef}
            onPointerDown={(event) => startDrag(event, 'move')}
            className={`${overlayClassName} ${overlayStatusClass} absolute ${
              debugOpen && debugEditOpen ? 'cursor-move' : ''
            }`}
            style={{
              width: `${activeOverlayShape.widthPct}%`,
              height: `${activeOverlayShape.heightPct}%`,
              left: `${50 + (activeOverlayShape.offsetXPct ?? 0)}%`,
              top: `${50 + (activeOverlayShape.offsetYPct ?? 0)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {debugOpen && debugEditOpen && (
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
          {getFaceAlignmentLabel(alignmentState.reason)}
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
                <div className="text-[10px] text-neutral-500">
                  Runtime readouts (current vs required).
                </div>
                <div className="mt-3 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Status</span>
                    <span className="font-medium">{getFaceAlignmentLabel(alignmentState.reason)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Overlap</span>
                    <span className="font-medium">
                      {alignmentMetrics.overlapRatio === null
                        ? '--'
                        : `${Math.round(alignmentMetrics.overlapRatio * 100)}%`}{' '}
                      / {Math.round(debugConfig.overlapThreshold * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Fill</span>
                    <span className="font-medium">
                      {alignmentMetrics.faceAreaRatio === null
                        ? '--'
                        : `${Math.round(alignmentMetrics.faceAreaRatio * 100)}%`}{' '}
                      / {Math.round(debugConfig.minFaceAreaRatio * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Faces</span>
                    <span className="font-medium">{alignmentMetrics.faceCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Confidence</span>
                    <span className="font-medium">
                      {alignmentMetrics.confidence === null
                        ? '--'
                        : `${Math.round(alignmentMetrics.confidence * 100)}%`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded border border-neutral-300 px-2 py-1 text-xs font-semibold"
                  onClick={() => setDebugEditOpen((prev) => !prev)}
                >
                  {debugEditOpen ? 'Hide Edit Controls' : 'Edit Thresholds & Oval'}
                </button>
                {debugEditOpen && (
                  <>
                    <div className="mt-3 text-[10px] text-neutral-500">
                      Drag oval to move, handle to resize. Adjust thresholds below.
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
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
                    <div>Method: {alignmentMetrics.detectionMethod ?? '--'}</div>
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
                  </>
                )}
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
