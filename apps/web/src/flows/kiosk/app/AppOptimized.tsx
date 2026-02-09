import { useEffect, useState } from 'react';
import { Contracts } from '@praapt/shared';
import { type Language } from './utils/translations';
import { KioskBootOptimized } from './components/KioskBootOptimized';
import { IdleWelcomeOptimized } from './components/IdleWelcomeOptimized';
import { EnterAadhaarOptimized } from './components/EnterAadhaarOptimized';
import { NoRecordFound } from './components/NoRecordFound';
import { FaceScanActiveOptimized } from './components/FaceScanActiveOptimized';
import { MatchingInProgress } from './components/MatchingInProgress';
import { MultipleMatchSelectOptimized } from './components/MultipleMatchSelectOptimized';
import { PinWelcomeOptimized } from './components/PinWelcomeOptimized';
import { VerificationToastOptimized } from './components/VerificationToastOptimized';
import { VerificationFailed } from './components/VerificationFailed';
import { AskForHelp } from './components/AskForHelp';
import { VendorPIN } from './components/VendorPIN';
import { VendorAssist } from './components/VendorAssist';
import { FoodSelectionOptimized } from './components/FoodSelectionOptimized';
import { RedemptionSuccessOptimized } from './components/RedemptionSuccessOptimized';
import { getTranslation } from './utils/translations';
import { callContract } from '../../../lib/contractClient';
import { useAuth } from '../../../contexts/AuthContext';

export type ScreenOptimized = 
  | 'boot'
  | 'idle'
  | 'enter-aadhaar'
  | 'pin-lookup'
  | 'pin-welcome'
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
  const { getIdToken } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenOptimized>('boot');
  const [aadhaarDigits, setAadhaarDigits] = useState('');
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
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


  useEffect(() => {
    let isMounted = true;

    async function runPinLookup() {
      if (currentScreen !== 'pin-lookup' || aadhaarDigits.length !== 4) {
        return;
      }

      let response;
      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        response = await callContract(apiBase, Contracts.kioskPinLookup, {
          token,
          body: { pin: aadhaarDigits },
        });
      } catch (err) {
        console.error('Kiosk pin lookup failed:', err);
        if (!isMounted) {
          return;
        }
        navigateTo('no-record');
        return;
      }

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        navigateTo('no-record');
        return;
      }

      navigateTo('pin-welcome');
    }

    runPinLookup();

    return () => {
      isMounted = false;
    };
  }, [aadhaarDigits, apiBase, currentScreen, getIdToken]);

  useEffect(() => {
    let isMounted = true;

    async function runMatch() {
      if (currentScreen !== 'matching' || !capturedFace || aadhaarDigits.length !== 4) {
        return;
      }

      let response;
      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        response = await callContract(apiBase, Contracts.kioskFaceMatch, {
          token,
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
  }, [aadhaarDigits, apiBase, capturedFace, currentScreen, getIdToken]);

  return (
    <div className="min-h-screen bg-[#5A6472] flex flex-col">
      {/* Main kiosk screen */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-[4/3] bg-[#F6F1E8] shadow-2xl relative overflow-hidden">
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
                navigateTo('pin-lookup');
              }}
              onHelp={() => navigateTo('ask-help')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {currentScreen === 'pin-lookup' && (
            <MatchingInProgress onComplete={() => {}} />
          )}

          {currentScreen === 'pin-welcome' && (
            <PinWelcomeOptimized
              onContinue={() => navigateTo('face-scan')}
              language={language}
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

    </div>
  );
}
