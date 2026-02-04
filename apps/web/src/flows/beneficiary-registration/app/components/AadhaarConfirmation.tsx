export function AadhaarConfirmation() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-6">
        <div className="w-48 h-6 bg-neutral-300 mb-2"></div>
        <div className="w-56 h-4 bg-neutral-200"></div>
      </div>

      {/* Re-enter four digit boxes */}
      <div className="mb-6">
        <div className="w-32 h-4 bg-neutral-200 mb-3"></div>
        <div className="flex gap-4 justify-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-20 bg-white border-2 border-neutral-400 flex items-center justify-center">
              <span className="text-2xl text-neutral-300">_</span>
            </div>
          ))}
        </div>
      </div>

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '×', 0, '✓'].map((num, i) => (
          <div key={i} className="h-12 bg-neutral-200 border border-neutral-400 flex items-center justify-center">
            <span className="text-neutral-600">{num}</span>
          </div>
        ))}
      </div>

      {/* Confirm button */}
      <div className="mt-auto w-full h-14 bg-neutral-700 flex items-center justify-center">
        <span className="text-white text-sm">Confirm</span>
      </div>
    </div>
  );
}