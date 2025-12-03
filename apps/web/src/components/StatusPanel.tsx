import { useEffect, useState } from 'react';

interface StatusPanelProps {
  apiBase: string;
}

type StatusType = 'OK' | 'Not OK' | 'Unavailable' | 'Checking...';

export function StatusPanel({ apiBase }: StatusPanelProps) {
  const [health, setHealth] = useState<StatusType>('Checking...');
  const [faceHealth, setFaceHealth] = useState<StatusType>('Checking...');

  useEffect(() => {
    console.log('Using API endpoint:', apiBase);
    fetch(`${apiBase}/health`)
      .then((r) => r.json())
      .then((d) => {
        setHealth(d.ok ? 'OK' : 'Not OK');
        setFaceHealth(d?.face?.ok ? 'OK' : 'Unavailable');
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealth('Unavailable');
        setFaceHealth('Unavailable');
      });
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
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusColor(health)}`}
      >
        <span>{getStatusIcon(health)}</span>
        <span>API</span>
      </div>
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusColor(faceHealth)}`}
      >
        <span>{getStatusIcon(faceHealth)}</span>
        <span>Face</span>
      </div>
    </div>
  );
}
