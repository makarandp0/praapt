import { Contracts, type ListFaceRegistration } from '@praapt/shared';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { callContract } from '../lib/contractClient';

type Props = { apiBase: string };

export function Users({ apiBase }: Props) {
  const { getIdToken } = useAuth();

  const [registrations, setRegistrations] = useState<ListFaceRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.listFaceRegistrations, { token });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setRegistrations(response.registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [apiBase, getIdToken]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading face registrations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Face Registrations</h2>
        <span className="text-sm text-gray-500">{registrations.length} registrations</span>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No face registrations yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Profile image */}
                <div className="flex-shrink-0">
                  {reg.profileImagePath ? (
                    <img
                      src={`${apiBase}/images/file/${encodeURIComponent(reg.profileImagePath)}`}
                      alt={reg.name || reg.email}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">
                        {(reg.name || reg.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Registration info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{reg.name || 'No name'}</h3>
                  <p className="text-sm text-gray-500 truncate">{reg.email}</p>

                  {reg.faceRegisteredAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Face registered: {new Date(reg.faceRegisteredAt).toLocaleDateString()}
                    </p>
                  )}

                  {reg.createdAt && (
                    <p className="text-xs text-gray-400">
                      Created: {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
