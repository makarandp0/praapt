import { SignupBody, SignupResponse, ErrorResponse } from '@praapt/shared';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface SignupProps {
  apiBase: string;
}

export function Signup({ apiBase }: SignupProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Submission state
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attach stream to video element when camera opens
  useEffect(() => {
    if (cameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        setStatus(`Video play error: ${err instanceof Error ? err.message : 'unknown'}`);
      });
    }
  }, [cameraOpen]);

  /** Open the webcam */
  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setCapturedImage(null);
      setStatus('Camera ready. Position your face and click Capture.');
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

  /** Capture a frame from the video */
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    closeCamera();
    setStatus('Photo captured! Review and submit.');
  }, [closeCamera]);

  /** Submit signup form */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        setStatus('Please enter your name');
        return;
      }
      if (!email.trim()) {
        setStatus('Please enter your email');
        return;
      }
      if (!capturedImage) {
        setStatus('Please capture a photo of your face');
        return;
      }

      setIsSubmitting(true);
      setStatus('Signing up...');

      try {
        const body: SignupBody = {
          name: name.trim(),
          email: email.trim(),
          faceImage: capturedImage,
        };

        const response = await fetch(`${apiBase}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = (await response.json()) as SignupResponse | ErrorResponse;

        if (!response.ok) {
          const errorData = data as ErrorResponse;
          setStatus(`Signup failed: ${errorData.error || 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }

        // Login the user and redirect
        const successData = data as SignupResponse;
        login(successData.user);
        setStatus('Signup successful! Redirecting...');
        setTimeout(() => navigate('/library'), 500);
      } catch (err) {
        setStatus(`Network error: ${err instanceof Error ? err.message : 'unknown'}`);
        setIsSubmitting(false);
      }
    },
    [name, email, capturedImage, apiBase, login, navigate],
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
        setStatus('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        closeCamera();
        setStatus('Image uploaded! Review and submit.');
      };
      reader.onerror = () => {
        setStatus('Failed to read image file');
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
    setStatus('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-center">Sign Up with Face Recognition</h2>

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
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg border border-gray-300"
                autoPlay
                playsInline
                muted
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" onClick={capturePhoto}>
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
            <div className="flex gap-2">
              <Button type="button" onClick={openCamera}>
                Open Camera
              </Button>
              <Button type="button" variant="outline" onClick={triggerFileUpload}>
                Upload Image
              </Button>
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

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Status message */}
        {status && (
          <p
            className={`text-sm ${status.includes('failed') || status.includes('error') ? 'text-red-600' : 'text-gray-600'}`}
          >
            {status}
          </p>
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isSubmitting || !capturedImage}>
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>

      {/* Link to login */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}
