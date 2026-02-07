import { FaceAlignmentConfig, OverlayShapeConfig } from './FaceCaptureFrame';

export const FACE_CAPTURE_FRAME_CLASS =
  'relative w-full aspect-[4/3] bg-[#E7E0D6] rounded-2xl overflow-hidden flex items-center justify-center';

export const FACE_CAPTURE_OVERLAY_CLASS =
  'border-4 border-[#243B6B] border-dashed rounded-full opacity-60';

export const FACE_CAPTURE_PLACEHOLDER_CLASS =
  'w-[240px] h-[320px] border-4 border-[#243B6B] border-dashed rounded-full opacity-60';

export const FACE_CAPTURE_OVERLAY_SHAPE: OverlayShapeConfig = {
  widthPct: 43.8,
  heightPct: 67.3,
  offsetXPct: -0.3,
  offsetYPct: -9.9,
};

export const FACE_CAPTURE_ALIGNMENT_CONFIG: FaceAlignmentConfig = {
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
