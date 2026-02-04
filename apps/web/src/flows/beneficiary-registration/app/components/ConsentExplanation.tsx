export function ConsentExplanation() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="w-32 h-6 bg-neutral-300 mb-2"></div>
      </div>

      {/* Explanation text */}
      <div className="mb-8 p-4 bg-white border-2 border-neutral-300">
        <div className="space-y-2">
          <div className="w-full h-4 bg-neutral-200"></div>
          <div className="w-full h-4 bg-neutral-200"></div>
          <div className="w-full h-4 bg-neutral-200"></div>
          <div className="w-5/6 h-4 bg-neutral-200"></div>
          <div className="w-full h-4 bg-neutral-200"></div>
          <div className="w-4/5 h-4 bg-neutral-200"></div>
        </div>
        
        <div className="mt-4 p-3 bg-neutral-100 border border-neutral-300 text-xs text-neutral-600">
          "We will take a few photos of your face and record the last 4 digits of your Aadhaar number to confirm it is you when you come for food."
        </div>
      </div>

      {/* Consent checkbox */}
      <div className="mb-6 flex items-start gap-3">
        <div className="w-8 h-8 bg-white border-2 border-neutral-400 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="w-full h-4 bg-neutral-200 mb-1"></div>
          <div className="w-2/3 h-4 bg-neutral-200"></div>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto w-full h-14 bg-neutral-700 flex items-center justify-center">
        <span className="text-white text-sm">Continue</span>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Language support? Audio/visual aids?
      </div>
    </div>
  );
}