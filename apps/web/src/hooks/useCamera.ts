import { useRef, useState, useCallback } from 'react';

import { CameraPreviewRef } from '../components/CameraPreview';

export interface UseCameraOptions {
  /** Video constraints for getUserMedia */
  videoConstraints?: MediaStreamConstraints['video'];
}

export interface UseCameraResult {
  /** Ref to attach to CameraPreview component */
  cameraRef: React.RefObject<CameraPreviewRef>;
  /** Ref to the MediaStream (for passing to CameraPreview) */
  streamRef: React.RefObject<MediaStream | null>;
  /** Whether the camera is currently open */
  cameraOpen: boolean;
  /** Open the camera and start the stream */
  openCamera: () => Promise<{ success: true } | { success: false; error: string }>;
  /** Close the camera and stop the stream */
  closeCamera: () => void;
  /** Capture a frame from the video as a data URL */
  captureFrame: () => string | null;
}

const DEFAULT_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  facingMode: 'user',
  width: 640,
  height: 480,
};

/**
 * Hook for managing camera state and operations.
 * Provides open/close camera functionality and frame capture.
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
  const { videoConstraints = DEFAULT_VIDEO_CONSTRAINTS } = options;

  const cameraRef = useRef<CameraPreviewRef>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      return { success: true as const };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'unknown';
      return { success: false as const, error: errorMessage };
    }
  }, [videoConstraints]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const captureFrame = useCallback(() => {
    return cameraRef.current?.captureFrame() ?? null;
  }, []);

  return {
    cameraRef,
    streamRef,
    cameraOpen,
    openCamera,
    closeCamera,
    captureFrame,
  };
}
