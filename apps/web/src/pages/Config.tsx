import type { HealthResponse } from '@praapt/shared';
import { useEffect, useState } from 'react';

interface ConfigProps {
  apiBase: string;
}

export function Config({ apiBase }: ConfigProps) {
  const [config, setConfig] = useState<HealthResponse['config'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`${apiBase}/health`);
        if (!res.ok) {
          throw new Error(`Health check failed: ${res.status}`);
        }
        const data = await res.json();
        setConfig(data.config || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch config');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [apiBase]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="text-gray-500">No configuration available</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          <ConfigRow label="API URL" value={apiBase} />
          <ConfigRow label="Face Service URL" value={config.faceServiceUrl} />
          <ConfigRow label="Port" value={config.port} />
          <ConfigRow label="Images Dir" value={config.imagesDir} />
          <ConfigRow label="CORS Origin" value={config.corsOrigin} />
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <span className="text-gray-600 font-medium text-sm sm:w-36 shrink-0">{label}:</span>
      <span className="text-gray-900 font-mono text-sm break-all">{value}</span>
    </div>
  );
}
