import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface VerificationFailedProps {
  retryCount: number;
  onTryAgain: () => void;
  onReenterDigits: () => void;
  onAskHelp: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function VerificationFailed({ 
  retryCount, 
  onTryAgain, 
  onReenterDigits, 
  onAskHelp,
  language,
  onLanguageChange
}: VerificationFailedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  const maxRetries = 3;
  const canRetry = retryCount < maxRetries;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Neutral indicator - not red or alarming */}
      <div className="w-28 h-28 border-4 border-[#B7791F] rounded-full flex items-center justify-center">
        <div className="text-6xl text-[#B7791F]">!</div>
      </div>

      {/* Message - calm, not blaming */}
      <div className="text-center max-w-2xl">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-3">
          {t.faceNotMatched}
        </p>
        <p className="text-[22px] leading-[30px] text-[#5A6472] mb-2">
          {t.lookDirectlyAndTryAgain}
        </p>
        <p className="text-[18px] leading-[26px] text-[#5A6472] tabular-nums">
          {t.attemptOf} {retryCount + 1} / {maxRetries}
        </p>
      </div>

      {/* Action buttons - always offer multiple paths */}
      <div className="flex flex-col gap-3">
        {canRetry && (
          <button
            onClick={onTryAgain}
            className="w-96 h-16 bg-[#243B6B] text-[#F6F1E8] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#1e3257] transition-colors"
          >
            {t.tryAgain}
          </button>
        )}
        <button
          onClick={onReenterDigits}
          className="w-96 h-16 bg-[#E7E0D6] text-[#1D232E] text-[18px] leading-[26px] font-semibold rounded-xl hover:bg-[#ddd5ca] transition-colors"
        >
          {t.reenterDigits}
        </button>
        <button
          onClick={onAskHelp}
          className="w-96 h-16 bg-[#E7E0D6] text-[#5A6472] text-[18px] leading-[26px] font-semibold rounded-xl hover:bg-[#ddd5ca] transition-colors"
        >
          {t.getHelp}
        </button>
      </div>
    </div>
  );
}
