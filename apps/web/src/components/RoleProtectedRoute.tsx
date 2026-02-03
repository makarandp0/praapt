import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@praapt/shared';

import { useAuth } from '../contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route */
  allowedRoles: UserRole[];
  /** Optional fallback component to show when access is denied (defaults to redirect) */
  fallback?: ReactNode;
}

/**
 * Wrapper component that checks both authentication and role authorization.
 * Redirects to login if not authenticated, or shows fallback/redirect if role not allowed.
 */
export function RoleProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: RoleProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- role from API is validated by UserRoleSchema
  const userRole = user.role as UserRole | null;

  // Check if user has required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Show fallback if provided, otherwise redirect to home
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Access denied fallback component.
 */
export function AccessDenied() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>You do not have permission to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
