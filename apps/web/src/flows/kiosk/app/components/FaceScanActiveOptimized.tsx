import { useEffect, useState } from 'react';
import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface FaceScanActiveOptimizedProps {
  onCapture: () => void;
  onCancel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function FaceScanActiveOptimized({ 
  onCapture, 
  onCancel,
  language,
  onLanguageChange
}: FaceScanActiveOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-capture after countdown
      const captureTimer = setTimeout(() => {
        onCapture();
      }, 500);
      return () => clearTimeout(captureTimer);
    }
  }, [countdown, onCapture]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Title */}
      <h2 className="text-[32px] leading-[40px] font-semibold text-[#1D232E]">
        {t.lookAtCamera}
      </h2>

      {/* Camera frame simulation */}
      <div className="relative w-[480px] h-[480px] bg-[#E7E0D6] rounded-2xl overflow-hidden flex items-center justify-center">
        {/* Oval guide */}
        <div className="w-[340px] h-[420px] border-4 border-[#243B6B] border-dashed rounded-full opacity-60"></div>
        
        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-[#1D232E] bg-opacity-40 flex items-center justify-center">
            <span className="text-[120px] font-semibold text-[#F6F1E8] tabular-nums">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-[22px] leading-[30px] text-[#5A6472] text-center max-w-lg">
        {t.stayStill}
      </p>

      {/* Cancel option */}
      <button
        onClick={onCancel}
        className="w-52 h-14 bg-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] transition-colors"
      >
        {t.cancel}
      </button>
    </div>
  );
}
