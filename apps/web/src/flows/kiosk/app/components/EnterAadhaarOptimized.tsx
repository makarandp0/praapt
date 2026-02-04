import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface EnterAadhaarOptimizedProps {
  digits: string;
  onDigitsChange: (digits: string) => void;
  onContinue: () => void;
  onNoRecord: () => void;
  onHelp: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function EnterAadhaarOptimized({ 
  digits, 
  onDigitsChange, 
  onContinue, 
  onNoRecord, 
  onHelp,
  language,
  onLanguageChange
}: EnterAadhaarOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  const handleNumberClick = (num: string) => {
    if (digits.length < 4) {
      onDigitsChange(digits + num);
    }
  };

  const handleClear = () => {
    onDigitsChange('');
  };

  const handleBackspace = () => {
    onDigitsChange(digits.slice(0, -1));
  };

  const handleContinue = () => {
    if (digits.length === 4) {
      // Simulate validation - for demo purposes
      if (digits === '0000') {
        onNoRecord();
      } else {
        onContinue();
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-16 py-10 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      <div className="flex flex-col items-center gap-7 w-full">
        {/* Title with Aadhaar transliteration */}
        <div className="text-center">
          <h2 className="text-[28px] leading-[36px] font-semibold text-[#1D232E] mb-2">
            {language === 'en' ? 'Enter last 4 digits of' : t.enterLast4Digits.split(t.aadhaarTransliteration || t.aadhaar)[0].trim()}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-[36px] leading-[44px] font-bold text-[#243B6B]" style={{ fontFamily: 'Inter' }}>
              {t.aadhaar}
            </span>
            {t.aadhaarTransliteration && (
              <span className="text-[36px] leading-[44px] font-bold text-[#243B6B]" style={{ fontFamily }}>
                {t.aadhaarTransliteration}
              </span>
            )}
          </div>
        </div>

        {/* Four digit boxes */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="w-20 h-28 bg-white border-2 border-[#E7E0D6] rounded-xl flex items-center justify-center text-[40px] leading-[48px] font-semibold text-[#1D232E] tabular-nums"
            >
              {digits[index] || ''}
            </div>
          ))}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 w-[420px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-16 bg-[#E7E0D6] text-[28px] leading-[36px] font-semibold text-[#1D232E] rounded-xl hover:bg-[#ddd5ca] active:bg-[#d4cbbf] transition-colors tabular-nums"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-16 bg-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] active:bg-[#d4cbbf] transition-colors"
          >
            {t.delete}
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-[#E7E0D6] text-[28px] leading-[36px] font-semibold text-[#1D232E] rounded-xl hover:bg-[#ddd5ca] active:bg-[#d4cbbf] transition-colors tabular-nums"
          >
            0
          </button>
          <button
            onClick={handleClear}
            className="h-16 bg-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] active:bg-[#d4cbbf] transition-colors"
          >
            {t.clear}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onHelp}
            className="w-52 h-16 bg-[#E7E0D6] border-2 border-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] transition-colors"
          >
            {t.needHelp}
          </button>
          <button
            onClick={handleContinue}
            disabled={digits.length !== 4}
            className={`w-52 h-16 text-[22px] leading-[28px] font-semibold rounded-xl transition-colors ${
              digits.length === 4
                ? 'bg-[#243B6B] text-[#F6F1E8] hover:bg-[#1e3257] active:bg-[#182841]'
                : 'bg-[#E7E0D6] text-[#5A6472] opacity-50 cursor-not-allowed'
            }`}
          >
            {t.continue}
          </button>
        </div>

        {/* Beneficiary note at bottom - properly spaced within page bounds */}
        <div className="mt-4">
          <p className="text-[16px] leading-[22px] text-[#5A6472] text-center">
            {t.registeredBeneficiaries}
          </p>
        </div>
      </div>
    </div>
  );
}
