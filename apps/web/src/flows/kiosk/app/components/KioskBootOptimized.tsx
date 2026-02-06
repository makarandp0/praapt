import { useEffect, useMemo, useRef } from 'react';

import { useModelStatus } from '../../../../contexts/ModelStatusContext';

interface KioskBootOptimizedProps {
  onComplete: () => void;
}

export function KioskBootOptimized({ onComplete }: KioskBootOptimizedProps) {
  const { faceServiceOk, modelsLoaded, isChecking, isLoadingModel, refreshStatus, loadModel } =
    useModelStatus();
  const lastLoadAttemptRef = useRef(0);

  useEffect(() => {
    if (modelsLoaded) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      refreshStatus();
    }, 1500);

    return () => clearInterval(interval);
  }, [modelsLoaded, onComplete, refreshStatus]);

  useEffect(() => {
    if (!faceServiceOk || modelsLoaded || isLoadingModel) {
      return;
    }

    const now = Date.now();
    if (now - lastLoadAttemptRef.current < 3000) {
      return;
    }
    lastLoadAttemptRef.current = now;

    void loadModel('buffalo_l');
  }, [faceServiceOk, isLoadingModel, loadModel, modelsLoaded]);

  const statusLabel = useMemo(() => {
    if (modelsLoaded) return 'Starting...';
    if (isLoadingModel) return 'Loading face model...';
    if (isChecking) return 'Checking face service...';
    if (!faceServiceOk) return 'Connecting to face service...';
    return 'Loading face model...';
  }, [faceServiceOk, isChecking, isLoadingModel, modelsLoaded]);

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
        <p className="text-[18px] leading-[26px] text-[#5A6472]">{statusLabel}</p>
      </div>
    </div>
  );
}
