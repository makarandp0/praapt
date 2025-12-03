import { useEffect, useState } from 'react';

interface StatusPanelProps {
  apiBase: string;
}

type StatusType = 'OK' | 'Not OK' | 'Unavailable' | 'Checking...';

interface FaceServiceInfo {
  status: StatusType;
  modelsLoaded: boolean;
  model: string | null;
}

export function StatusPanel({ apiBase }: StatusPanelProps) {
  const [health, setHealth] = useState<StatusType>('Checking...');
  const [faceInfo, setFaceInfo] = useState<FaceServiceInfo>({
    status: 'Checking...',
    modelsLoaded: false,
    model: null,
  });

  const fetchHealth = () => {
    console.log('Fetching health status from:', apiBase);
    setHealth('Checking...');
    setFaceInfo({
      status: 'Checking...',
      modelsLoaded: false,
      model: faceInfo.model, // Keep previous model name during refresh
    });

    fetch(`${apiBase}/health`)
      .then((r) => r.json())
      .then((d) => {
        setHealth(d.ok ? 'OK' : 'Not OK');
        setFaceInfo({
          status: d?.face?.ok ? 'OK' : 'Unavailable',
          modelsLoaded: d?.face?.modelsLoaded ?? false,
          model: d?.face?.model ?? null,
        });
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealth('Unavailable');
        setFaceInfo({ status: 'Unavailable', modelsLoaded: false, model: null });
      });
  };

  useEffect(() => {
    fetchHealth();
  }, [apiBase]);

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Not OK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Checking...':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'OK':
        return '✓';
      case 'Not OK':
        return '✗';
      case 'Unavailable':
        return '−';
      case 'Checking...':
        return '⟳';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 font-mono">{apiBase}</span>
      <button
        onClick={fetchHealth}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor(health)}`}
        title="Click to refresh status"
      >
        <span>{getStatusIcon(health)}</span>
        <span>API</span>
      </button>
      <button
        onClick={fetchHealth}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor(faceInfo.status)}`}
        title="Click to refresh status"
      >
        <span>{getStatusIcon(faceInfo.status)}</span>
        <span>Face</span>
        {faceInfo.status === 'OK' && (
          <span className="ml-1 text-[10px] opacity-75">
            {faceInfo.model ? (
              <>({faceInfo.model})</>
            ) : (
              <>(not loaded)</>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
