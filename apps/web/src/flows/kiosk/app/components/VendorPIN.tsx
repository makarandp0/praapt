import { useState } from 'react';
import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface VendorPINProps {
  onSuccess: () => void;
  onCancel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function VendorPIN({ 
  onSuccess, 
  onCancel,
  language,
  onLanguageChange
}: VendorPINProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleConfirm = () => {
    if (pin.length === 4) {
      // Simulate PIN check - for demo, accept "1234"
      if (pin === '1234') {
        onSuccess();
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#E7E0D6] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Title */}
      <h2 className="text-[32px] leading-[40px] font-semibold text-[#1D232E]">
        {t.vendorPIN}
      </h2>

      {/* PIN display - dots for privacy */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="w-16 h-20 bg-white border-2 border-[#5A6472] rounded-lg flex items-center justify-center text-4xl text-[#1D232E]"
          >
            {pin[index] ? '●' : ''}
          </div>
        ))}
      </div>

      {/* Error message - neutral tone */}
      {error && (
        <p className="text-[18px] leading-[26px] text-[#B7791F]">
          {t.pinNotRecognized}
        </p>
      )}

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-3 w-[360px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className={`h-14 bg-[#F6F1E8] text-[24px] leading-[32px] font-semibold text-[#1D232E] rounded-lg hover:bg-[#ede7db] active:bg-[#e4ddcf] transition-colors tabular-nums ${num === '0' ? 'col-start-2' : ''}`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="w-32 h-14 bg-[#F6F1E8] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-lg hover:bg-[#ede7db] transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleClear}
          className="w-32 h-14 bg-[#F6F1E8] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-lg hover:bg-[#ede7db] transition-colors"
        >
          {t.clear}
        </button>
        <button
          onClick={handleConfirm}
          disabled={pin.length !== 4}
          className={`w-32 h-14 text-[18px] leading-[26px] font-semibold rounded-lg transition-colors ${
            pin.length === 4
              ? 'bg-[#243B6B] text-[#F6F1E8] hover:bg-[#1e3257]'
              : 'bg-[#F6F1E8] text-[#5A6472] opacity-50 cursor-not-allowed'
          }`}
        >
          {t.confirm}
        </button>
      </div>
    </div>
  );
}
