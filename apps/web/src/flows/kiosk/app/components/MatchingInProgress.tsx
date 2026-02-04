import { useEffect } from 'react';

interface MatchingInProgressProps {
  onComplete: () => void;
}

export function MatchingInProgress({ onComplete }: MatchingInProgressProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 px-16 py-12 bg-[#F6F1E8]">
      {/* Frozen camera placeholder */}
      <div className="w-[480px] h-[480px] bg-[#E7E0D6] rounded-2xl relative flex items-center justify-center">
        {/* Face frame outline */}
        <div className="w-[340px] h-[420px] border-4 border-[#243B6B] rounded-full absolute opacity-30"></div>
        
        {/* Captured face placeholder */}
        <div className="w-[300px] h-[380px] bg-[#ddd5ca] rounded-full"></div>
      </div>

      {/* Loader - calm, not anxious */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-[#E7E0D6] border-t-[#243B6B] rounded-full animate-spin"></div>
        <p className="text-[28px] leading-[36px] text-[#1D232E]">Verifying...</p>
      </div>
    </div>
  );
}
