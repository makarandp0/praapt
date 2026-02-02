import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { StatusPanel } from './components/StatusPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelStatusProvider } from './contexts/ModelStatusContext';
import { Config } from './pages/Config';
import { FaceDemo } from './pages/FaceDemo';
import { Library } from './pages/Library';
import { Signup } from './pages/Signup';
import { User } from './pages/User';
import { Users } from './pages/Users';
import { Version } from './pages/Version';

// API base URL - same server in prod, localhost:3000 in dev
const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

/** Navigation bar with auth-aware links */
function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          <h1 className="text-2xl font-bold">Praapt</h1>
        </div>

        {/* Menu button and dropdown */}
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
                      logout();
                      closeMenu();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Clear Session
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
          <Route path="/facedemo" element={<FaceDemo apiBase={API_BASE} />} />
          <Route path="/signup" element={<Signup apiBase={API_BASE} />} />
          <Route path="/version" element={<Version apiBase={API_BASE} />} />
          <Route path="/config" element={<Config apiBase={API_BASE} />} />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <User apiBase={API_BASE} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library apiBase={API_BASE} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users apiBase={API_BASE} />
              </ProtectedRoute>
            }
          />
          {/* Redirect old /login route to /facedemo */}
          <Route path="/login" element={<Navigate to="/facedemo" replace />} />
          <Route path="/" element={<Navigate to="/facedemo" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModelStatusProvider apiBase={API_BASE}>
          <AppRoutes />
        </ModelStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
