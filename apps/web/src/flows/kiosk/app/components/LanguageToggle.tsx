import { useState } from 'react';
import { type Language, type LanguageConfig, LANGUAGES } from '../utils/translations';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLangConfig =
    LANGUAGES.find((lang: LanguageConfig) => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-[#243B6B] text-[#F6F1E8] text-[16px] leading-[22px] font-semibold rounded-lg hover:bg-[#1e3257] transition-colors flex items-center gap-2"
        style={{ fontFamily: currentLangConfig.fontFamily }}
      >
        {currentLangConfig.nativeName}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-[#F6F1E8] border-2 border-[#243B6B] rounded-lg shadow-lg z-50 overflow-hidden min-w-[180px]">
            {LANGUAGES.map((lang: LanguageConfig) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-[16px] leading-[22px] font-semibold transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-[#243B6B] text-[#F6F1E8]'
                    : 'bg-[#F6F1E8] text-[#1D232E] hover:bg-[#E7E0D6]'
                }`}
                style={{ fontFamily: lang.fontFamily }}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
