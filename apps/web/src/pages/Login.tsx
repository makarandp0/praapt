import { LoginBody, LoginResponse, LoginFailureResponse, ErrorResponse } from '@praapt/shared';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { CameraPreview, CameraPreviewRef } from '../components/CameraPreview';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { FaceDetectionResult } from '../hooks/useFaceDetection';

interface LoginProps {
  apiBase: string;
}

export function Login({ apiBase }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/user';

  // Camera state
  const cameraRef = useRef<CameraPreviewRef | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

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
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedMatches, setFailedMatches] = useState<
    Array<{ email: string; name: string | null; distance: number; profileImagePath: string | null }>
  >([]);

  // Auto-login state with exponential backoff
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);
  const [retryDelay, setRetryDelay] = useState(5); // Start with 5 seconds
  const [countdown, setCountdown] = useState(5);
  const autoLoginRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Handle face detection updates from CameraPreview
  const handleFaceDetectionChange = useCallback((result: FaceDetectionResult) => {
    setFaceDetection(result);
  }, []);

  /** Open the webcam */
  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Reset retry delay when camera opens
      setRetryDelay(5);
      setCountdown(5);
      setStatus('Camera ready. Auto-login will attempt shortly...');
    } catch (err) {
      setStatus(`Camera error: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }, []);

  /** Stop the webcam */
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  /** Capture and submit for face login */
  const handleLogin = useCallback(async () => {
    const dataUrl = cameraRef.current?.captureFrame();
    if (!dataUrl) {
      setStatus('Camera not ready');
      return;
    }

    setIsSubmitting(true);
    setStatus('Verifying face...');

    try {
      const body: LoginBody = { faceImage: dataUrl };

      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as LoginResponse | LoginFailureResponse | ErrorResponse;

      if (!response.ok) {
        const errorData = data as LoginFailureResponse;
        const msg = errorData.error || 'Login failed';
        const extra =
          errorData.distance !== undefined
            ? ` (distance: ${errorData.distance.toFixed(3)}, threshold: ${errorData.threshold})`
            : '';
        setStatus(`${msg}${extra}`);
        // Store top matches for display
        if (errorData.topMatches) {
          setFailedMatches(errorData.topMatches);
        }
        setIsSubmitting(false);
        return;
      }

      // Login successful - clear failed matches
      setFailedMatches([]);
      const successData = data as LoginResponse;
      closeCamera();
      login(successData.user, {
        ...successData.match,
        loginImage: dataUrl,
        topMatches: successData.topMatches,
      });
      setStatus(`Welcome back, ${successData.user.name || successData.user.email}!`);
      setTimeout(() => navigate(from, { replace: true }), 500);
    } catch (err) {
      setStatus(`Network error: ${err instanceof Error ? err.message : 'unknown'}`);
      setIsSubmitting(false);
    }
  }, [apiBase, login, navigate, from, closeCamera]);

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

    // Only auto-login when camera is open, not submitting, auto-login is enabled, and face is detected
    if (!cameraOpen || isSubmitting || !autoLoginEnabled || !faceDetection.faceDetected) {
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
      handleLogin();
      // Increase delay exponentially (5 -> 10 -> 20 -> 40 -> max 60 seconds)
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
    retryDelay,
    handleLogin,
    faceDetection.faceDetected,
  ]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-center">Login with Face Recognition</h2>

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

            {/* Auto-login countdown - only show when face is detected */}
            {autoLoginEnabled && !isSubmitting && faceDetection.faceDetected && (
              <div className="text-center text-sm text-green-600">
                Auto-login in <span className="font-mono font-bold">{countdown}</span> seconds...
              </div>
            )}

            {/* Waiting for face message */}
            {autoLoginEnabled &&
              !isSubmitting &&
              !faceDetection.faceDetected &&
              !faceDetection.isLoading && (
                <div className="text-center text-sm text-orange-600">
                  Position your face in front of the camera to login
                </div>
              )}

            <div className="flex gap-2">
              <Button
                onClick={handleLogin}
                disabled={isSubmitting || !faceDetection.faceDetected}
                className="flex-1"
              >
                {isSubmitting ? 'Verifying...' : 'Login Now'}
              </Button>
              <Button variant="outline" onClick={closeCamera} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>

            {/* Auto-login toggle */}
            <div className="flex items-center justify-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLoginEnabled}
                  onChange={(e) => setAutoLoginEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-retry login
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">Use your face to log in</p>
              <Button onClick={openCamera}>Open Camera</Button>
            </div>
          </div>
        )}

        {/* Status message */}
        {status && (
          <p
            className={`text-sm text-center ${
              status.includes('failed') ||
              status.includes('error') ||
              status.includes('not recognized')
                ? 'text-red-600'
                : status.includes('Welcome')
                  ? 'text-green-600'
                  : 'text-gray-600'
            }`}
          >
            {status}
          </p>
        )}

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

      {/* Link to signup */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
