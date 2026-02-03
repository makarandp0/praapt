import { FaceMatchBody, FaceMatchResponseSchema } from '@praapt/shared';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CameraPreview } from '../components/CameraPreview';
import { ServiceStatusBanner } from '../components/ServiceStatusBanner';
import { Status, StatusMessage } from '../components/StatusMessage';
import { Button } from '../components/ui/button';
import { useModelStatus } from '../contexts/ModelStatusContext';
import { useCamera } from '../hooks/useCamera';
import { FaceDetectionResult } from '../hooks/useFaceDetection';

/** Match info passed via route state to the User page */
export interface FaceMatchState {
  user: {
    id: number;
    email: string;
    name: string | null;
    profileImagePath: string | null;
  };
  matchInfo: {
    distance: number;
    threshold: number;
    loginImage: string;
    topMatches: Array<{
      email: string;
      name: string | null;
      distance: number;
      profileImagePath: string | null;
    }>;
  };
}

interface FaceMatchDemoProps {
  apiBase: string;
}

export function FaceDemo({ apiBase }: FaceMatchDemoProps) {
  const navigate = useNavigate();
  const { modelsLoaded, isChecking: isCheckingModel, model, refreshStatus } = useModelStatus();

  // Check if the login functionality is available
  const isModelReady = modelsLoaded && model !== null;

  // Camera state (using hook)
  const {
    cameraRef,
    streamRef,
    cameraOpen,
    openCamera: openCameraBase,
    closeCamera,
    captureFrame,
  } = useCamera();

  // Face detection state (updated via callback from CameraPreview)
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult>({
    faceDetected: false,
    faceCount: 0,
    isLoading: true,
    error: null,
    confidence: null,
    boundingBox: null,
    detectionMethod: null,
  });

  // Submission state
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedMatches, setFailedMatches] = useState<
    Array<{ email: string; name: string | null; distance: number; profileImagePath: string | null }>
  >([]);

  // Auto-login state with exponential backoff
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);
  const [retryDelay, setRetryDelay] = useState(2); // Start with 2 seconds
  const [countdown, setCountdown] = useState(2);
  const autoLoginRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle face detection updates from CameraPreview
  const handleFaceDetectionChange = useCallback((result: FaceDetectionResult) => {
    setFaceDetection(result);
  }, []);

  /** Open the webcam with status updates */
  const openCamera = useCallback(async () => {
    const result = await openCameraBase();
    if (result.success) {
      // Reset retry delay when camera opens
      setRetryDelay(2);
      setCountdown(2);
      setStatus({ message: 'Camera ready. Auto-match will attempt shortly...', type: 'info' });
    } else {
      setStatus({ message: `Camera error: ${result.error}`, type: 'error' });
    }
  }, [openCameraBase]);

  /** Capture and submit for face matching */
  const handleFaceMatch = useCallback(async () => {
    const dataUrl = captureFrame();
    if (!dataUrl) {
      setStatus({ message: 'Camera not ready', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ message: 'Matching face...', type: 'info' });

    try {
      const body: FaceMatchBody = { faceImage: dataUrl };

      const response = await fetch(`${apiBase}/demo/face-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = FaceMatchResponseSchema.parse(await response.json());

      if (!data.ok) {
        const msg = data.error || 'No match found';
        const extra =
          data.distance !== undefined
            ? ` (distance: ${data.distance.toFixed(3)}, threshold: ${data.threshold})`
            : '';
        setStatus({ message: `${msg}${extra}`, type: 'error' });
        // Store top matches for display
        if (data.topMatches) {
          setFailedMatches(data.topMatches);
        }
        // Refresh status in case face service went down
        refreshStatus();
        setIsSubmitting(false);
        return;
      }

      // Match found - clear failed matches and show result
      setFailedMatches([]);
      closeCamera();

      // Navigate with match state
      const matchState: FaceMatchState = {
        user: data.matchedRegistration,
        matchInfo: {
          ...data.match,
          loginImage: dataUrl,
          topMatches: data.topMatches,
        },
      };

      setStatus({
        message: `Match found: ${data.matchedRegistration.name || data.matchedRegistration.email}!`,
        type: 'success',
      });
      setTimeout(() => navigate('/user', { replace: true, state: matchState }), 500);
    } catch (err) {
      setStatus({
        message: `Network error: ${err instanceof Error ? err.message : 'unknown'}`,
        type: 'error',
      });
      // Refresh status in case face service went down
      refreshStatus();
      setIsSubmitting(false);
    }
  }, [apiBase, navigate, closeCamera, refreshStatus, captureFrame]);

  // Auto-login effect with exponential backoff
  useEffect(() => {
    // Clear any existing timers
    if (autoLoginRef.current) {
      clearTimeout(autoLoginRef.current);
      autoLoginRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Only auto-login when camera is open, not submitting, auto-login is enabled, model is loaded, and face is detected
    if (
      !cameraOpen ||
      isSubmitting ||
      !autoLoginEnabled ||
      !isModelReady ||
      !faceDetection.faceDetected
    ) {
      // Reset countdown when conditions aren't met (e.g., face lost)
      setCountdown(retryDelay);
      return;
    }

    // Start countdown
    setCountdown(retryDelay);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule auto-login
    autoLoginRef.current = setTimeout(() => {
      handleFaceMatch();
      // Increase delay exponentially (2 -> 4 -> 8 -> 16 -> max 60 seconds)
      setRetryDelay((prev) => Math.min(prev * 2, 60));
    }, retryDelay * 1000);

    return () => {
      if (autoLoginRef.current) {
        clearTimeout(autoLoginRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [
    cameraOpen,
    isSubmitting,
    autoLoginEnabled,
    isModelReady,
    retryDelay,
    handleFaceMatch,
    faceDetection.faceDetected,
  ]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-center">Face Match Demo</h2>
      <p className="text-center text-sm text-gray-500">
        Test face matching against registered faces
      </p>

      <ServiceStatusBanner />

      <div className="space-y-4">
        {/* Camera preview */}
        {cameraOpen ? (
          <div className="space-y-4">
            <CameraPreview
              ref={cameraRef}
              stream={streamRef.current}
              isActive={cameraOpen}
              onFaceDetectionChange={handleFaceDetectionChange}
            />

            {/* Auto-match countdown - only show when face is detected */}
            {autoLoginEnabled && !isSubmitting && faceDetection.faceDetected && (
              <div className="text-center text-sm text-green-600">
                Auto-match in <span className="font-mono font-bold">{countdown}</span> seconds...
              </div>
            )}

            {/* Waiting for face message */}
            {autoLoginEnabled &&
              !isSubmitting &&
              !faceDetection.faceDetected &&
              !faceDetection.isLoading && (
                <div className="text-center text-sm text-orange-600">
                  Position your face in front of the camera to find a match
                </div>
              )}

            <div className="flex gap-2">
              <Button
                onClick={handleFaceMatch}
                disabled={isSubmitting || !faceDetection.faceDetected}
                className="flex-1"
              >
                {isSubmitting ? 'Matching...' : 'Find Match'}
              </Button>
              <Button variant="outline" onClick={closeCamera} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>

            {/* Auto-match toggle */}
            <div className="flex items-center justify-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLoginEnabled}
                  onChange={(e) => setAutoLoginEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-retry matching
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">Find a matching face registration</p>
              <Button onClick={openCamera} disabled={!isModelReady || isCheckingModel}>
                {isCheckingModel ? 'Checking model...' : 'Open Camera'}
              </Button>
              {!isModelReady && !isCheckingModel && (
                <p className="text-sm text-orange-600 mt-3">
                  ⚠️ Please load a face recognition model using the controls above first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status message */}
        <StatusMessage status={status} centered />

        {/* Failed matches display */}
        {failedMatches.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-red-800">
              Closest Matches (all above threshold)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {failedMatches.map((match, index) => {
                const imageUrl = match.profileImagePath
                  ? `${apiBase}/images/file/${encodeURIComponent(match.profileImagePath)}`
                  : null;
                return (
                  <div
                    key={match.email}
                    className="relative rounded-lg border border-red-300 bg-white p-1"
                  >
                    {/* Rank badge */}
                    <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-400 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    {/* Profile image */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={match.name || match.email}
                        className="w-full aspect-square rounded object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                    )}

                    {/* Name and distance */}
                    <div className="mt-1 text-center">
                      <p className="text-xs font-medium truncate" title={match.name || match.email}>
                        {match.name || 'Unknown'}
                      </p>
                      <p className="text-xs font-mono text-red-600">{match.distance.toFixed(3)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Link to register face */}
      <p className="text-center text-sm text-gray-600">
        Want to register a new face?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          Register Face
        </a>
      </p>
    </div>
  );
}
