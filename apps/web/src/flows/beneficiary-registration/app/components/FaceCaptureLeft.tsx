export function FaceCaptureLeft() {
  return (
    <div className="h-full flex flex-col p-6 bg-neutral-50">
      {/* Instruction */}
      <div className="mb-4 text-center">
        <div className="w-48 h-5 bg-neutral-300 mx-auto mb-1"></div>
        <div className="text-xs text-neutral-600 mt-2">
          "Turn slightly left"
        </div>
      </div>

      {/* Camera view with face frame overlay */}
      <div className="flex-1 bg-neutral-200 border-2 border-neutral-400 relative mb-4 flex items-center justify-center">
        {/* Face frame overlay - slightly angled */}
        <div className="w-28 h-36 border-4 border-neutral-600 rounded-full relative" style={{ transform: 'rotate(-10deg)' }}>
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-neutral-700"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-neutral-700"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-neutral-700"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-neutral-700"></div>
        </div>
      </div>

      {/* Quality indicators */}
      <div className="flex gap-2 text-xs mb-3">
        <div className="flex-1 h-6 bg-white border border-neutral-300 flex items-center justify-center">
          <span className="text-neutral-600">Lighting</span>
        </div>
        <div className="flex-1 h-6 bg-white border border-neutral-300 flex items-center justify-center">
          <span className="text-neutral-600">Face</span>
        </div>
        <div className="flex-1 h-6 bg-white border border-neutral-300 flex items-center justify-center">
          <span className="text-neutral-600">Blur</span>
        </div>
      </div>

      {/* Capture button */}
      <div className="w-full h-14 bg-neutral-800 flex items-center justify-center">
        <div className="w-12 h-12 bg-white rounded-full border-4 border-neutral-300"></div>
      </div>
    </div>
  );
}
