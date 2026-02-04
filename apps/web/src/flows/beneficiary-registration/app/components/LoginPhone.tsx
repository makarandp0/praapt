export function LoginPhone() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <div className="w-32 h-6 bg-neutral-300 mb-2"></div>
      </div>

      {/* Phone input */}
      <div className="mb-6">
        <div className="w-24 h-4 bg-neutral-200 mb-2"></div>
        <div className="flex gap-2">
          <div className="w-16 h-12 bg-white border-2 border-neutral-400 flex items-center justify-center">
            <span className="text-sm text-neutral-600">+91</span>
          </div>
          <div className="flex-1 h-12 bg-white border-2 border-neutral-400"></div>
        </div>
        <div className="w-40 h-3 bg-neutral-200 mt-2"></div>
      </div>

      {/* Send OTP button */}
      <div className="w-full h-14 bg-neutral-700 flex items-center justify-center">
        <span className="text-white text-sm">Send OTP</span>
      </div>

      {/* Helper text */}
      <div className="mt-6">
        <div className="w-56 h-3 bg-neutral-200 mb-2"></div>
        <div className="w-48 h-3 bg-neutral-200"></div>
      </div>
    </div>
  );
}