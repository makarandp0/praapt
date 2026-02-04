export function FaceCaptureIntro() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="w-36 h-6 bg-neutral-300 mb-2"></div>
      </div>

      {/* Illustration placeholder */}
      <div className="mb-6 flex justify-center">
        <div className="w-32 h-32 bg-neutral-200 border-2 border-neutral-400 flex items-center justify-center">
          <div className="w-16 h-20 bg-neutral-300 rounded-full"></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8 p-4 bg-white border-2 border-neutral-300">
        <div className="w-full h-4 bg-neutral-200 mb-2"></div>
        <div className="w-5/6 h-4 bg-neutral-200 mb-3"></div>
        <div className="text-xs text-neutral-600 mt-3">
          "We will take 4–5 photos from different angles."
        </div>
      </div>

      {/* Start button */}
      <div className="mt-auto w-full h-16 bg-neutral-800 flex items-center justify-center">
        <span className="text-white">Start Capture</span>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Auto-capture or manual?
      </div>
    </div>
  );
}