import { type Language, getTranslation, getFontFamily } from '../utils/translations';

interface PinWelcomeOptimizedProps {
  onContinue: () => void;
  language: Language;
}

export function PinWelcomeOptimized({
  onContinue,
  language,
}: PinWelcomeOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);

  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#F6F1E8]"
      style={{ fontFamily }}
    >
      <div className="text-center">
        <p className="text-[32px] leading-[40px] font-semibold text-[#1D232E] mb-2">
          {t.welcome}!
        </p>
        <p className="text-[20px] leading-[28px] text-[#5A6472]">
          {t.lookAtCamera}
        </p>
        <p className="text-[18px] leading-[26px] text-[#5A6472] mt-1">
          {t.stayStill}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-60 h-16 bg-[#243B6B] text-[22px] leading-[28px] font-semibold text-[#F6F1E8] rounded-xl hover:bg-[#1e3257] transition-colors"
      >
        {t.continue}
      </button>
    </div>
  );
}
