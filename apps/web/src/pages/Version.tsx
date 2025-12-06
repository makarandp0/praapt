import { useEffect, useState } from 'react';

interface VersionInfo {
  web: string;
  api: string;
  face: string;
}

interface VersionProps {
  apiBase: string;
}

// GitHub repo for generating commit links
const GITHUB_REPO = 'makarandp0/praapt';

function CommitLink({ commit, label }: { commit: string; label: string }) {
  const isValidCommit = commit && commit !== 'unknown' && commit.length >= 7;
  const shortCommit = commit?.slice(0, 7) || 'unknown';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-700">{label}</span>
      {isValidCommit ? (
        <a
          href={`https://github.com/${GITHUB_REPO}/commit/${commit}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
        >
          {shortCommit}
        </a>
      ) : (
        <span className="font-mono text-gray-400">{shortCommit}</span>
      )}
    </div>
  );
}

export function Version({ apiBase }: VersionProps) {
  const [versions, setVersions] = useState<VersionInfo>({
    web: __GIT_COMMIT__,
    api: 'loading...',
    face: 'loading...',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`${apiBase}/health`);
        if (!res.ok) {
          throw new Error(`Health check failed: ${res.status}`);
        }
        const data = await res.json();
        setVersions({
          web: __GIT_COMMIT__,
          api: data.commit || 'unknown',
          face: data.face?.commit || 'unknown',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch versions');
        setVersions({
          web: __GIT_COMMIT__,
          api: 'error',
          face: 'error',
        });
      }
    }

    fetchVersions();
  }, [apiBase]);

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Version Information</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <CommitLink label="Web" commit={versions.web} />
        <CommitLink label="API" commit={versions.api} />
        <CommitLink label="Face" commit={versions.face} />
      </div>

      <p className="mt-6 text-sm text-gray-500 text-center">
        Click on a commit hash to view it on GitHub
      </p>
    </div>
  );
}
