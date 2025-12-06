import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { StatusPanel } from './components/StatusPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelStatusProvider } from './contexts/ModelStatusContext';
import { Library } from './pages/Library';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { User } from './pages/User';

// API base URL - same server in prod, localhost:3000 in dev
const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

/** Navigation bar with auth-aware links */
function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Praapt</h1>
          <nav className="flex gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/user" className="text-blue-600 hover:underline">
                  Profile
                </Link>
                <Link to="/library" className="text-blue-600 hover:underline">
                  Library
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
                <Link to="/signup" className="text-blue-600 hover:underline">
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hello, {user.name || user.email}</span>
            <button onClick={logout} className="text-red-600 hover:underline text-sm">
              Logout
            </button>
          </div>
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
          <Route path="/login" element={<Login apiBase={API_BASE} />} />
          <Route path="/signup" element={<Signup apiBase={API_BASE} />} />
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
          <Route path="/" element={<Navigate to="/user" replace />} />
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
