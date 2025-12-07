import { ListUser } from '@praapt/shared';
import { useEffect, useMemo, useState } from 'react';

import { createApiClient } from '../lib/apiClient';

type Props = { apiBase: string };

export function Users({ apiBase }: Props) {
  const api = useMemo(() => createApiClient(apiBase), [apiBase]);

  const [users, setUsers] = useState<ListUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.listUsers();
        if (!response.ok) {
          throw new Error(response.error);
        }
        setUsers(response.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading users...</div>
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
        <h2 className="text-xl font-semibold">All Users</h2>
        <span className="text-sm text-gray-500">{users.length} users</span>
      </div>

      {users.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No users registered yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Profile image */}
                <div className="flex-shrink-0">
                  {user.profileImagePath ? (
                    <img
                      src={api.getProfileImageUrl(user.profileImagePath)}
                      alt={user.name || user.email}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{user.name || 'No name'}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>

                  {user.faceRegisteredAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Face registered: {new Date(user.faceRegisteredAt).toLocaleDateString()}
                    </p>
                  )}

                  {user.createdAt && (
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
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
