import { useEffect } from 'react';

interface KioskBootOptimizedProps {
  onComplete: () => void;
}

export function KioskBootOptimized({ onComplete }: KioskBootOptimizedProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 px-16 py-12 bg-[#E7E0D6]">
      {/* App branding - restrained */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-[56px] leading-[64px] font-semibold text-[#243B6B]">
          Praapt
        </span>
        <span className="text-[20px] leading-[28px] text-[#5A6472]">
          Community Kitchen System
        </span>
      </div>

      {/* Loading indicator - calm */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-[#E7E0D6] border-t-[#243B6B] rounded-full animate-spin"></div>
        <p className="text-[18px] leading-[26px] text-[#5A6472]">Starting...</p>
      </div>
    </div>
  );
}
