export function VolunteerHome() {
  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <div className="w-40 h-6 bg-neutral-300 mb-1"></div>
        <div className="w-32 h-4 bg-neutral-200"></div>
      </div>

      {/* Primary action */}
      <div className="w-full h-20 bg-neutral-800 flex items-center justify-center mb-6">
        <span className="text-white">Register Beneficiary</span>
      </div>

      {/* Secondary items */}
      <div className="space-y-3">
        <div className="w-full h-14 bg-white border-2 border-neutral-400 flex items-center px-4">
          <span className="text-sm text-neutral-600">Pending uploads</span>
          <div className="ml-auto w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
            <span className="text-xs">3</span>
          </div>
        </div>
        
        <div className="w-full h-14 bg-white border-2 border-neutral-400 flex items-center px-4">
          <span className="text-sm text-neutral-600">Sync status</span>
          <div className="ml-auto w-6 h-6 bg-neutral-400"></div>
        </div>
        
        <div className="w-full h-14 bg-white border-2 border-neutral-400 flex items-center px-4">
          <span className="text-sm text-neutral-600">Help / Guide</span>
          <div className="ml-auto w-6 h-6 bg-neutral-400"></div>
        </div>
      </div>
    </div>
  );
}
