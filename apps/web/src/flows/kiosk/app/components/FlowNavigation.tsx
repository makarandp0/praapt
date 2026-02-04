interface FlowNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  screens?: { id: string; label: string }[];
}

const defaultScreens: { id: string; label: string }[] = [
  { id: 'boot', label: '1. Boot' },
  { id: 'idle', label: '2. Welcome' },
  { id: 'enter-aadhaar', label: '3. Aadhaar' },
  { id: 'no-record', label: '4. No Record' },
  { id: 'face-scan', label: '5. Face Scan' },
  { id: 'matching', label: '6. Matching' },
  { id: 'verified-toast', label: '7. Verified' },
  { id: 'verification-failed', label: '8. Failed' },
  { id: 'ask-help', label: '9. Help' },
  { id: 'vendor-pin', label: '10. Vendor PIN' },
  { id: 'vendor-assist', label: '11. Assist' },
  { id: 'food-selection', label: '12. Select' },
  { id: 'redemption-success', label: '13. Success' },
];

export function FlowNavigation({ currentScreen, onNavigate, screens = defaultScreens }: FlowNavigationProps) {
  return (
    <div className="bg-[#1D232E] text-[#F6F1E8] p-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm mb-3 text-[#5A6472]">Developer Navigation (not part of kiosk UI):</p>
        <div className="grid grid-cols-7 gap-2">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => onNavigate(screen.id)}
              className={`px-3 py-2 text-xs border-2 rounded transition-colors ${
                currentScreen === screen.id
                  ? 'bg-[#243B6B] text-[#F6F1E8] border-[#243B6B]'
                  : 'bg-[#E7E0D6] text-[#1D232E] border-[#E7E0D6] hover:bg-[#ddd5ca]'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
