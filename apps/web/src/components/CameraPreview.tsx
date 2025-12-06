import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import { useFaceDetection, FaceDetectionResult } from '../hooks/useFaceDetection';

export interface CameraPreviewRef {
  /** Capture current frame as data URL */
  captureFrame: () => string | null;
  /** Get the video element */
  getVideoElement: () => HTMLVideoElement | null;
}

export interface CameraPreviewProps {
  /** The media stream to display */
  stream: MediaStream | null;
  /** Whether face detection should be active */
  isActive: boolean;
  /** Called when face detection state changes */
  onFaceDetectionChange?: (result: FaceDetectionResult) => void;
  /** Face detection options */
  detectionInterval?: number;
  minConfidence?: number;
}

export const CameraPreview = forwardRef<CameraPreviewRef, CameraPreviewProps>(
  (
    { stream, isActive, onFaceDetectionChange, detectionInterval = 200, minConfidence = 0.7 },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Face detection
    const faceDetection = useFaceDetection(videoRef, isActive && !!stream, {
      detectionInterval,
      minConfidence,
    });

    // Notify parent of face detection changes
    useEffect(() => {
      onFaceDetectionChange?.(faceDetection);
    }, [faceDetection, onFaceDetectionChange]);

    // Attach stream to video element
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error('Video play error:', err);
        });
      }
    }, [stream]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        captureFrame: () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) return null;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;

          ctx.drawImage(video, 0, 0);
          return canvas.toDataURL('image/jpeg', 0.9);
        },
        getVideoElement: () => videoRef.current,
      }),
      [],
    );

    if (!stream) {
      return null;
    }

    return (
      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full rounded-lg border-2 -scale-x-100 ${
            faceDetection.faceDetected
              ? 'border-green-500'
              : faceDetection.isLoading
                ? 'border-gray-300'
                : 'border-orange-400'
          }`}
          autoPlay
          playsInline
          muted
        />

        {/* Face bounding box overlay - only show for accurate models (blazeface or facedetector) */}
        {faceDetection.faceDetected &&
          faceDetection.boundingBox &&
          faceDetection.detectionMethod !== 'fallback' &&
          videoRef.current &&
          videoRef.current.videoWidth > 0 && (
            <div
              className="absolute border-2 border-green-400 rounded-sm pointer-events-none"
              style={{
                // Mirror the x coordinate to match the mirrored video
                right: `${(faceDetection.boundingBox.x / videoRef.current.videoWidth) * 100}%`,
                top: `${(faceDetection.boundingBox.y / videoRef.current.videoHeight) * 100}%`,
                width: `${(faceDetection.boundingBox.width / videoRef.current.videoWidth) * 100}%`,
                height: `${(faceDetection.boundingBox.height / videoRef.current.videoHeight) * 100}%`,
              }}
            />
          )}

        {/* Face detection status overlay */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            faceDetection.faceDetected
              ? 'bg-green-100 text-green-800'
              : faceDetection.isLoading
                ? 'bg-gray-100 text-gray-600'
                : 'bg-orange-100 text-orange-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              faceDetection.faceDetected
                ? 'bg-green-500 animate-pulse'
                : faceDetection.isLoading
                  ? 'bg-gray-400'
                  : 'bg-orange-500'
            }`}
          />
          {faceDetection.isLoading
            ? 'Initializing...'
            : faceDetection.faceDetected
              ? `Face detected${faceDetection.confidence !== null ? ` (${Math.round(faceDetection.confidence * 100)}%)` : ''}${faceDetection.faceCount > 1 ? ` · ${faceDetection.faceCount} faces` : ''}`
              : 'No face detected'}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  },
);

CameraPreview.displayName = 'CameraPreview';
