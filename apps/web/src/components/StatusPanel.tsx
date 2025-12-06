import type { HealthResponse } from '@praapt/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useModelStatus } from '../contexts/ModelStatusContext';
import { createApiClient } from '../lib/apiClient';

interface StatusPanelProps {
  apiBase: string;
}

type StatusType = 'OK' | 'Not OK' | 'Unavailable' | 'Checking...';

export function StatusPanel({ apiBase }: StatusPanelProps): JSX.Element {
  console.log('[StatusPanel] Component render');
  const apiClient = useMemo(() => {
    console.log('[StatusPanel] Creating new API client');
    return createApiClient(apiBase);
  }, [apiBase]);

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
  const [config, setConfig] = useState<HealthResponse['config']>(undefined);
  const [showConfig, setShowConfig] = useState(false);

  // Derive face status from context
  const faceInfo = {
    status: (isChecking ? 'Checking...' : faceServiceOk ? 'OK' : 'Unavailable') as StatusType,
    modelsLoaded,
    model,
  };

  const fetchHealth = useCallback(async () => {
    console.log('[StatusPanel] fetchHealth called');
    console.log('Fetching health status from:', apiBase);
    setHealth('Checking...');

    try {
      // Refresh the shared context (which makes the API call)
      await refreshStatus();
      // Fetch config separately since it's only needed in StatusPanel
      const d = await apiClient.getHealth();
      console.log('[StatusPanel] Health response received:', d);
      setHealth(d.ok ? 'OK' : 'Not OK');
      if (d.config) {
        setConfig(d.config);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setHealth('Unavailable');
    }
  }, [apiBase, apiClient, refreshStatus]);

  useEffect(() => {
    console.log('[StatusPanel] useEffect triggered - calling fetchHealth');
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
          <span>{getStatusIcon(health)}</span>
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
            <span>💤</span>
            <span>Wake Up Face Service</span>
          </button>
        ) : (
          <button
            onClick={fetchHealth}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor(faceInfo.status)}`}
            title="Click to refresh status"
          >
            <span>{getStatusIcon(faceInfo.status)}</span>
            <span>Face</span>
          </button>
        )}

        <span className="text-gray-400">→</span>

        {/* Step 3: Model Status */}
        {faceInfo.status !== 'OK' ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium bg-gray-50 text-gray-400 border-gray-200">
            <span>−</span>
            <span>Model</span>
          </span>
        ) : faceInfo.model ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium bg-green-100 text-green-800 border-green-200">
            <span>✓</span>
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
            <span>{isLoadingModel ? '⟳' : '▶'}</span>
            <span>{isLoadingModel ? 'Loading Model...' : 'Load Model'}</span>
          </button>
        )}

        {/* Config Toggle */}
        <span className="ml-2 text-gray-300">|</span>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all"
          title="Toggle configuration details"
        >
          {showConfig ? '▼ Hide Config' : '▶ Show Config'}
        </button>
      </div>

      {/* Config Panel */}
      {showConfig && config && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
            <span className="text-gray-600 font-semibold">API URL:</span>
            <span className="text-gray-900 break-all">{apiBase}</span>

            <span className="text-gray-600 font-semibold">Face Service URL:</span>
            <span className="text-gray-900 break-all">{config.faceServiceUrl}</span>

            <span className="text-gray-600 font-semibold">Port:</span>
            <span className="text-gray-900">{config.port}</span>

            <span className="text-gray-600 font-semibold">Images Dir:</span>
            <span className="text-gray-900">{config.imagesDir}</span>

            <span className="text-gray-600 font-semibold">CORS Origin:</span>
            <span className="text-gray-900">{config.corsOrigin}</span>
          </div>
        </div>
      )}
    </div>
  );
}
