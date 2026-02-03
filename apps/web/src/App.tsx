import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { parseUserRole } from '@praapt/shared';

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleDashboard } from './components/RoleDashboard';
import { RoleProtectedRoute, AccessDenied } from './components/RoleProtectedRoute';
import { StatusPanel } from './components/StatusPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelStatusProvider } from './contexts/ModelStatusContext';
import { Config } from './pages/Config';
import { FaceDemo } from './pages/FaceDemo';
import { Library } from './pages/Library';
import { Login } from './pages/Login';
import { RoleManagement } from './pages/RoleManagement';
import { Signup } from './pages/Signup';
import { User } from './pages/User';
import { Users } from './pages/Users';
import { Version } from './pages/Version';

// API base URL - same server in prod, localhost:3000 in dev
const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

/** Navigation bar with auth-aware links */
function NavBar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userRole = parseUserRole(user?.role);
  const isDeveloper = userRole === 'developer';
  const isAdmin = userRole === 'admin';
  const canManageRoles = isDeveloper || isAdmin;

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

  // Show hamburger menu for users who can manage roles (developers and admins)
  const showMenu = canManageRoles;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold hover:text-blue-600 transition-colors">
            Praapt
          </Link>
        </div>

        {/* Menu button and dropdown - only for developers */}
        {showMenu && (
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
                {isAuthenticated ? (
                  <>
                    {user && (
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.name || user.email}
                      </div>
                    )}
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
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
                    <Link
                      to="/users"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Registrations
                    </Link>
                    {canManageRoles && (
                      <Link
                        to="/role-management"
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Role Management
                      </Link>
                    )}
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
                    <button
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
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
                      to="/version"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-100"
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
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sign out button for non-developers who are authenticated */}
        {isAuthenticated && !showMenu && (
          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign Out
          </button>
        )}
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
          <Route path="/version" element={<Version apiBase={API_BASE} />} />
          <Route path="/config" element={<Config apiBase={API_BASE} />} />

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
