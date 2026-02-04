export function PinSetup() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-6">
        <div className="w-48 h-6 bg-neutral-300 mb-2"></div>
        <div className="w-56 h-4 bg-neutral-200 mb-1"></div>
        <div className="w-52 h-4 bg-neutral-200"></div>
      </div>

      {/* PIN input */}
      <div className="mb-4">
        <div className="w-20 h-4 bg-neutral-200 mb-2"></div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-14 h-14 bg-white border-2 border-neutral-400"></div>
          ))}
        </div>
      </div>

      {/* Confirm PIN input */}
      <div className="mb-8">
        <div className="w-28 h-4 bg-neutral-200 mb-2"></div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-14 h-14 bg-white border-2 border-neutral-400"></div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Skip</span>
        </div>
        <div className="flex-1 h-12 bg-neutral-700 flex items-center justify-center">
          <span className="text-white text-sm">Set PIN</span>
        </div>
      </div>
    </div>
  );
}