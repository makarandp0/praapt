import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface AskForHelpProps {
  onVendorAssist: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function AskForHelp({ 
  onVendorAssist,
  language,
  onLanguageChange
}: AskForHelpProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Help icon - calm and approachable */}
      <div className="w-32 h-32 border-4 border-[#243B6B] rounded-full flex items-center justify-center">
        <div className="text-7xl text-[#243B6B]">i</div>
      </div>

      {/* Message - clear directive, not apologetic */}
      <div className="text-center max-w-2xl">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-3">
          {t.askVendorForHelp}
        </p>
        <p className="text-[22px] leading-[30px] text-[#5A6472]">
          {t.theyCanAssist}
        </p>
      </div>

      {/* Vendor assist button */}
      <button
        onClick={onVendorAssist}
        className="w-80 h-16 bg-[#243B6B] text-[#F6F1E8] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#1e3257] transition-colors"
      >
        {t.vendorAssist}
      </button>
    </div>
  );
}
