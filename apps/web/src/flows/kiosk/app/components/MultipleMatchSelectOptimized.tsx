import { type Language, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface MatchCandidate {
  customerId: string;
  name: string;
  imagePath: string | null;
  distance: number;
}

interface MultipleMatchSelectOptimizedProps {
  matches: MatchCandidate[];
  onSelect: (match: MatchCandidate) => void;
  onRescan: () => void;
  onReenterDigits: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function MultipleMatchSelectOptimized({
  matches,
  onSelect,
  onRescan,
  onReenterDigits,
  language,
  onLanguageChange,
}: MultipleMatchSelectOptimizedProps) {
  const fontFamily = getFontFamily(language);

  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-8 px-16 py-10 bg-[#F6F1E8] relative"
      style={{ fontFamily }}
    >
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      <div className="text-center">
        <h2 className="text-[30px] leading-[38px] font-semibold text-[#1D232E]">
          Select your name
        </h2>
        <p className="text-[18px] leading-[26px] text-[#5A6472] mt-2">
          Multiple matches found for this PIN
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        {matches.map((match) => (
          <button
            key={match.customerId}
            onClick={() => onSelect(match)}
            className="flex items-center justify-between rounded-2xl border-2 border-[#E7E0D6] bg-white px-6 py-5 text-left shadow-sm hover:border-[#243B6B] hover:shadow-md transition"
          >
            <div>
              <div className="text-[22px] leading-[28px] font-semibold text-[#1D232E]">
                {match.name}
              </div>
              <div className="text-[14px] leading-[20px] text-[#5A6472] mt-1">
                distance {match.distance.toFixed(3)}
              </div>
            </div>
            <div className="text-[14px] leading-[20px] text-[#243B6B] font-semibold">
              Select
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReenterDigits}
          className="w-56 h-14 bg-[#E7E0D6] border-2 border-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] transition-colors"
        >
          Re-enter PIN
        </button>
        <button
          onClick={onRescan}
          className="w-56 h-14 bg-[#243B6B] text-[18px] leading-[26px] font-semibold text-[#F6F1E8] rounded-xl hover:bg-[#1e3257] transition-colors"
        >
          Rescan face
        </button>
      </div>
    </div>
  );
}
