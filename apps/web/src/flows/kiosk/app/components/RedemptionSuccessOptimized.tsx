import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface RedemptionSuccessOptimizedProps {
  foodName: string;
  onComplete: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function RedemptionSuccessOptimized({ 
  foodName, 
  onComplete,
  language,
  onLanguageChange
}: RedemptionSuccessOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  
  // Generate a random meal token number
  const tokenNumber = `A${Math.floor(100 + Math.random() * 900)}`;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Calm success indicator - no oversized celebration */}
      <div className="w-28 h-28 bg-[#1F7A77] rounded-full flex items-center justify-center">
        <svg 
          className="w-16 h-16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#F6F1E8" 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Simple confirmation message */}
      <div className="text-center max-w-2xl">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-3">
          {t.mealConfirmed}
        </p>
        <p className="text-[24px] leading-[32px] text-[#5A6472]">
          {foodName}
        </p>
      </div>

      {/* Meal token display - key information */}
      <div className="text-center p-8 bg-[#E7E0D6] rounded-xl border-2 border-[#243B6B]">
        <p className="text-[18px] leading-[26px] text-[#5A6472] mb-2">
          {t.tokenNumber}
        </p>
        <p className="text-[72px] leading-[80px] font-semibold text-[#243B6B] tabular-nums">
          #{tokenNumber}
        </p>
      </div>

      {/* Collection instruction - clear and directive */}
      <div className="text-center">
        <p className="text-[22px] leading-[30px] text-[#1D232E] font-semibold">
          {t.waitForToken}
        </p>
        <p className="text-[18px] leading-[26px] text-[#5A6472] mt-2">
          {t.collectFromCounter}
        </p>
      </div>

      {/* Single action button - Done */}
      <button
        onClick={onComplete}
        className="w-64 h-16 bg-[#243B6B] text-[#F6F1E8] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#1e3257] active:bg-[#182841] transition-colors mt-4"
      >
        {t.done}
      </button>
    </div>
  );
}
