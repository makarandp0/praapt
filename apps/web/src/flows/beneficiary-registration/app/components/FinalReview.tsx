export function FinalReview() {
  return (
    <div className="h-full flex flex-col p-6 bg-neutral-50 relative">
      {/* Header */}
      <div className="mb-4">
        <div className="w-44 h-6 bg-neutral-300 mb-2"></div>
      </div>

      {/* Summary sections */}
      <div className="space-y-3 mb-6">
        {/* 8-digit identifier: Phone (last 4) + Aadhaar (last 4) */}
        <div className="p-3 bg-white border-2 border-neutral-400">
          <div className="w-48 h-3 bg-neutral-200 mb-2"></div>
          <div className="text-xs text-neutral-600 mb-2">Phone (last 4) + Aadhaar (last 4)</div>
          <div className="flex gap-2 justify-center">
            {/* Phone last 4 */}
            <div className="flex gap-1">
              {[5, 6, 7, 8].map((num, i) => (
                <div key={i} className="w-8 h-10 bg-neutral-600 text-white flex items-center justify-center text-sm border border-neutral-700">
                  {num}
                </div>
              ))}
            </div>
            <div className="w-px h-10 bg-neutral-400"></div>
            {/* Aadhaar last 4 */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((num, i) => (
                <div key={i} className="w-8 h-10 bg-neutral-600 text-white flex items-center justify-center text-sm border border-neutral-700">
                  {num}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-2 text-center">8-digit unique identifier</div>
        </div>

        {/* Location */}
        <div className="p-3 bg-white border border-neutral-300">
          <div className="w-24 h-3 bg-neutral-200 mb-2"></div>
          <div className="w-40 h-4 bg-neutral-200"></div>
        </div>

        {/* Face thumbnails */}
        <div className="p-3 bg-white border border-neutral-300">
          <div className="w-28 h-3 bg-neutral-200 mb-2"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 bg-neutral-200 border border-neutral-400">
                <div className="w-full h-full bg-neutral-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="w-full h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Edit</span>
        </div>
        <div className="w-full h-14 bg-neutral-800 flex items-center justify-center">
          <span className="text-white">Submit Registration</span>
        </div>
      </div>
    </div>
  );
}