import { Contracts, type SignupBody, type FaceRegistration } from '@praapt/shared';
import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { CameraPreview } from '../components/CameraPreview';
import { ServiceStatusBanner } from '../components/ServiceStatusBanner';
import { Status, StatusMessage } from '../components/StatusMessage';
import { Button } from '../components/ui/button';
import { useModelStatus } from '../contexts/ModelStatusContext';
import { useCamera } from '../hooks/useCamera';
import { FaceDetectionResult } from '../hooks/useFaceDetection';
import { callContract } from '../lib/contractClient';

interface SignupProps {
  apiBase: string;
}

export function Signup({ apiBase }: SignupProps) {
  const navigate = useNavigate();
  // Track the registered user locally (not in auth context)
  const [registeredUser, setRegisteredUser] = useState<FaceRegistration | null>(null);
  const { modelsLoaded, isChecking: isCheckingModel, model } = useModelStatus();

  // Check if the signup functionality is available
  const isModelReady = modelsLoaded && model !== null;

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Camera state (using hook)
  const {
    cameraRef,
    streamRef,
    cameraOpen,
    openCamera: openCameraBase,
    closeCamera,
    captureFrame,
  } = useCamera();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Face detection state
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult>({
    faceDetected: false,
    faceCount: 0,
    isLoading: true,
    error: null,
    confidence: null,
    boundingBox: null,
    detectionMethod: null,
  });

  // Handle face detection updates from CameraPreview
  const handleFaceDetectionChange = useCallback((result: FaceDetectionResult) => {
    setFaceDetection(result);
  }, []);

  // Submission state
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  /** Open the webcam with status updates */
  const openCamera = useCallback(async () => {
    const result = await openCameraBase();
    if (result.success) {
      setCapturedImage(null);
      setStatus({ message: 'Camera ready. Position your face and click Capture.', type: 'info' });
    } else {
      setStatus({ message: `Camera error: ${result.error}`, type: 'error' });
    }
  }, [openCameraBase]);

  /** Capture a frame from the video */
  const capturePhoto = useCallback(() => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;

    setCapturedImage(dataUrl);
    closeCamera();
    setStatus({ message: 'Photo captured! Review and submit.', type: 'info' });
  }, [closeCamera, captureFrame]);

  /** Submit signup form */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        setStatus({ message: 'Please enter your name', type: 'error' });
        return;
      }
      if (!email.trim()) {
        setStatus({ message: 'Please enter your email', type: 'error' });
        return;
      }
      if (!capturedImage) {
        setStatus({ message: 'Please capture a photo of your face', type: 'error' });
        return;
      }

      setIsSubmitting(true);
      setStatus({ message: 'Registering face...', type: 'info' });

      try {
        const body: SignupBody = {
          name: name.trim(),
          email: email.trim(),
          faceImage: capturedImage,
        };

        // signup is public, no token needed
        const data = await callContract(apiBase, Contracts.signup, { body });

        if (!data.ok) {
          setStatus({ message: `Registration failed: ${data.error || 'Unknown error'}`, type: 'error' });
          setIsSubmitting(false);
          return;
        }

        // Store registered user and show success state
        setRegisteredUser(data.user);
        setStatus({ message: 'Face registered successfully!', type: 'success' });
        setSignupSuccess(true);
        setIsSubmitting(false);
      } catch (err) {
        setStatus({
          message: `Network error: ${err instanceof Error ? err.message : 'unknown'}`,
          type: 'error',
        });
        setIsSubmitting(false);
      }
    },
    [name, email, capturedImage, apiBase],
  );

  /** Reset to retake photo */
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    openCamera();
  }, [openCamera]);

  /** Handle file upload */
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus({ message: 'Please select an image file', type: 'error' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ message: 'Image must be less than 5MB', type: 'error' });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // readAsDataURL always returns a string when successful
        const dataUrl = reader.result;
        if (typeof dataUrl === 'string') {
          setCapturedImage(dataUrl);
          closeCamera();
          setStatus({ message: 'Image uploaded! Review and submit.', type: 'info' });
        } else {
          setStatus({ message: 'Failed to read image file', type: 'error' });
        }
      };
      reader.onerror = () => {
        setStatus({ message: 'Failed to read image file', type: 'error' });
      };
      reader.readAsDataURL(file);
    },
    [closeCamera],
  );

  /** Trigger file input click */
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** Clear image and reset */
  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setStatus(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handler to try face match demo
  const handleTryFaceDemo = useCallback(() => {
    navigate('/facedemo');
  }, [navigate]);

  // If signup was successful, show success screen
  if (signupSuccess && capturedImage) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900">Face Registered!</h2>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold text-gray-900">{registeredUser?.name || name}</span>! Your
            face has been registered successfully.
          </p>
        </div>

        {/* Face Image Preview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 text-center">
            Your Registered Face Image
          </h3>
          <div className="relative rounded-lg overflow-hidden border-2 border-green-200 shadow-sm">
            <img src={capturedImage} alt="Your registered face" className="w-full" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            This is the face image we&rsquo;ll use to match against
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-blue-900">Try Face Match Demo</h3>
          <p className="text-sm text-blue-800">
            Now that you&rsquo;re registered, try the face match demo to see if your face is
            recognized!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleTryFaceDemo} className="w-full" size="lg">
            Try Face Match Demo
          </Button>
          <Button onClick={() => navigate('/library')} variant="outline" className="w-full">
            Continue to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-center">Register Face</h2>

      <ServiceStatusBanner />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your name"
            disabled={isSubmitting}
          />
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
        </div>

        {/* Face capture section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Face Photo</label>

          {/* Video preview (when camera is open) */}
          {cameraOpen && (
            <div className="space-y-2">
              <CameraPreview
                ref={cameraRef}
                stream={streamRef.current}
                isActive={cameraOpen}
                onFaceDetectionChange={handleFaceDetectionChange}
              />

              {/* Waiting for face message */}
              {!faceDetection.faceDetected && !faceDetection.isLoading && (
                <div className="text-center text-sm text-orange-600">
                  Position your face in front of the camera
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" onClick={capturePhoto} disabled={!faceDetection.faceDetected}>
                  Capture
                </Button>
                <Button type="button" variant="outline" onClick={closeCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Captured/uploaded image preview */}
          {capturedImage && !cameraOpen && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Face photo"
                className="w-full rounded-lg border border-gray-300"
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" variant="outline" onClick={retakePhoto}>
                  Use Camera
                </Button>
                <Button type="button" variant="outline" onClick={triggerFileUpload}>
                  Upload Different
                </Button>
                <Button type="button" variant="outline" onClick={clearImage}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Options to capture or upload (when no image and camera closed) */}
          {!cameraOpen && !capturedImage && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={openCamera}
                  disabled={!isModelReady || isCheckingModel}
                >
                  {isCheckingModel ? 'Checking model...' : 'Open Camera'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileUpload}
                  disabled={!isModelReady || isCheckingModel}
                >
                  Upload Image
                </Button>
              </div>
              {!isModelReady && !isCheckingModel && (
                <p className="text-sm text-orange-600">
                  ⚠️ Please load a face recognition model using the controls above before
                  registering.
                </p>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Status message */}
        <StatusMessage status={status} />

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isSubmitting || !capturedImage}>
          {isSubmitting ? 'Registering...' : 'Register Face'}
        </Button>
      </form>

      {/* Link to face demo */}
      <p className="text-center text-sm text-gray-600">
        Already registered?{' '}
        <a href="/facedemo" className="text-blue-600 hover:underline">
          Try Face Match
        </a>
      </p>
    </div>
  );
}
