import { type Language } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface VendorAssistProps {
  onRetryFaceScan: () => void;
  onCheckAadhaar: () => void;
  onReportIssue: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function VendorAssist({ 
  onRetryFaceScan, 
  onCheckAadhaar, 
  onReportIssue,
  language,
  onLanguageChange
}: VendorAssistProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#E7E0D6] relative">
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Title */}
      <h2 className="text-[32px] leading-[40px] font-semibold text-[#1D232E]">
        Vendor Assist
      </h2>

      {/* Info */}
      <p className="text-[22px] leading-[30px] text-[#5A6472] text-center max-w-2xl">
        Select how to assist
      </p>

      {/* Assist options */}
      <div className="flex flex-col gap-4 w-[500px]">
        <button
          onClick={onRetryFaceScan}
          className="h-20 bg-[#F6F1E8] border-2 border-[#243B6B] text-[22px] leading-[28px] font-semibold text-[#1D232E] hover:bg-[#ede7db] text-left px-8 rounded-xl transition-colors"
        >
          Retry face scan
        </button>
        <button
          onClick={onCheckAadhaar}
          className="h-20 bg-[#F6F1E8] border-2 border-[#243B6B] text-[22px] leading-[28px] font-semibold text-[#1D232E] hover:bg-[#ede7db] text-left px-8 rounded-xl transition-colors"
        >
          Check Aadhaar digits
        </button>
        <button
          onClick={onReportIssue}
          className="h-20 bg-[#F6F1E8] border-2 border-[#243B6B] text-[22px] leading-[28px] font-semibold text-[#1D232E] hover:bg-[#ede7db] text-left px-8 rounded-xl transition-colors"
        >
          Report issue
        </button>
      </div>
    </div>
  );
}
