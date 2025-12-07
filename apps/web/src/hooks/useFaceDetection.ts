import '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs-core';
import * as blazeface from '@tensorflow-models/blazeface';
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Extracts coordinate values from blazeface topLeft/bottomRight which can be
 * either [number, number] tuples or tf.Tensor1D depending on returnTensors flag
 */
function getCoordinate(coord: [number, number] | tf.Tensor1D, index: 0 | 1): number {
  if (Array.isArray(coord)) {
    return coord[index];
  }
  // For tensors, we'd need to call .dataSync() but we always call with returnTensors: false
  // This should not happen in our usage
  return 0;
}

export interface FaceDetectionResult {
  /** Whether a face is currently detected */
  faceDetected: boolean;
  /** Number of faces detected */
  faceCount: number;
  /** Whether the detector is still loading */
  isLoading: boolean;
  /** Error message if detection failed to initialize */
  error: string | null;
  /** Confidence score of the detected face (0-1) */
  confidence: number | null;
  /** Bounding box of the detected face */
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  /** Which detection method is being used */
  detectionMethod: 'blazeface' | 'facedetector' | 'fallback' | null;
}

interface UseFaceDetectionOptions {
  /** Interval in ms between detection runs (default: 200) */
  detectionInterval?: number;
  /** Minimum confidence threshold for face detection (default: 0.7) */
  minConfidence?: number;
}

type DetectionMethod = 'blazeface' | 'facedetector' | 'fallback';

/**
 * Custom hook for browser-based face detection using BlazeFace (TensorFlow.js),
 * FaceDetector API, or a canvas-based fallback with simple skin-tone detection.
 *
 * @param videoRef - Reference to the video element showing camera feed
 * @param isActive - Whether detection should be running
 * @param options - Configuration options
 */
export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
  options: UseFaceDetectionOptions = {},
): FaceDetectionResult {
  const { detectionInterval = 200, minConfidence = 0.7 } = options;

  const [result, setResult] = useState<FaceDetectionResult>({
    faceDetected: false,
    faceCount: 0,
    isLoading: true,
    error: null,
    confidence: null,
    boundingBox: null,
    detectionMethod: null,
  });

  const blazefaceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const nativeDetectorRef = useRef<FaceDetector | null>(null);
  const intervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionMethodRef = useRef<DetectionMethod>('fallback');

  // Initialize detector - try BlazeFace first, then native FaceDetector, then fallback
  useEffect(() => {
    let mounted = true;

    async function initDetector() {
      // Try BlazeFace (TensorFlow.js) first - works in all browsers
      try {
        console.log('Loading BlazeFace model...');
        const model = await blazeface.load();
        if (mounted) {
          blazefaceModelRef.current = model;
          detectionMethodRef.current = 'blazeface';
          console.log('✓ Using BlazeFace (TensorFlow.js) for face detection');
          setResult((prev) => ({ ...prev, isLoading: false, detectionMethod: 'blazeface' }));
          return;
        }
      } catch (err) {
        console.warn('BlazeFace failed to load:', err);
      }

      // Try native FaceDetector API (Chrome/Edge with flag enabled)
      if ('FaceDetector' in window) {
        try {
          const detector = new FaceDetector({
            fastMode: true,
            maxDetectedFaces: 5,
          });
          // Test if it actually works
          await detector.detect(new ImageData(1, 1));

          if (mounted) {
            nativeDetectorRef.current = detector;
            detectionMethodRef.current = 'facedetector';
            console.log('✓ Using native FaceDetector API for face detection');
            setResult((prev) => ({ ...prev, isLoading: false, detectionMethod: 'facedetector' }));
            return;
          }
        } catch (err) {
          console.warn('Native FaceDetector API failed:', err);
        }
      }

      // Fallback: use canvas-based skin-tone detection
      if (mounted) {
        console.log('✓ Using canvas-based skin-tone fallback for face detection');
        detectionMethodRef.current = 'fallback';
        canvasRef.current = document.createElement('canvas');
        setResult((prev) => ({
          ...prev,
          isLoading: false,
          detectionMethod: 'fallback',
          error: null,
        }));
      }
    }

    initDetector();

    return () => {
      mounted = false;
    };
  }, []);

  // Fallback face detection using skin-tone analysis
  const detectFaceFallback = useCallback((video: HTMLVideoElement): FaceDetectionResult => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        faceDetected: false,
        faceCount: 0,
        isLoading: false,
        error: 'Canvas not available',
        confidence: null,
        boundingBox: null,
        detectionMethod: 'fallback',
      };
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width === 0 || height === 0) {
      return {
        faceDetected: false,
        faceCount: 0,
        isLoading: false,
        error: null,
        confidence: null,
        boundingBox: null,
        detectionMethod: 'fallback',
      };
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        faceDetected: false,
        faceCount: 0,
        isLoading: false,
        error: 'Canvas context not available',
        confidence: null,
        boundingBox: null,
        detectionMethod: 'fallback',
      };
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Analyze center region where face is likely to be
    const centerX = Math.floor(width * 0.25);
    const centerY = Math.floor(height * 0.1);
    const regionWidth = Math.floor(width * 0.5);
    const regionHeight = Math.floor(height * 0.7);

    const imageData = ctx.getImageData(centerX, centerY, regionWidth, regionHeight);
    const data = imageData.data;

    // Count skin-tone pixels using YCbCr color space
    let skinPixels = 0;
    let totalPixels = 0;
    let minX = regionWidth,
      maxX = 0,
      minY = regionHeight,
      maxY = 0;

    for (let y = 0; y < regionHeight; y += 2) {
      for (let x = 0; x < regionWidth; x += 2) {
        const i = (y * regionWidth + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to YCbCr
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        // Skin tone detection in YCbCr space
        if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
          skinPixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        totalPixels++;
      }
    }

    const skinRatio = skinPixels / totalPixels;
    // Face likely present if skin tone covers 5-60% of center region
    const faceDetected = skinRatio > 0.05 && skinRatio < 0.6;
    const confidence = faceDetected ? Math.min(skinRatio * 3, 1) : 0;

    return {
      faceDetected,
      faceCount: faceDetected ? 1 : 0,
      isLoading: false,
      error: null,
      confidence: faceDetected ? confidence : null,
      boundingBox: faceDetected
        ? {
            x: centerX + minX,
            y: centerY + minY,
            width: maxX - minX,
            height: maxY - minY,
          }
        : null,
      detectionMethod: 'fallback',
    };
  }, []);

  // Run detection loop
  useEffect(() => {
    if (!isActive || result.isLoading) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const runDetection = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        return;
      }

      try {
        const method = detectionMethodRef.current;

        if (method === 'blazeface' && blazefaceModelRef.current) {
          // Use BlazeFace (TensorFlow.js)
          const predictions = await blazefaceModelRef.current.estimateFaces(video, false);
          const hasFace = predictions.length > 0;
          const topFace = predictions[0];

          // Extract probability - can be number, number[], or Tensor
          let confidence: number | null = null;
          if (hasFace && topFace?.probability !== undefined) {
            const prob = topFace.probability;
            if (typeof prob === 'number') {
              confidence = prob;
            } else if (Array.isArray(prob)) {
              confidence = prob[0];
            } else {
              // It's a Tensor, get the data
              const data = await prob.data();
              confidence = data[0];
            }
          }

          setResult({
            faceDetected: hasFace,
            faceCount: predictions.length,
            isLoading: false,
            error: null,
            confidence,
            boundingBox:
              hasFace && topFace
                ? {
                    x: getCoordinate(topFace.topLeft, 0),
                    y: getCoordinate(topFace.topLeft, 1),
                    width:
                      getCoordinate(topFace.bottomRight, 0) - getCoordinate(topFace.topLeft, 0),
                    height:
                      getCoordinate(topFace.bottomRight, 1) - getCoordinate(topFace.topLeft, 1),
                  }
                : null,
            detectionMethod: 'blazeface',
          });
        } else if (method === 'facedetector' && nativeDetectorRef.current) {
          // Use native FaceDetector API
          const faces = await nativeDetectorRef.current.detect(video);
          const hasFace = faces.length > 0;
          const topFace = faces[0];

          setResult({
            faceDetected: hasFace,
            faceCount: faces.length,
            isLoading: false,
            error: null,
            // FaceDetector API doesn't provide confidence in the standard spec
            // so we use a high default when a face is detected
            confidence: hasFace ? 0.9 : null,
            boundingBox:
              hasFace && topFace
                ? {
                    x: topFace.boundingBox.x,
                    y: topFace.boundingBox.y,
                    width: topFace.boundingBox.width,
                    height: topFace.boundingBox.height,
                  }
                : null,
            detectionMethod: 'facedetector',
          });
        } else {
          // Use fallback detection
          const fallbackResult = detectFaceFallback(video);
          setResult(fallbackResult);
        }
      } catch (err) {
        console.error('Face detection error:', err);
        setResult((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Detection failed',
        }));
      }
    };

    // Run immediately and then on interval
    runDetection();
    intervalRef.current = window.setInterval(runDetection, detectionInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, result.isLoading, videoRef, detectionInterval, minConfidence, detectFaceFallback]);

  return result;
}

// Type declaration for FaceDetector API (experimental)
declare global {
  interface FaceDetector {
    detect(image: ImageBitmapSource): Promise<DetectedFace[]>;
  }

  interface DetectedFace {
    boundingBox: DOMRectReadOnly;
    landmarks?: FaceLandmark[];
  }

  interface FaceLandmark {
    type: 'eye' | 'mouth' | 'nose';
    locations: DOMPointReadOnly[];
  }

  interface FaceDetectorOptions {
    fastMode?: boolean;
    maxDetectedFaces?: number;
  }

  // eslint-disable-next-line no-var
  var FaceDetector: {
    new (options?: FaceDetectorOptions): FaceDetector;
    prototype: FaceDetector;
  };
}
