export function BeneficiaryPhone() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="w-56 h-6 bg-neutral-300 mb-2"></div>
        <div className="w-48 h-4 bg-neutral-200"></div>
      </div>

      {/* Four digit boxes */}
      <div className="mb-4">
        <div className="w-44 h-4 bg-neutral-200 mb-3"></div>
        <div className="flex gap-4 justify-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-20 bg-white border-2 border-neutral-400 flex items-center justify-center">
              <span className="text-2xl text-neutral-300">_</span>
            </div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="mb-6 p-3 bg-white border border-neutral-300">
        <div className="w-full h-3 bg-neutral-200 mb-1"></div>
        <div className="w-5/6 h-3 bg-neutral-200 mb-2"></div>
        <div className="text-xs text-neutral-600 mt-2">
          "Last 4 digits of beneficiary's phone number"
        </div>
      </div>

      {/* Numeric keypad placeholder */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '×', 0, '✓'].map((num, i) => (
          <div key={i} className="h-12 bg-neutral-200 border border-neutral-400 flex items-center justify-center">
            <span className="text-neutral-600">{num}</span>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-auto w-full h-14 bg-neutral-700 flex items-center justify-center">
        <span className="text-white text-sm">Continue</span>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Is this the beneficiary's phone or volunteer's?
      </div>
    </div>
  );
}
