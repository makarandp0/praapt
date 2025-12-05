import type { HealthResponse } from '@praapt/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { createApiClient } from '../lib/apiClient';

interface StatusPanelProps {
  apiBase: string;
}

type StatusType = 'OK' | 'Not OK' | 'Unavailable' | 'Checking...';

interface FaceServiceInfo {
  status: StatusType;
  modelsLoaded: boolean;
  model: string | null;
}

export function StatusPanel({ apiBase }: StatusPanelProps): JSX.Element {
  console.log('[StatusPanel] Component render');
  const apiClient = useMemo(() => {
    console.log('[StatusPanel] Creating new API client');
    return createApiClient(apiBase);
  }, [apiBase]);
  const [health, setHealth] = useState<StatusType>('Checking...');
  const [faceInfo, setFaceInfo] = useState<FaceServiceInfo>({
    status: 'Checking...',
    modelsLoaded: false,
    model: null,
  });
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [config, setConfig] = useState<HealthResponse['config']>(undefined);
  const [showConfig, setShowConfig] = useState(false);

  const fetchHealth = useCallback(async () => {
    console.log('[StatusPanel] fetchHealth called');
    console.log('Fetching health status from:', apiBase);
    setHealth('Checking...');
    setFaceInfo((prev) => ({
      status: 'Checking...',
      modelsLoaded: false,
      model: prev.model, // Keep previous model name during refresh
    }));

    try {
      const d = await apiClient.getHealth();
      console.log('[StatusPanel] Health response received:', d);
      setHealth(d.ok ? 'OK' : 'Not OK');
      setFaceInfo({
        status: d.face.ok ? 'OK' : 'Unavailable',
        modelsLoaded: d.face.modelsLoaded ?? false,
        model: d.face.model ?? null,
      });
      if (d.config) {
        setConfig(d.config);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setHealth('Unavailable');
      setFaceInfo({ status: 'Unavailable', modelsLoaded: false, model: null });
    }
  }, [apiBase, apiClient]);

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

  const handleLoadModel = async (model: 'buffalo_l' | 'buffalo_s') => {
    setLoadingModel(model);
    try {
      await apiClient.loadModel(model);
      // Refresh health status to show the new model
      await new Promise((resolve) => setTimeout(resolve, 500));
      fetchHealth();
    } catch (err) {
      console.error('Failed to load model:', err);
      alert(`Failed to load model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingModel(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
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
              {faceInfo.model ? <>({faceInfo.model})</> : <>(not loaded)</>}
            </span>
          )}
        </button>

        {/* Model Loading Controls */}
        {faceInfo.status === 'OK' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Load:</span>
            <button
              onClick={() => handleLoadModel('buffalo_s')}
              disabled={loadingModel !== null || faceInfo.model === 'buffalo_s'}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                faceInfo.model === 'buffalo_s'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-default'
                  : loadingModel === 'buffalo_s'
                    ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-wait'
                    : 'bg-white hover:bg-gray-50 border-gray-300 cursor-pointer'
              }`}
              title="Small model (~500MB, faster)"
            >
              {loadingModel === 'buffalo_s' ? '⟳ Loading...' : 'Small'}
            </button>
            <button
              onClick={() => handleLoadModel('buffalo_l')}
              disabled={loadingModel !== null || faceInfo.model === 'buffalo_l'}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                faceInfo.model === 'buffalo_l'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-default'
                  : loadingModel === 'buffalo_l'
                    ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-wait'
                    : 'bg-white hover:bg-gray-50 border-gray-300 cursor-pointer'
              }`}
              title="Large model (~1.5GB, more accurate)"
            >
              {loadingModel === 'buffalo_l' ? '⟳ Loading...' : 'Large'}
            </button>
          </div>
        )}

        {/* Config Toggle */}
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
