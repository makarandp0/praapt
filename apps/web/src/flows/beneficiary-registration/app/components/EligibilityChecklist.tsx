export function EligibilityChecklist() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-6">
        <div className="w-48 h-6 bg-neutral-300 mb-2"></div>
        <div className="w-56 h-4 bg-neutral-200"></div>
      </div>

      {/* Checklist */}
      <div className="space-y-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-white border-2 border-neutral-400 flex-shrink-0 mt-1"></div>
            <div className="flex-1">
              <div className="w-full h-4 bg-neutral-200 mb-1"></div>
              <div className="w-3/4 h-4 bg-neutral-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue button - disabled state */}
      <div className="mt-auto w-full h-14 bg-neutral-300 flex items-center justify-center">
        <span className="text-neutral-500 text-sm">Continue (disabled until checked)</span>
      </div>
    </div>
  );
}