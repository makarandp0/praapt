import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface NoRecordFoundProps {
  onTryAgain: () => void;
  onAskHelp: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function NoRecordFound({ 
  onTryAgain, 
  onAskHelp,
  language,
  onLanguageChange
}: NoRecordFoundProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Neutral indicator - not punitive */}
      <div className="w-28 h-28 border-4 border-[#5A6472] rounded-full flex items-center justify-center">
        <div className="text-7xl text-[#5A6472]">?</div>
      </div>

      {/* Message - neutral, not blaming */}
      <div className="text-center max-w-2xl">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-3">
          {t.noRecordFound}
        </p>
        <p className="text-[22px] leading-[30px] text-[#5A6472]">
          {t.checkDigitsAndTryAgain}
        </p>
      </div>

      {/* Action buttons - always offer path forward */}
      <div className="flex gap-4">
        <button
          onClick={onTryAgain}
          className="w-52 h-16 bg-[#243B6B] text-[#F6F1E8] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#1e3257] transition-colors"
        >
          {t.tryAgain}
        </button>
        <button
          onClick={onAskHelp}
          className="w-52 h-16 bg-[#E7E0D6] border-2 border-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] transition-colors"
        >
          {t.getHelp}
        </button>
      </div>
    </div>
  );
}
