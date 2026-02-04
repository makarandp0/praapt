import { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { parseUserRole } from '@praapt/shared';

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleDashboard } from './components/RoleDashboard';
import { RoleProtectedRoute, AccessDenied } from './components/RoleProtectedRoute';
import { StatusPanel } from './components/StatusPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelStatusProvider } from './contexts/ModelStatusContext';
import { API_BASE } from './lib/apiBase';
import { Config } from './pages/Config';
import { FaceDemo } from './pages/FaceDemo';
import { Library } from './pages/Library';
import { Login } from './pages/Login';
import { RegisterCustomer } from './pages/RegisterCustomer';
import { RoleManagement } from './pages/RoleManagement';
import { Signup } from './pages/Signup';
import { User } from './pages/User';
import { Users } from './pages/Users';
import { Version } from './pages/Version';
import { RegistrationWizard } from './flows/beneficiary-registration/RegistrationWizard';
import { KioskFlowPage } from './flows/kiosk/KioskFlowPage';

/** Navigation bar with auth-aware links */
function NavBar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userRole = parseUserRole(user?.role);
  const isDeveloper = userRole === 'developer';
  const isAdmin = userRole === 'admin';
  const canManageRoles = isDeveloper || isAdmin;
  // Users with active roles (not 'unknown') can access most features
  const hasActiveRole = userRole && userRole !== 'unknown';

  // Sign out and navigate to login without preserving previous location
  // This prevents the next user from being redirected to the previous user's page
  const handleSignOut = useCallback(async () => {
    // Navigate to login first (without 'from' state) so the next user starts fresh
    navigate('/login', { replace: true });
    await signOut();
  }, [navigate, signOut]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold hover:text-blue-600 transition-colors">
            Praapt
          </Link>
        </div>

        {/* Hamburger menu - available to all users with role-appropriate items */}
        <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                {/* User info header (authenticated only) */}
                {isAuthenticated && user && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user.name || user.email}
                  </div>
                )}

                {/* Dashboard (authenticated only) */}
                {isAuthenticated && (
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Features requiring active role (not 'unknown') */}
                {hasActiveRole && (
                  <>
                    <Link
                      to="/user"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Match Result
                    </Link>
                    <Link
                      to="/library"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Library
                    </Link>
                  </>
                )}

                {/* Admin/Developer only features */}
                {canManageRoles && (
                  <>
                    <Link
                      to="/users"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Registrations
                    </Link>
                    <Link
                      to="/role-management"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Role Management
                    </Link>
                  </>
                )}

                {/* Public features - available to everyone */}
                <Link
                  to="/facedemo"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Face Demo
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Register Face
                </Link>
                <Link
                  to="/registerCustomer"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Register Customer
                </Link>
                <Link
                  to="/flows/beneficiary-registration"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Registration Flow
                </Link>
                <Link
                  to="/flows/kiosk"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Kiosk Flow
                </Link>

                {/* Utility links */}
                <Link
                  to="/version"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Version
                </Link>
                <Link
                  to="/config"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Config
                </Link>

                {/* Auth actions */}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
      </div>
      <StatusPanel apiBase={API_BASE} />
    </div>
  );
}

/** Main app layout with routes */
function AppRoutes() {
  return (
    <div className="p-6 space-y-4">
      <NavBar />
      <div className="pt-4">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/facedemo" element={<FaceDemo apiBase={API_BASE} />} />
          <Route path="/signup" element={<Signup apiBase={API_BASE} />} />
          <Route path="/registerCustomer" element={<RegisterCustomer />} />
          <Route path="/version" element={<Version apiBase={API_BASE} />} />
          <Route path="/config" element={<Config apiBase={API_BASE} />} />
          <Route path="/flows/beneficiary-registration" element={<RegistrationWizard />} />
          <Route path="/flows/kiosk" element={<KioskFlowPage />} />

          {/* Dashboard - shows role-appropriate content, including for unknown users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />

          {/* Routes requiring active role (not 'unknown') */}
          <Route
            path="/user"
            element={
              <RoleProtectedRoute
                allowedRoles={['developer', 'admin', 'volunteer', 'vendor']}
                fallback={<AccessDenied />}
              >
                <User apiBase={API_BASE} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <RoleProtectedRoute
                allowedRoles={['developer', 'admin', 'volunteer', 'vendor']}
                fallback={<AccessDenied />}
              >
                <Library apiBase={API_BASE} />
              </RoleProtectedRoute>
            }
          />

          {/* Routes requiring admin/developer role */}
          <Route
            path="/users"
            element={
              <RoleProtectedRoute
                allowedRoles={['developer', 'admin']}
                fallback={<AccessDenied />}
              >
                <Users apiBase={API_BASE} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/role-management"
            element={
              <RoleProtectedRoute
                allowedRoles={['developer', 'admin']}
                fallback={<AccessDenied />}
              >
                <RoleManagement apiBase={API_BASE} />
              </RoleProtectedRoute>
            }
          />

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider apiBase={API_BASE}>
        <ModelStatusProvider apiBase={API_BASE}>
          <AppRoutes />
        </ModelStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
