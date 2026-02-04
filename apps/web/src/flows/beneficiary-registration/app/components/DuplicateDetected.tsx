export function DuplicateDetected() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Warning icon placeholder */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-neutral-400 flex items-center justify-center">
          <span className="text-2xl text-white">!</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-48 h-6 bg-neutral-300 mx-auto mb-3"></div>
        <div className="p-3 bg-white border-2 border-neutral-300">
          <div className="text-xs text-neutral-600 mb-2">
            "This person may already be registered."
          </div>
          <div className="w-full h-3 bg-neutral-200 mb-1"></div>
          <div className="w-5/6 h-3 bg-neutral-200 mx-auto"></div>
        </div>
      </div>

      {/* Similar match placeholder */}
      <div className="mb-6 p-3 bg-white border border-neutral-300">
        <div className="w-40 h-3 bg-neutral-200 mb-2"></div>
        <div className="text-xs text-neutral-600 mb-2">Match found: Phone + Aadhaar</div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1">
            {[5, 6, 7, 8].map((num, i) => (
              <div key={i} className="w-6 h-8 bg-neutral-400 text-white flex items-center justify-center text-xs">
                {num}
              </div>
            ))}
            <div className="mx-1">+</div>
            {[1, 2, 3, 4].map((num, i) => (
              <div key={i} className="w-6 h-8 bg-neutral-400 text-white flex items-center justify-center text-xs">
                {num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="w-full h-12 bg-neutral-700 flex items-center justify-center">
          <span className="text-white text-sm">View Existing Record</span>
        </div>
        <div className="w-full h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Re-enter Details</span>
        </div>
        <div className="w-full h-10 bg-white border border-neutral-300 flex items-center justify-center">
          <span className="text-xs text-neutral-500">Cancel Registration</span>
        </div>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Admin override flow?
      </div>
    </div>
  );
}