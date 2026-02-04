export function FaceCaptureReview() {
  return (
    <div className="h-full flex flex-col p-6 bg-neutral-50">
      {/* Header */}
      <div className="mb-4">
        <div className="w-40 h-5 bg-neutral-300 mb-1"></div>
        <div className="w-48 h-3 bg-neutral-200"></div>
      </div>

      {/* Grid of images */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-square bg-neutral-200 border-2 border-neutral-400 relative">
            {/* Face placeholder */}
            <div className="absolute inset-2 bg-neutral-300 rounded-full"></div>
            {/* Status badge */}
            <div className={`absolute top-1 right-1 w-12 h-4 ${i <= 4 ? 'bg-neutral-600' : 'bg-neutral-400'} text-white text-xs flex items-center justify-center`}>
              {i <= 4 ? 'Good' : 'Retake'}
            </div>
          </div>
        ))}
        {/* Add more placeholder */}
        <div className="aspect-square bg-white border-2 border-dashed border-neutral-400 flex items-center justify-center">
          <span className="text-2xl text-neutral-400">+</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-10 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Retake individual image</span>
        </div>
        <div className="w-full h-10 bg-white border-2 border-neutral-400 flex items-center justify-center">
          <span className="text-sm text-neutral-600">Add one more photo</span>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto w-full h-12 bg-neutral-800 flex items-center justify-center">
        <span className="text-white text-sm">Continue</span>
      </div>
    </div>
  );
}