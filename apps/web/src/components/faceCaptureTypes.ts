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

export function getFaceAlignmentLabel(reason: FaceAlignmentReason): string {
  switch (reason) {
    case 'aligned':
      return 'Ready to capture';
    case 'loading':
      return 'Starting camera...';
    case 'no_face':
      return 'Move into the oval';
    case 'multiple_faces':
      return 'One face at a time';
    case 'fallback':
      return 'Improving camera detection';
    case 'no_bbox':
      return 'Align your face with the oval';
    case 'low_confidence':
      return 'Hold still and face camera';
    case 'no_video':
      return 'Starting video stream';
    case 'no_overlay':
      return 'Aligning overlay';
    case 'too_close':
      return 'Move farther away';
    case 'too_far':
      return 'Move closer';
    case 'off_center':
      return 'Center your face in the oval';
    case 'disabled':
    default:
      return 'Align your face with the oval';
  }
}
