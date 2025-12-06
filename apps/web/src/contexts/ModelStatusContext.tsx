import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { createApiClient } from '../lib/apiClient';

/** Delay in ms to wait after loading a model before refreshing status */
const MODEL_READY_DELAY_MS = 500;

interface ModelStatus {
  /** Whether the face service is available */
  faceServiceOk: boolean;
  /** Whether a model is loaded */
  modelsLoaded: boolean;
  /** The currently loaded model name */
  model: string | null;
  /** Whether we're currently checking status */
  isChecking: boolean;
  /** Whether we're currently loading a model */
  isLoadingModel: boolean;
}

interface ModelStatusContextType extends ModelStatus {
  /** Refresh the model status */
  refreshStatus: () => Promise<void>;
  /** Load a model */
  loadModel: (model: 'buffalo_l' | 'buffalo_s') => Promise<void>;
}

const ModelStatusContext = createContext<ModelStatusContextType | null>(null);

interface ModelStatusProviderProps {
  children: ReactNode;
  apiBase: string;
}

export function ModelStatusProvider({ children, apiBase }: ModelStatusProviderProps) {
  const apiClient = useMemo(() => createApiClient(apiBase), [apiBase]);

  const [status, setStatus] = useState<ModelStatus>({
    faceServiceOk: false,
    modelsLoaded: false,
    model: null,
    isChecking: true,
    isLoadingModel: false,
  });

  const refreshStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }));
    try {
      const health = await apiClient.getHealth();
      setStatus((prev) => ({
        ...prev,
        faceServiceOk: health.face.ok,
        modelsLoaded: health.face.modelsLoaded ?? false,
        model: health.face.model ?? null,
        isChecking: false,
      }));
    } catch (err) {
      console.error('Failed to check model status:', err);
      setStatus((prev) => ({
        ...prev,
        faceServiceOk: false,
        modelsLoaded: false,
        model: null,
        isChecking: false,
      }));
    }
  }, [apiClient]);

  const loadModel = useCallback(
    async (model: 'buffalo_l' | 'buffalo_s') => {
      setStatus((prev) => ({ ...prev, isLoadingModel: true }));
      try {
        await apiClient.loadModel(model);
        // Wait for the model to be ready before refreshing status
        await new Promise((resolve) => setTimeout(resolve, MODEL_READY_DELAY_MS));
        await refreshStatus();
      } catch (err) {
        console.error('Failed to load model:', err);
        throw err;
      } finally {
        setStatus((prev) => ({ ...prev, isLoadingModel: false }));
      }
    },
    [apiClient, refreshStatus],
  );

  // Initial status check
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const value = useMemo(
    () => ({
      ...status,
      refreshStatus,
      loadModel,
    }),
    [status, refreshStatus, loadModel],
  );

  return <ModelStatusContext.Provider value={value}>{children}</ModelStatusContext.Provider>;
}

export function useModelStatus() {
  const context = useContext(ModelStatusContext);
  if (!context) {
    throw new Error('useModelStatus must be used within a ModelStatusProvider');
  }
  return context;
}
