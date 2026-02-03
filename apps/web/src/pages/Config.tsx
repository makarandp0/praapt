import type { HealthConfig, AuthConfig } from '@praapt/shared';
import { useEffect, useState } from 'react';

interface ConfigProps {
  apiBase: string;
}

/** Redact sensitive values, keeping first 4 and last 4 characters */
function redact(value: string): string {
  if (value.length <= 12) {
    return value.slice(0, 4) + '***';
  }
  return value.slice(0, 4) + '***' + value.slice(-4);
}

export function Config({ apiBase }: ConfigProps) {
  const [config, setConfig] = useState<HealthConfig | null>(null);
  const [auth, setAuth] = useState<AuthConfig | null>(null);
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
        setAuth(data.auth || null);
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

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Configuration</h2>

      {/* API Config */}
      {config && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">API Configuration</h3>
          <div className="space-y-3">
            <ConfigRow label="API URL" value={apiBase} />
            <ConfigRow label="Face Service URL" value={config.faceServiceUrl} />
            <ConfigRow label="Port" value={config.port} />
            <ConfigRow label="Images Dir" value={config.imagesDir} />
            <ConfigRow label="CORS Origin" value={config.corsOrigin} />
          </div>
        </div>
      )}

      {/* Auth Config */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Authentication</h3>
        {auth ? (
          <div className="space-y-3">
            <ConfigRow
              label="Enabled"
              value={auth.enabled ? 'Yes' : 'No'}
              valueClass={auth.enabled ? 'text-green-600' : 'text-red-600'}
            />
            {auth.firebase ? (
              <>
                <ConfigRow label="Project ID" value={auth.firebase.projectId} />
                <ConfigRow label="Auth Domain" value={auth.firebase.authDomain} />
                <ConfigRow label="API Key" value={redact(auth.firebase.apiKey)} />
                <ConfigRow label="App ID" value={redact(auth.firebase.appId)} />
              </>
            ) : (
              <div className="text-sm text-gray-500">Firebase not configured</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No auth configuration available</div>
        )}
      </div>

      {/* No config at all */}
      {!config && !auth && (
        <div className="text-gray-500">No configuration available</div>
      )}
    </div>
  );
}

function ConfigRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <span className="text-gray-600 font-medium text-sm sm:w-36 shrink-0">{label}:</span>
      <span className={`font-mono text-sm break-all ${valueClass ?? 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
