export function SplashScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-neutral-50">
      {/* App name placeholder */}
      <div className="w-48 h-12 bg-neutral-300 mb-8"></div>
      
      {/* Loading indicator */}
      <div className="w-12 h-12 border-4 border-neutral-400 border-t-neutral-700 rounded-full mb-6"></div>
      
      {/* Status text */}
      <div className="text-center">
        <div className="w-64 h-4 bg-neutral-200 mx-auto mb-2"></div>
        <div className="w-48 h-4 bg-neutral-200 mx-auto"></div>
      </div>
    </div>
  );
}