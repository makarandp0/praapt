export function BasicInfo() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="w-44 h-6 bg-neutral-300 mb-2"></div>
      </div>

      {/* Form fields */}
      <div className="space-y-4 mb-6">
        {/* Optional name */}
        <div>
          <div className="w-32 h-4 bg-neutral-200 mb-2"></div>
          <div className="w-full h-12 bg-white border-2 border-neutral-400"></div>
          <div className="w-20 h-3 bg-neutral-200 mt-1"></div>
        </div>

        {/* Optional age band */}
        <div>
          <div className="w-28 h-4 bg-neutral-200 mb-2"></div>
          <div className="w-full h-12 bg-white border-2 border-neutral-400"></div>
          <div className="w-20 h-3 bg-neutral-200 mt-1"></div>
        </div>

        {/* Optional gender */}
        <div>
          <div className="w-24 h-4 bg-neutral-200 mb-2"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-white border-2 border-neutral-400"></div>
            <div className="flex-1 h-12 bg-white border-2 border-neutral-400"></div>
            <div className="flex-1 h-12 bg-white border-2 border-neutral-400"></div>
          </div>
          <div className="w-20 h-3 bg-neutral-200 mt-1"></div>
        </div>

        {/* REQUIRED location */}
        <div>
          <div className="w-36 h-4 bg-neutral-300 mb-2"></div>
          <div className="w-full h-12 bg-white border-2 border-neutral-700"></div>
          <div className="w-24 h-3 bg-neutral-300 mt-1"></div>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto w-full h-14 bg-neutral-700 flex items-center justify-center">
        <span className="text-white text-sm">Continue</span>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Why collect demographics if optional?
      </div>
    </div>
  );
}