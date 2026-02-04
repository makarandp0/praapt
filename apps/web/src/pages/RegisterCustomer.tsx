import { useMemo, useState } from 'react';

type WizardStepId =
  | 'name'
  | 'aadhaar'
  | 'aadhaarConfirm'
  | 'primaryCapture'
  | 'extraCaptures'
  | 'verification';

type WizardStep = {
  id: WizardStepId;
  title: string;
  description: string;
};

const EXTRA_CAPTURE_COUNT = 3;

export function RegisterCustomer() {
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
        id: 'primaryCapture',
        title: 'Primary Face Capture',
        description: 'Capture a clear, front-facing photo for the profile.',
      },
      {
        id: 'extraCaptures',
        title: 'Extra Face Captures',
        description: 'Capture three additional angles for better matching.',
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
  const [primaryCaptured, setPrimaryCaptured] = useState(false);
  const [extraCaptured, setExtraCaptured] = useState<boolean[]>(
    () => Array.from({ length: EXTRA_CAPTURE_COUNT }, () => false),
  );
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(
    null,
  );

  const normalizedAadhaar = (value: string) => value.replace(/\D/g, '').slice(0, 4);
  const allExtraCaptured = extraCaptured.every(Boolean);

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const canContinue =
    (currentStep.id === 'name' && name.trim().length > 0) ||
    (currentStep.id === 'aadhaar' && aadhaarLast4.length === 4) ||
    (currentStep.id === 'aadhaarConfirm' &&
      aadhaarConfirm.length === 4 &&
      aadhaarConfirm === aadhaarLast4) ||
    (currentStep.id === 'primaryCapture' && primaryCaptured) ||
    (currentStep.id === 'extraCaptures' && allExtraCaptured) ||
    currentStep.id === 'verification';

  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">Customer Registration</h1>
          <p className="text-neutral-600">
            A streamlined wizard for capturing identity and face images.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl rounded-xl border-4 border-neutral-800 bg-white shadow-sm">
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

                {currentStep.id === 'primaryCapture' && (
                  <div className="space-y-4">
                    <div className="h-40 w-full rounded-lg border border-dashed border-neutral-300 bg-white" />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white"
                        onClick={() => setPrimaryCaptured(true)}
                      >
                        {primaryCaptured ? 'Captured' : 'Capture Face'}
                      </button>
                      {primaryCaptured && (
                        <button
                          type="button"
                          className="text-sm text-neutral-600 underline"
                          onClick={() => setPrimaryCaptured(false)}
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {currentStep.id === 'extraCaptures' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {extraCaptured.map((captured, index) => (
                        <div key={index} className="space-y-2">
                          <div className="h-20 rounded-md border border-neutral-300 bg-white" />
                          <div className="text-xs text-neutral-500">Capture {index + 1}</div>
                          <button
                            type="button"
                            className="text-xs text-neutral-600 underline"
                            onClick={() =>
                              setExtraCaptured((prev) =>
                                prev.map((value, idx) => (idx === index ? !value : value)),
                              )
                            }
                          >
                            {captured ? 'Retake' : 'Mark Captured'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.id === 'verification' && (
                  <div className="space-y-4">
                    <div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                      <div className="flex items-center justify-between">
                        <span>Primary image</span>
                        <span className="font-medium">
                          {primaryCaptured ? 'Captured' : 'Missing'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Extra captures</span>
                        <span className="font-medium">
                          {extraCaptured.filter(Boolean).length}/{EXTRA_CAPTURE_COUNT}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Aadhaar last 4</span>
                        <span className="font-medium">{aadhaarLast4 || 'Missing'}</span>
                      </div>
                    </div>

                    {verificationResult && (
                      <div
                        className={`rounded-md border p-3 text-sm ${
                          verificationResult === 'success'
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-red-300 bg-red-50 text-red-700'
                        }`}
                      >
                        {verificationResult === 'success'
                          ? 'Verification successful!'
                          : 'Verification failed. Please retake the captures.'}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white"
                        onClick={() => setVerificationResult('success')}
                      >
                        Run Verification
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
                        onClick={() => setVerificationResult('failed')}
                      >
                        Simulate Failure
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
                  onClick={goNext}
                  disabled={!canContinue || stepIndex === steps.length - 1}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
