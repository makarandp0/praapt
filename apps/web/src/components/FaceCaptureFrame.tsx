import { CameraPreview, CameraPreviewRef } from './CameraPreview';

interface FaceCaptureFrameProps {
  cameraRef: React.RefObject<CameraPreviewRef>;
  stream: MediaStream | null;
  isActive?: boolean;
  frameClassName?: string;
  overlayClassName?: string;
  placeholderClassName?: string;
  showOvalGuide?: boolean;
}

const DEFAULT_FRAME_CLASS =
  'relative w-[480px] h-[480px] bg-[#E7E0D6] rounded-2xl overflow-hidden flex items-center justify-center';
const DEFAULT_OVAL_CLASS = 'w-[340px] h-[420px] border-4 border-[#243B6B] border-dashed rounded-full opacity-60';
const DEFAULT_PLACEHOLDER_CLASS = DEFAULT_OVAL_CLASS;

export function FaceCaptureFrame({
  cameraRef,
  stream,
  isActive = false,
  frameClassName = DEFAULT_FRAME_CLASS,
  overlayClassName = DEFAULT_OVAL_CLASS,
  placeholderClassName = DEFAULT_PLACEHOLDER_CLASS,
  showOvalGuide = true,
}: FaceCaptureFrameProps) {
  return (
    <div className={frameClassName}>
      {cameraOpen && stream ? (
        <div className="w-full h-full">
          <CameraPreview ref={cameraRef} stream={stream} isActive={isActive} />
        </div>
      ) : (
        <div className={placeholderClassName}></div>
      )}

      {showOvalGuide && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={overlayClassName}></div>
        </div>
      )}
    </div>
  );
}
