import type { UserRole } from '@praapt/shared';

import { useAuth } from '../contexts/AuthContext';

interface RoleDashboardProps {
  children?: React.ReactNode;
}

/**
 * Dashboard component that displays role-appropriate content.
 * Users with 'unknown' role see a message to contact an administrator.
 */
export function RoleDashboard({ children }: RoleDashboardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- role from API is validated by UserRoleSchema
  const role = user.role as UserRole | null;

  // Unknown role: show contact administrator message
  if (!role || role === 'unknown') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Role Not Assigned</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Your account has been created but you do not have an assigned role yet.</p>
                <p className="mt-2">
                  Please contact an administrator to assign a role to your account.
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Signed in as: {user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For users with valid roles, show children or default dashboard content
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500">
              Welcome, {user.name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Role:</span>
            <RoleBadge role={role} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Badge component showing the user's role with appropriate styling.
 */
export function RoleBadge({ role }: { role: UserRole }) {
  const roleStyles: Record<UserRole, string> = {
    developer: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    volunteer: 'bg-green-100 text-green-800',
    vendor: 'bg-orange-100 text-orange-800',
    unknown: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyles[role] || roleStyles.unknown}`}
    >
      {role}
    </span>
  );
}
