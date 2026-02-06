import { useState, useEffect, useCallback } from 'react';
import { Contracts, type User, type UserRole, type ContractAuth, UserRoleSchema, parseUserRole } from '@praapt/shared';

import { RoleBadge } from '../components/RoleDashboard';
import { useAuth } from '../contexts/AuthContext';
import { callContract } from '../lib/contractClient';

/**
 * Endpoint information for the permissions table.
 * Each entry maps a contract to a human-readable description.
 */
interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  auth: ContractAuth;
}

const ENDPOINT_INFO: EndpointInfo[] = [
  // Health
  { method: 'GET', path: '/health', description: 'Health check', auth: Contracts.getHealth.auth },
  { method: 'POST', path: '/load-model', description: 'Load face recognition model', auth: Contracts.loadModel.auth },

  // User
  { method: 'GET', path: '/me', description: 'Get current user profile', auth: Contracts.getMe.auth },
  { method: 'GET', path: '/users', description: 'List all users', auth: Contracts.listUsers.auth },
  { method: 'PATCH', path: '/users/:id/role', description: 'Update user role', auth: Contracts.updateUserRole.auth },
];

/**
 * Format auth requirement for display.
 */
function formatAuth(auth: ContractAuth): string {
  if (auth === 'public') return 'Public';
  if (auth === 'authenticated') return 'Any authenticated user';
  return auth.join(', ');
}

/**
 * Get CSS classes for method badge.
 */
function getMethodClasses(method: string): string {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800';
    case 'POST':
      return 'bg-blue-100 text-blue-800';
    case 'PATCH':
      return 'bg-yellow-100 text-yellow-800';
    case 'PUT':
      return 'bg-orange-100 text-orange-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

interface RoleManagementProps {
  apiBase: string;
}

/** All available roles - derived from UserRoleSchema to ensure consistency */
const ALL_ROLES: readonly UserRole[] = UserRoleSchema.options;

export function RoleManagement({ apiBase }: RoleManagementProps) {
  const { user: currentUser, getIdToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.listUsers, { token });

      if (response.ok) {
        setUsers(response.users);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [apiBase, getIdToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.updateUserRole, {
        token,
        params: { id: userId },
        body: { role: newRole },
      });

      if (response.ok) {
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? response.user : u)),
        );
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      setError('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => {
              const userRole = parseUserRole(u.role);
              const isCurrentUser = u.id === currentUser?.id;

              return (
                <tr key={u.id} className={isCurrentUser ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {u.photoUrl ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={u.photoUrl}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {(u.name || u.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.name || 'No name'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">(you)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={userRole || 'unknown'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={userRole || 'unknown'}
                      onChange={(e) => {
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- select value is from role options
                        handleRoleChange(u.id, e.target.value as UserRole);
                      }}
                      disabled={updating === u.id}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100"
                    >
                      {ALL_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    {updating === u.id && (
                      <span className="ml-2 text-sm text-gray-500">Saving...</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p>
          <strong>Note:</strong> Admins cannot modify developer roles or promote users to developer.
        </p>
      </div>

      {/* Endpoint Permissions Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Endpoint Permissions</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowed Roles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ENDPOINT_INFO.map((endpoint, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getMethodClasses(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                    {endpoint.path}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {endpoint.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatAuth(endpoint.auth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
