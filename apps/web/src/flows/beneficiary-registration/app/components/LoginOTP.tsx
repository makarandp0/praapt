export function LoginOTP() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-6">
        <div className="w-40 h-6 bg-neutral-300 mb-2"></div>
        <div className="w-32 h-4 bg-neutral-200"></div>
      </div>

      {/* OTP input boxes */}
      <div className="mb-6">
        <div className="w-24 h-4 bg-neutral-200 mb-3"></div>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-12 h-14 bg-white border-2 border-neutral-400"></div>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className="w-32 h-4 bg-neutral-200 mx-auto"></div>
      </div>

      {/* Verify button */}
      <div className="w-full h-14 bg-neutral-700 flex items-center justify-center mb-3">
        <span className="text-white text-sm">Verify</span>
      </div>

      {/* Resend button */}
      <div className="w-full h-12 bg-neutral-300 flex items-center justify-center">
        <span className="text-neutral-500 text-sm">Resend OTP (disabled)</span>
      </div>
    </div>
  );
}