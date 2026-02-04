export function RegistrationSuccess() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 relative">
      {/* Success icon placeholder */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-neutral-600 rounded-full flex items-center justify-center">
          <span className="text-3xl text-white">✓</span>
        </div>
      </div>

      {/* Success message */}
      <div className="mb-6 text-center">
        <div className="w-56 h-6 bg-neutral-300 mx-auto mb-4"></div>
        <div className="p-4 bg-white border-2 border-neutral-300">
          <div className="w-full h-4 bg-neutral-200 mb-2"></div>
          <div className="w-5/6 h-4 bg-neutral-200 mx-auto mb-3"></div>
          <div className="text-xs text-neutral-600 mt-3">
            "To get food, enter last 4 digits and scan face at the kiosk."
          </div>
        </div>
      </div>

      {/* Registration ID placeholder */}
      <div className="mb-8 p-3 bg-white border border-neutral-300 text-center">
        <div className="w-32 h-3 bg-neutral-200 mx-auto mb-2"></div>
        <div className="flex gap-1 justify-center">
          {[5, 6, 7, 8, 1, 2, 3, 4].map((num, i) => (
            <div key={i} className="w-6 h-8 bg-neutral-600 text-white flex items-center justify-center text-xs">
              {num}
            </div>
          ))}
        </div>
        <div className="text-xs text-neutral-500 mt-2">8-digit ID</div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="w-full h-14 bg-neutral-800 flex items-center justify-center">
          <span className="text-white">Register Another</span>
        </div>
        <div className="w-full h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Done</span>
        </div>
      </div>

      {/* Ambiguity note */}
      <div className="absolute bottom-2 right-2 text-xs text-neutral-600 bg-yellow-100 border border-yellow-400 p-2 max-w-[140px]">
        <strong>CLARIFY:</strong> Print receipt? SMS confirmation?
      </div>
    </div>
  );
}