import { useMemo, useState, type ComponentType } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginPhone } from './components/LoginPhone';
import { LoginOTP } from './components/LoginOTP';
import { PinSetup } from './components/PinSetup';
import { VolunteerHome } from './components/VolunteerHome';
import { EligibilityChecklist } from './components/EligibilityChecklist';
import { BasicInfo } from './components/BasicInfo';
import { ConsentExplanation } from './components/ConsentExplanation';
import { BeneficiaryPhone } from './components/BeneficiaryPhone';
import { AadhaarEntry } from './components/AadhaarEntry';
import { AadhaarConfirmation } from './components/AadhaarConfirmation';
import { DuplicateDetected } from './components/DuplicateDetected';
import { FaceCaptureIntro } from './components/FaceCaptureIntro';
import { FaceCaptureFront } from './components/FaceCaptureFront';
import { FaceCaptureLeft } from './components/FaceCaptureLeft';
import { FaceCaptureRight } from './components/FaceCaptureRight';
import { FaceCaptureUp } from './components/FaceCaptureUp';
import { FaceCaptureExtra } from './components/FaceCaptureExtra';
import { FaceCaptureReview } from './components/FaceCaptureReview';
import { FinalReview } from './components/FinalReview';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { PendingUpload } from './components/PendingUpload';

type ScreenDefinition = {
  id: number;
  component: ComponentType;
  name: string;
  group: string;
};

export default function App() {
  const [showGuide, setShowGuide] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const screens = useMemo<ScreenDefinition[]>(
    () => [
      { id: 1, component: SplashScreen, name: 'Splash & Environment Check', group: 'Authentication' },
      { id: 2, component: LoginPhone, name: 'Volunteer Login – Phone Number', group: 'Authentication' },
      { id: 3, component: LoginOTP, name: 'Volunteer Login – OTP Verification', group: 'Authentication' },
      { id: 4, component: PinSetup, name: 'Optional Device PIN Setup', group: 'Authentication' },
      { id: 5, component: VolunteerHome, name: 'Volunteer Home / Dashboard', group: 'Registration Start' },
      { id: 6, component: EligibilityChecklist, name: 'Eligibility Checklist', group: 'Registration Start' },
      { id: 7, component: BasicInfo, name: 'Basic Beneficiary Info', group: 'Registration Start' },
      { id: 8, component: ConsentExplanation, name: 'Consent Explanation', group: 'Registration Start' },
      { id: 9, component: BeneficiaryPhone, name: 'Beneficiary Phone (Last 4)', group: 'Identifiers' },
      { id: 10, component: AadhaarEntry, name: 'Aadhaar Last-4 Entry', group: 'Identifiers' },
      { id: 11, component: AadhaarConfirmation, name: 'Aadhaar Last-4 Confirmation', group: 'Identifiers' },
      { id: 12, component: DuplicateDetected, name: 'Duplicate Check (Conditional)', group: 'Identifiers' },
      { id: 13, component: FaceCaptureIntro, name: 'Face Capture Intro', group: 'Face Capture' },
      { id: 14, component: FaceCaptureFront, name: 'Face Capture – Front Facing', group: 'Face Capture' },
      { id: 15, component: FaceCaptureLeft, name: 'Face Capture – Slight Left', group: 'Face Capture' },
      { id: 16, component: FaceCaptureRight, name: 'Face Capture – Slight Right', group: 'Face Capture' },
      { id: 17, component: FaceCaptureUp, name: 'Face Capture – Slight Up / Down', group: 'Face Capture' },
      { id: 18, component: FaceCaptureExtra, name: 'Optional Extra Capture', group: 'Face Capture' },
      { id: 19, component: FaceCaptureReview, name: 'Face Capture Review', group: 'Face Capture' },
      { id: 20, component: FinalReview, name: 'Final Review & Submit', group: 'Submission' },
      { id: 21, component: RegistrationSuccess, name: 'Registration Success', group: 'Submission' },
      { id: 22, component: PendingUpload, name: 'Pending Upload / Offline State', group: 'Submission' },
    ],
    [],
  );

  const totalSteps = screens.length;
  const currentScreen = screens[stepIndex];
  const ScreenComponent = currentScreen.component;

  const goToStep = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), totalSteps - 1);
    setStepIndex(nextIndex);
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2">Praapt - Beneficiary Registration Wizard</h1>
          <p className="text-neutral-600">
            Volunteer-facing registration flow in a step-by-step wizard (tablet landscape).
          </p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="px-4 py-2 bg-neutral-800 text-white"
        >
          {showGuide ? 'Hide' : 'Show'} Flow Guide
        </button>
      </div>

      {showGuide && (
        <div className="mb-8 p-6 bg-white border-2 border-neutral-300">
          <h2 className="mb-4">Flow Overview</h2>
          <ul className="space-y-2 text-neutral-700">
            <li>• Screens 1-4: Volunteer authentication and setup</li>
            <li>• Screens 5-8: Registration initiation and eligibility</li>
            <li>• Screens 9-12: Beneficiary identifiers (phone + Aadhaar) and duplicate check</li>
            <li>• Screens 13-19: Multi-angle face capture and review</li>
            <li>• Screens 20-22: Final review, submission, success, and offline states</li>
          </ul>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-sm">
            <strong>Key Change:</strong> Duplicate detection now happens at Screen 12 (after phone + Aadhaar entry),
            before face capture begins.
          </div>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border-4 border-neutral-800 bg-white" style={{ width: '384px', height: '288px' }}>
            <ScreenComponent />
          </div>

          <div className="rounded-lg border border-neutral-300 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>
                Step {currentScreen.id} of {totalSteps}
              </span>
              <span className="font-medium text-neutral-800">{currentScreen.group}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-neutral-200">
              <div
                className="h-2 rounded-full bg-neutral-800 transition-all"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-800">{currentScreen.name}</h3>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => goToStep(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="px-4 py-2 border border-neutral-400 text-neutral-700 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => goToStep(stepIndex + 1)}
                disabled={stepIndex === totalSteps - 1}
                className="px-4 py-2 bg-neutral-800 text-white disabled:opacity-40"
              >
                Next
              </button>
              <button
                onClick={() => goToStep(0)}
                className="ml-auto text-sm text-neutral-500 hover:text-neutral-800"
              >
                Restart
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-300 bg-white p-6">
          <h3 className="mb-4">Wizard Steps</h3>
          <div className="grid gap-2">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => goToStep(index)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                  index === stepIndex
                    ? 'border-neutral-800 bg-neutral-100 text-neutral-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <span>
                  {screen.id}. {screen.name}
                </span>
                <span className="text-xs uppercase tracking-wide text-neutral-400">{screen.group}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
