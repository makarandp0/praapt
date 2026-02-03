import { Contracts } from '@praapt/shared';
import { useCallback, useEffect, useState } from 'react';

import { useModelStatus } from '../contexts/ModelStatusContext';
import { callContract } from '../lib/contractClient';

interface StatusPanelProps {
  apiBase: string;
}

type StatusType = 'OK' | 'Not OK' | 'Unavailable' | 'Checking...';

export function StatusPanel({ apiBase }: StatusPanelProps): JSX.Element {
  // Use shared model status context
  const {
    faceServiceOk,
    modelsLoaded,
    model,
    isChecking,
    isLoadingModel,
    refreshStatus,
    loadModel: contextLoadModel,
  } = useModelStatus();

  const [health, setHealth] = useState<StatusType>('Checking...');

  // Derive face status from context
  const faceStatus: StatusType = isChecking ? 'Checking...' : faceServiceOk ? 'OK' : 'Unavailable';
  const faceInfo = {
    status: faceStatus,
    modelsLoaded,
    model,
  };

  const fetchHealth = useCallback(async () => {
    setHealth('Checking...');

    try {
      // Refresh the shared context (which makes the API call)
      await refreshStatus();
      // getHealth is public, no token needed
      const d = await callContract(apiBase, Contracts.getHealth);
      setHealth(d.ok ? 'OK' : 'Not OK');
    } catch (err) {
      console.error('Health check failed:', err);
      setHealth('Unavailable');
    }
  }, [apiBase, refreshStatus]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

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

  const getStatusAriaLabel = (status: StatusType) => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'Not OK':
        return 'error';
      case 'Unavailable':
        return 'unavailable';
      case 'Checking...':
        return 'loading';
    }
  };

  const handleLoadModel = async (modelName: 'buffalo_l' | 'buffalo_s') => {
    try {
      await contextLoadModel(modelName);
    } catch (err) {
      console.error('Failed to load model:', err);
      alert(`Failed to load model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Step 1: API Status */}
        <button
          onClick={fetchHealth}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor(health)}`}
          title="Click to refresh status"
        >
          <span aria-label={getStatusAriaLabel(health)}>{getStatusIcon(health)}</span>
          <span>API</span>
        </button>

        <span className="text-gray-400">→</span>

        {/* Step 2: Face Service Status */}
        {faceInfo.status === 'Unavailable' && !isChecking ? (
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
            title="The face service is sleeping to save resources. Click to wake it up (may take 10-30 seconds)"
          >
            <span aria-label="sleeping">💤</span>
            <span>Wake Up Face Service</span>
          </button>
        ) : (
          <button
            onClick={fetchHealth}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor(faceInfo.status)}`}
            title="Click to refresh status"
          >
            <span aria-label={getStatusAriaLabel(faceInfo.status)}>
              {getStatusIcon(faceInfo.status)}
            </span>
            <span>Face</span>
          </button>
        )}

        <span className="text-gray-400">→</span>

        {/* Step 3: Model Status */}
        {faceInfo.status !== 'OK' ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium bg-gray-50 text-gray-400 border-gray-200">
            <span aria-label="unavailable">−</span>
            <span>Model</span>
          </span>
        ) : faceInfo.model ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium bg-green-100 text-green-800 border-green-200">
            <span aria-label="success">✓</span>
            <span>Model ({faceInfo.model})</span>
          </span>
        ) : (
          <button
            onClick={() => handleLoadModel('buffalo_l')}
            disabled={isLoadingModel}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
              isLoadingModel
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-wait'
                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer'
            }`}
            title="Load face recognition model"
          >
            <span aria-label={isLoadingModel ? 'loading' : 'play'}>
              {isLoadingModel ? '⟳' : '▶'}
            </span>
            <span>{isLoadingModel ? 'Loading Model...' : 'Load Model'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
