export function PendingUpload() {
  return (
    <div className="h-full flex flex-col p-6 bg-neutral-50">
      {/* Header */}
      <div className="mb-4">
        <div className="w-48 h-6 bg-neutral-300 mb-2"></div>
        <div className="p-3 bg-white border-2 border-neutral-400">
          <div className="text-xs text-neutral-600 mb-1">
            "Saved offline. Will sync when online."
          </div>
          <div className="w-full h-3 bg-neutral-200"></div>
        </div>
      </div>

      {/* Pending records list */}
      <div className="flex-1 space-y-2 mb-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-white border border-neutral-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 flex-shrink-0">
              <div className="w-full h-full bg-neutral-300 rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="w-32 h-3 bg-neutral-200 mb-1"></div>
              <div className="w-24 h-3 bg-neutral-200"></div>
            </div>
            <div className="w-6 h-6 bg-neutral-400 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-white">↻</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="mb-4 p-2 bg-white border border-neutral-300 flex items-center gap-2">
        <div className="w-4 h-4 bg-neutral-400 rounded-full"></div>
        <div className="w-32 h-3 bg-neutral-200"></div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <div className="w-full h-12 bg-neutral-700 flex items-center justify-center">
          <span className="text-white text-sm">Retry Sync</span>
        </div>
        <div className="w-full h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Back to Home</span>
        </div>
      </div>
    </div>
  );
}
