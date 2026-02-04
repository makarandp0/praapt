import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguagePicker } from './LanguagePicker';

interface IdleWelcomeOptimizedProps {
  onStart: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function IdleWelcomeOptimized({ onStart, language, onLanguageChange }: IdleWelcomeOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  return (
    <div className="h-full flex flex-col items-center justify-between px-16 py-8 bg-[#F6F1E8]" style={{ fontFamily }}>
      {/* Top spacer */}
      <div className="h-4"></div>

      {/* Main content - centered */}
      <div className="flex flex-col items-center gap-8">
        {/* Branding - more prominent with transliteration */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-[72px] leading-[80px] font-bold text-[#243B6B] tracking-tight" style={{ fontFamily: 'Inter' }}>
              {t.praapt}
            </h1>
            {t.praaptTransliteration && (
              <h1 className="text-[72px] leading-[80px] font-bold text-[#243B6B] tracking-tight" style={{ fontFamily }}>
                {t.praaptTransliteration}
              </h1>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <p className="text-[28px] leading-[36px] font-semibold text-[#1D232E]" style={{ fontFamily: 'Inter' }}>
              {t.communityKitchen}
            </p>
            {t.communityKitchenTransliteration && (
              <p className="text-[28px] leading-[36px] font-semibold text-[#1D232E]" style={{ fontFamily }}>
                {t.communityKitchenTransliteration}
              </p>
            )}
          </div>
        </div>

        {/* Welcome message */}
        <h2 className="text-[40px] leading-[48px] font-semibold text-[#1D232E]">
          {t.welcome}
        </h2>

        {/* Instruction text */}
        <p className="text-[22px] leading-[30px] text-[#5A6472] text-center max-w-2xl">
          {t.enterAadhaarToBegin}
        </p>

        {/* Large Start button */}
        <button
          onClick={onStart}
          className="w-80 h-16 bg-[#243B6B] text-[#F6F1E8] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#1e3257] active:bg-[#182841] transition-colors"
        >
          {t.start}
        </button>

        {/* Language selector - compact, expands on click */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[16px] leading-[22px] text-[#5A6472]">
            {t.selectLanguage}
          </p>
          <LanguagePicker currentLanguage={language} onLanguageChange={onLanguageChange} />
        </div>
      </div>

      {/* Bottom QR code section - with proper spacing from language buttons */}
      <div className="flex items-center gap-4 mt-8">
        {/* SVG QR code - arbitrary example code */}
        <svg width="64" height="64" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <rect width="21" height="21" fill="#F6F1E8"/>
          {/* Position detection patterns */}
          <rect x="0" y="0" width="7" height="7" fill="#243B6B"/>
          <rect x="1" y="1" width="5" height="5" fill="#F6F1E8"/>
          <rect x="2" y="2" width="3" height="3" fill="#243B6B"/>
          
          <rect x="14" y="0" width="7" height="7" fill="#243B6B"/>
          <rect x="15" y="1" width="5" height="5" fill="#F6F1E8"/>
          <rect x="16" y="2" width="3" height="3" fill="#243B6B"/>
          
          <rect x="0" y="14" width="7" height="7" fill="#243B6B"/>
          <rect x="1" y="15" width="5" height="5" fill="#F6F1E8"/>
          <rect x="2" y="16" width="3" height="3" fill="#243B6B"/>
          
          {/* Timing patterns */}
          <rect x="8" y="0" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="0" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="0" width="1" height="1" fill="#243B6B"/>
          
          <rect x="0" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="0" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="0" y="12" width="1" height="1" fill="#243B6B"/>
          
          {/* Data pattern - example */}
          <rect x="8" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="9" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="8" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="9" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="9" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="9" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="9" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="10" width="1" height="1" fill="#243B6B"/>
          
          <rect x="9" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="11" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="12" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="9" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="13" width="1" height="1" fill="#243B6B"/>
          
          <rect x="14" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="15" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="17" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="19" y="8" width="1" height="1" fill="#243B6B"/>
          <rect x="20" y="8" width="1" height="1" fill="#243B6B"/>
          
          <rect x="14" y="9" width="1" height="1" fill="#243B6B"/>
          <rect x="16" y="9" width="1" height="1" fill="#243B6B"/>
          <rect x="18" y="9" width="1" height="1" fill="#243B6B"/>
          <rect x="20" y="9" width="1" height="1" fill="#243B6B"/>
          
          <rect x="14" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="15" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="17" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="18" y="10" width="1" height="1" fill="#243B6B"/>
          <rect x="20" y="10" width="1" height="1" fill="#243B6B"/>
          
          <rect x="15" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="16" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="18" y="11" width="1" height="1" fill="#243B6B"/>
          <rect x="19" y="11" width="1" height="1" fill="#243B6B"/>
          
          <rect x="14" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="16" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="17" y="12" width="1" height="1" fill="#243B6B"/>
          <rect x="19" y="12" width="1" height="1" fill="#243B6B"/>
          
          <rect x="14" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="15" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="17" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="18" y="13" width="1" height="1" fill="#243B6B"/>
          <rect x="20" y="13" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="14" width="1" height="1" fill="#243B6B"/>
          <rect x="9" y="14" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="14" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="15" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="15" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="15" width="1" height="1" fill="#243B6B"/>
          
          <rect x="9" y="16" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="16" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="16" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="17" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="17" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="17" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="17" width="1" height="1" fill="#243B6B"/>
          
          <rect x="9" y="18" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="18" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="18" width="1" height="1" fill="#243B6B"/>
          
          <rect x="8" y="19" width="1" height="1" fill="#243B6B"/>
          <rect x="11" y="19" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="19" width="1" height="1" fill="#243B6B"/>
          
          <rect x="9" y="20" width="1" height="1" fill="#243B6B"/>
          <rect x="10" y="20" width="1" height="1" fill="#243B6B"/>
          <rect x="12" y="20" width="1" height="1" fill="#243B6B"/>
          <rect x="13" y="20" width="1" height="1" fill="#243B6B"/>
        </svg>
        <p className="text-[16px] leading-[22px] text-[#5A6472]" style={{ fontFamily: 'Inter' }}>
          Scan to learn more about Praapt
        </p>
      </div>
    </div>
  );
}
