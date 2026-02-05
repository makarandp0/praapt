import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contracts } from '@praapt/shared';

import { FaceCaptureFrame } from '../components/FaceCaptureFrame';
import { useAuth } from '../contexts/AuthContext';
import { useCamera } from '../hooks/useCamera';
import { API_BASE } from '../lib/apiBase';
import { callContract } from '../lib/contractClient';

type WizardStepId =
  | 'name'
  | 'aadhaar'
  | 'aadhaarConfirm'
  | 'faceCapture'
  | 'verification';

type WizardStep = {
  id: WizardStepId;
  title: string;
  description: string;
};

export function RegisterCustomer() {
  const navigate = useNavigate();
  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: 'name',
        title: 'Beneficiary Name',
        description: 'Enter the beneficiary name to begin registration.',
      },
      {
        id: 'aadhaar',
        title: 'Aadhaar Last 4',
        description: 'Capture the last 4 digits on the Aadhaar card.',
      },
      {
        id: 'aadhaarConfirm',
        title: 'Confirm Aadhaar',
        description: 'Re-enter the last 4 digits to confirm accuracy.',
      },
      {
        id: 'faceCapture',
        title: 'Face Capture',
        description: 'Capture one or more clear face photos for matching.',
      },
      {
        id: 'verification',
        title: 'Verification Test',
        description: 'Verify that the captured face matches successfully.',
      },
    ],
    [],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  const [name, setName] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [aadhaarConfirm, setAadhaarConfirm] = useState('');
  const [faceSlots, setFaceSlots] = useState<(string | null)[]>([null]);
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { getIdToken } = useAuth();
  const { cameraRef, streamRef, cameraOpen, openCamera, closeCamera, captureFrame } = useCamera();
  const cameraOpeningRef = useRef(false);

  const normalizedAadhaar = (value: string) => value.replace(/\D/g, '').slice(0, 4);
  const totalCaptured = faceSlots.filter(Boolean).length;

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    const needsCamera = currentStep.id === 'faceCapture';

    if (needsCamera && !cameraOpen && !cameraOpeningRef.current) {
      cameraOpeningRef.current = true;
      openCamera().then((result) => {
        if (!result.success) {
          setCameraError(result.error);
        } else {
          setCameraError(null);
        }
        cameraOpeningRef.current = false;
      });
    }

    if (!needsCamera && cameraOpen) {
      closeCamera();
    }
  }, [cameraOpen, closeCamera, currentStep.id, openCamera]);

  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, [closeCamera]);

  const handleCaptureAtIndex = useCallback(
    (index: number) => {
      const frame = captureFrame();
      if (!frame) {
        setCameraError('Unable to capture image. Please make sure the camera is active.');
        return;
      }
      setFaceSlots((prev) => {
        const next = prev.map((value, idx) => (idx === index ? frame : value));
        if (!next.includes(null)) {
          next.push(null);
        }
        return next;
      });
      setCameraError(null);
    },
    [captureFrame],
  );

  const handleRemoveSlot = useCallback((index: number) => {
    setFaceSlots((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length === 0 || !next.includes(null)) {
        next.push(null);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submissionState === 'submitting') return;

    const captures = faceSlots.filter((capture): capture is string => !!capture);

    if (!name.trim() || aadhaarLast4.length !== 4 || captures.length < 1) {
      setSubmissionState('error');
      setSubmissionError('Please complete all required fields and captures.');
      return;
    }

    setSubmissionState('submitting');
    setSubmissionError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication required to submit registration.');
      }

      const response = await callContract(API_BASE, Contracts.registerCustomer, {
        body: {
          name: name.trim(),
          pin: aadhaarLast4,
          captures,
        },
        token,
      });

      if (!response.ok) {
        throw new Error(response.error);
      }

      setSubmissionState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit registration.';
      setSubmissionState('error');
      setSubmissionError(message);
    }
  }, [aadhaarLast4, faceSlots, getIdToken, name, submissionState]);

  const canContinue =
    (currentStep.id === 'name' && name.trim().length > 0) ||
    (currentStep.id === 'aadhaar' && aadhaarLast4.length === 4) ||
    (currentStep.id === 'aadhaarConfirm' &&
      aadhaarConfirm.length === 4 &&
      aadhaarConfirm === aadhaarLast4) ||
    (currentStep.id === 'faceCapture' && totalCaptured > 0) ||
    currentStep.id === 'verification';

  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">Customer Registration</h1>
          <p className="text-neutral-600">
            A streamlined wizard for capturing identity and face images.
          </p>
        </div>

        <div className="flex justify-start">
          <div className="w-full max-w-5xl rounded-xl border-4 border-neutral-800 bg-white shadow-sm">
            <div className="flex min-h-[640px] flex-col bg-neutral-50 p-10">
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
                  <span>
                    Step {stepIndex + 1} of {steps.length}
                  </span>
                  <span>{currentStep.title}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-neutral-900">{currentStep.title}</h2>
                <p className="text-sm text-neutral-600">{currentStep.description}</p>
                <div className="mt-4 h-2 rounded-full bg-neutral-200">
                  <div
                    className="h-2 rounded-full bg-neutral-800 transition-all"
                    style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {currentStep.id === 'name' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-700 focus:outline-none"
                      placeholder="Enter beneficiary name"
                    />
                  </div>
                )}

                {currentStep.id === 'aadhaar' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700">
                      Aadhaar Last 4 Digits
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={aadhaarLast4}
                      onChange={(event) => setAadhaarLast4(normalizedAadhaar(event.target.value))}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm tracking-widest shadow-sm focus:border-neutral-700 focus:outline-none"
                      placeholder="1234"
                    />
                  </div>
                )}

                {currentStep.id === 'aadhaarConfirm' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700">
                      Confirm Aadhaar Last 4
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={aadhaarConfirm}
                      onChange={(event) => setAadhaarConfirm(normalizedAadhaar(event.target.value))}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm tracking-widest shadow-sm focus:border-neutral-700 focus:outline-none"
                      placeholder="1234"
                    />
                    {aadhaarConfirm.length === 4 && aadhaarConfirm !== aadhaarLast4 && (
                      <p className="text-sm text-red-600">Digits do not match. Please re-check.</p>
                    )}
                  </div>
                )}

                {currentStep.id === 'faceCapture' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-stretch gap-4">
                      <div className="w-[620px] max-w-full">
                        <FaceCaptureFrame
                          cameraRef={cameraRef}
                          stream={streamRef.current}
                          cameraOpen={cameraOpen}
                          isActive
                          frameClassName="relative w-full aspect-[4/3] bg-neutral-200 rounded-2xl overflow-hidden flex items-center justify-center"
                          overlayClassName="w-[260px] h-[340px] border-2 border-neutral-700 border-dashed rounded-full opacity-70"
                          placeholderClassName="w-[260px] h-[340px] border-2 border-neutral-400 border-dashed rounded-full opacity-60"
                          showOvalGuide
                        />
                      </div>
                      <div className="flex w-[260px] min-h-[465px] flex-col items-end gap-3">
                        <div
                          className="grid w-full flex-1 gap-2"
                          style={{
                            gridAutoFlow: 'column',
                            gridAutoColumns: 'minmax(0, 1fr)',
                            gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                          }}
                        >
                          {faceSlots.map((captured, index) => (
                            <div key={index} className="relative h-full">
                              <button
                                type="button"
                                className="group relative h-full w-full overflow-hidden rounded-md border border-neutral-300 bg-white text-left"
                                onClick={() => {
                                  if (!captured) {
                                    handleCaptureAtIndex(index);
                                  }
                                }}
                                aria-label={
                                  captured
                                    ? `Captured face ${index + 1}`
                                    : `Capture face ${index + 1}`
                                }
                              >
                                {captured ? (
                                  <img
                                    src={captured}
                                    alt={`Face capture ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-600">
                                      Slot {index + 1}
                                    </span>
                                    <span>Tap to capture</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 border-2 border-transparent transition-colors group-hover:border-neutral-400" />
                              </button>
                              {captured && (
                                <button
                                  type="button"
                                  className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveSlot(index);
                                  }}
                                  aria-label={`Delete capture ${index + 1}`}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {!cameraOpen && (
                          <button
                            type="button"
                            className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
                            onClick={() => openCamera()}
                          >
                            Open Camera
                          </button>
                        )}
                      </div>
                    </div>
                    {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
                  </div>
                )}

                {currentStep.id === 'verification' && (
                  <div className="space-y-4">
                    <div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                      <div className="flex items-center justify-between">
                        <span>Face captures</span>
                        <span className="font-medium">{totalCaptured}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Aadhaar last 4</span>
                        <span className="font-medium">{aadhaarLast4 || 'Missing'}</span>
                      </div>
                    </div>

                    {submissionState === 'success' && (
                      <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                        Registration submitted successfully.
                      </div>
                    )}
                    {submissionState === 'error' && submissionError && (
                      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        {submissionError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={submissionState === 'submitting' || submissionState === 'success'}
                      >
                        {submissionState === 'submitting' ? 'Submitting...' : 'Submit Registration'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 disabled:opacity-40"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  onClick={() => {
                    if (isLastStep) {
                      navigate('/');
                      return;
                    }
                    goNext();
                  }}
                  disabled={
                    !canContinue ||
                    (isLastStep && submissionState !== 'success')
                  }
                >
                  {isLastStep ? 'Done' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
