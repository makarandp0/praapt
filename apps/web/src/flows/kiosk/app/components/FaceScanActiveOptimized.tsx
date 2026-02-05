import { useEffect, useState } from 'react';
import { FaceCaptureFrame } from '../../../../components/FaceCaptureFrame';
import { useCamera } from '../../../../hooks/useCamera';
import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface FaceScanActiveOptimizedProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function FaceScanActiveOptimized({ 
  onCapture, 
  onCancel,
  language,
  onLanguageChange
}: FaceScanActiveOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  const [countdown, setCountdown] = useState(3);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { cameraRef, streamRef, cameraOpen, openCamera, closeCamera, captureFrame } = useCamera();

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      const result = await openCamera();
      if (!mounted) return;
      if (!result.success) {
        setCameraError(result.error);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      closeCamera();
    };
  }, [closeCamera, openCamera]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-capture after countdown
      const captureTimer = setTimeout(() => {
        const dataUrl = captureFrame();
        if (dataUrl) {
          onCapture(dataUrl);
        } else {
          setCameraError('Unable to capture photo. Please try again.');
          setCountdown(3);
        }
      }, 500);
      return () => clearTimeout(captureTimer);
    }
  }, [captureFrame, countdown, onCapture]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Title */}
      <h2 className="text-[32px] leading-[40px] font-semibold text-[#1D232E]">
        {t.lookAtCamera}
      </h2>

      {/* Camera frame */}
      <div className="relative">
        <FaceCaptureFrame
          cameraRef={cameraRef}
          stream={streamRef.current}
          cameraOpen={cameraOpen}
          isActive={false}
        />

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-[#1D232E] bg-opacity-40 flex items-center justify-center">
            <span className="text-[120px] font-semibold text-[#F6F1E8] tabular-nums">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-[22px] leading-[30px] text-[#5A6472] text-center max-w-lg">
        {t.stayStill}
      </p>

      {cameraError && (
        <p className="text-[16px] leading-[22px] text-red-700 text-center max-w-lg">
          {cameraError}
        </p>
      )}

      {/* Cancel option */}
      <button
        onClick={onCancel}
        className="w-52 h-14 bg-[#E7E0D6] text-[18px] leading-[26px] font-semibold text-[#5A6472] rounded-xl hover:bg-[#ddd5ca] transition-colors"
      >
        {t.cancel}
      </button>
    </div>
  );
}
