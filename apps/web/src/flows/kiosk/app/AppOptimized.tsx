import { useEffect, useMemo, useState } from 'react';
import { Contracts, type KioskFaceMatchResponse } from '@praapt/shared';
import { type Language } from './utils/translations';
import { KioskBootOptimized } from './components/KioskBootOptimized';
import { IdleWelcomeOptimized } from './components/IdleWelcomeOptimized';
import { EnterAadhaarOptimized } from './components/EnterAadhaarOptimized';
import { NoRecordFound } from './components/NoRecordFound';
import { FaceScanActiveOptimized } from './components/FaceScanActiveOptimized';
import { MatchingInProgress } from './components/MatchingInProgress';
import { MultipleMatchSelectOptimized } from './components/MultipleMatchSelectOptimized';
import { VerificationToastOptimized } from './components/VerificationToastOptimized';
import { VerificationFailed } from './components/VerificationFailed';
import { AskForHelp } from './components/AskForHelp';
import { VendorPIN } from './components/VendorPIN';
import { VendorAssist } from './components/VendorAssist';
import { FoodSelectionOptimized } from './components/FoodSelectionOptimized';
import { RedemptionSuccessOptimized } from './components/RedemptionSuccessOptimized';
import { FlowNavigation } from './components/FlowNavigation';
import { getTranslation } from './utils/translations';
import { callContract } from '../../../lib/contractClient';

export type ScreenOptimized = 
  | 'boot'
  | 'idle'
  | 'enter-aadhaar'
  | 'no-record'
  | 'face-scan'
  | 'matching'
  | 'select-match'
  | 'verified-toast'
  | 'verification-failed'
  | 'ask-help'
  | 'vendor-pin'
  | 'vendor-assist'
  | 'food-selection'
  | 'redemption-success';

interface AppOptimizedProps {
  apiBase: string;
}

export default function AppOptimized({ apiBase }: AppOptimizedProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenOptimized>('boot');
  const [aadhaarDigits, setAadhaarDigits] = useState('');
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [matchResponse, setMatchResponse] = useState<KioskFaceMatchResponse | null>(null);
  const [matchCandidates, setMatchCandidates] = useState<
    Array<{ customerId: string; name: string; imagePath: string | null; distance: number }>
  >([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [beneficiaryName, setBeneficiaryName] = useState('Beneficiary');
  const [mealCount] = useState(4);
  const [language, setLanguage] = useState<Language>('en');

  const navigateTo = (screen: ScreenOptimized) => {
    setCurrentScreen(screen);
  };

  const resetFlow = () => {
    setCurrentScreen('idle');
    setAadhaarDigits('');
    setCapturedFace(null);
    setMatchResponse(null);
    setMatchCandidates([]);
    setSelectedFood('');
    setRetryCount(0);
  };

  const getMealName = (id: string) => {
    const t = getTranslation(language);
    const meals: { [key: string]: string } = {
      'rice-dal': t.riceDal,
      'chapati-sabzi': t.chapatiSabzi,
      'khichdi': t.khichdi,
      'pulao': t.pulao,
    };
    return meals[id] || id;
  };

  const navigationScreens = useMemo(
    () => [
      { id: 'boot', label: '1. Boot' },
      { id: 'idle', label: '2. Welcome' },
      { id: 'enter-aadhaar', label: '3. Aadhaar' },
      { id: 'no-record', label: '4. No Record' },
      { id: 'face-scan', label: '5. Face Scan' },
      { id: 'matching', label: '6. Matching' },
      { id: 'select-match', label: '7. Select Match' },
      { id: 'verified-toast', label: '8. Verified' },
      { id: 'verification-failed', label: '9. Failed' },
      { id: 'ask-help', label: '10. Help' },
      { id: 'vendor-pin', label: '11. Vendor PIN' },
      { id: 'vendor-assist', label: '12. Assist' },
      { id: 'food-selection', label: '13. Select' },
      { id: 'redemption-success', label: '14. Success' },
    ],
    [],
  );

  const isOptimizedScreen = (screen: string): screen is ScreenOptimized =>
    navigationScreens.some((item) => item.id === screen);

  const handleNavigate = (screen: string) => {
    if (isOptimizedScreen(screen)) {
      navigateTo(screen);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function runMatch() {
      if (currentScreen !== 'matching' || !capturedFace || aadhaarDigits.length !== 4) {
        return;
      }

      let response;
      try {
        response = await callContract(apiBase, Contracts.kioskFaceMatch, {
          body: { pin: aadhaarDigits, faceImage: capturedFace },
        });
      } catch (err) {
        console.error('Kiosk face match failed:', err);
        navigateTo('verification-failed');
        return;
      }

      if (!isMounted) {
        return;
      }

      setMatchResponse(response);

      if (!response.ok) {
        if (response.candidates) {
          setMatchCandidates(response.candidates);
        } else {
          setMatchCandidates([]);
        }
        if (response.reason === 'no_customers' || response.reason === 'no_faces') {
          navigateTo('no-record');
          return;
        }
        navigateTo('verification-failed');
        return;
      }

      if (response.matches.length === 0) {
        navigateTo('verification-failed');
        return;
      }

      setMatchCandidates(response.matches);

      if (response.matches.length === 1) {
        const bestMatch = response.matches[0];
        setBeneficiaryName(bestMatch.name);
        navigateTo('verified-toast');
        return;
      }

      navigateTo('select-match');
    }

    runMatch();

    return () => {
      isMounted = false;
    };
  }, [aadhaarDigits, apiBase, capturedFace, currentScreen]);

  return (
    <div className="min-h-screen bg-[#5A6472] flex flex-col">
      {/* Main kiosk screen */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-[4/3] bg-[#F6F1E8] shadow-2xl relative overflow-hidden">
          {/* Dev indicator - remove in production */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#1D232E] text-[#F6F1E8] text-sm rounded z-50 opacity-50">
            {currentScreen}
          </div>

          {currentScreen === 'boot' && <KioskBootOptimized onComplete={() => navigateTo('idle')} />}
          
          {currentScreen === 'idle' && (
            <IdleWelcomeOptimized 
              onStart={() => navigateTo('enter-aadhaar')} 
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'enter-aadhaar' && (
            <EnterAadhaarOptimized
              digits={aadhaarDigits}
              onDigitsChange={setAadhaarDigits}
              onContinue={() => {
                navigateTo('face-scan');
              }}
              onHelp={() => navigateTo('ask-help')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'no-record' && (
            <NoRecordFound
              onTryAgain={() => {
                setAadhaarDigits('');
                navigateTo('enter-aadhaar');
              }}
              onAskHelp={() => navigateTo('ask-help')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'face-scan' && (
            <FaceScanActiveOptimized
              onCapture={(dataUrl) => {
                setCapturedFace(dataUrl);
                navigateTo('matching');
              }}
              onCancel={() => navigateTo('idle')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'matching' && (
            <MatchingInProgress onComplete={() => {}} />
          )}

          {currentScreen === 'select-match' && (
            <MultipleMatchSelectOptimized
              matches={matchCandidates}
              onSelect={(match) => {
                setBeneficiaryName(match.name);
                navigateTo('verified-toast');
              }}
              onRescan={() => {
                setCapturedFace(null);
                setMatchCandidates([]);
                navigateTo('face-scan');
              }}
              onReenterDigits={() => {
                setCapturedFace(null);
                setMatchCandidates([]);
                setAadhaarDigits('');
                navigateTo('enter-aadhaar');
              }}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'verified-toast' && (
            <VerificationToastOptimized
              beneficiaryName={beneficiaryName || 'Beneficiary'}
              onComplete={() => navigateTo('food-selection')}
              language={language}
            />
          )}
          
          {currentScreen === 'verification-failed' && (
            <VerificationFailed
              retryCount={retryCount}
              onTryAgain={() => {
                setRetryCount(retryCount + 1);
                navigateTo('face-scan');
              }}
              onReenterDigits={() => {
                setAadhaarDigits('');
                setRetryCount(0);
                navigateTo('enter-aadhaar');
              }}
              onAskHelp={() => navigateTo('ask-help')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'ask-help' && (
            <AskForHelp 
              onVendorAssist={() => navigateTo('vendor-pin')} 
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'vendor-pin' && (
            <VendorPIN
              onSuccess={() => navigateTo('vendor-assist')}
              onCancel={() => navigateTo('idle')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'vendor-assist' && (
            <VendorAssist
              onRetryFaceScan={() => navigateTo('face-scan')}
              onCheckAadhaar={() => navigateTo('enter-aadhaar')}
              onReportIssue={() => navigateTo('idle')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'food-selection' && (
            <FoodSelectionOptimized
              selectedFood={selectedFood}
              onSelectFood={setSelectedFood}
              onConfirm={() => navigateTo('redemption-success')}
              beneficiaryName={beneficiaryName}
              mealCount={mealCount}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          
          {currentScreen === 'redemption-success' && (
            <RedemptionSuccessOptimized
              foodName={getMealName(selectedFood)}
              onComplete={resetFlow}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
        </div>
      </div>

      {/* Developer navigation */}
      <FlowNavigation 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate}
        screens={navigationScreens}
      />

      {/* Debug panel */}
      <div className="px-8 pb-6">
        <div className="mx-auto max-w-6xl rounded-lg border border-neutral-200 bg-white/90 p-4 text-sm text-neutral-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-neutral-900">Kiosk Debug</span>
            <span>PIN: {aadhaarDigits || '—'}</span>
            <span>Screen: {currentScreen}</span>
          </div>
          {matchResponse ? (
            <div className="mt-3 space-y-2">
              <div>
                <span className="font-semibold">Match response:</span>{' '}
                {matchResponse.ok ? 'ok' : 'error'}
                {!matchResponse.ok && matchResponse.reason
                  ? ` (${matchResponse.reason})`
                  : ''}
              </div>
              {matchCandidates.length > 0 ? (
                <div className="grid gap-2">
                  {matchCandidates.map((match) => (
                    <div
                      key={match.customerId}
                      className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 px-3 py-2"
                    >
                      <div className="font-medium text-neutral-900">{match.name}</div>
                      <div className="text-neutral-600">
                        distance {match.distance.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500">No candidates</div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-neutral-500">No match attempt yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
