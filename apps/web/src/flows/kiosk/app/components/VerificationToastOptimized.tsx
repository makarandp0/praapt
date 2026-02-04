import { useEffect } from 'react';
import { type Language, getTranslation, getFontFamily } from '../utils/translations';

interface VerificationToastOptimizedProps {
  beneficiaryName: string;
  onComplete: () => void;
  language: Language;
}

export function VerificationToastOptimized({ 
  beneficiaryName, 
  onComplete,
  language 
}: VerificationToastOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  useEffect(() => {
    // Auto-advance after brief confirmation
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 px-16 py-12 bg-[#F6F1E8]" style={{ fontFamily }}>
      {/* Calm success indicator */}
      <div className="w-32 h-32 bg-[#1F7A77] rounded-full flex items-center justify-center">
        <svg 
          className="w-20 h-20" 
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

      {/* Simple confirmation - no celebration */}
      <div className="text-center">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-2">
          {t.identityVerified}
        </p>
        <p className="text-[22px] leading-[30px] text-[#5A6472]">
          {t.namaste}, {beneficiaryName}
        </p>
      </div>
    </div>
  );
}
