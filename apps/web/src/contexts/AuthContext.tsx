import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

/** User data returned from auth endpoints */
export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  profileImagePath: string | null;
}

/** Single match entry for top matches list */
export interface MatchEntry {
  email: string;
  name: string | null;
  distance: number;
  profileImagePath: string | null;
}

/** Match info from face recognition login */
export interface MatchInfo {
  distance: number;
  threshold: number;
  loginImage: string; // base64 data URL of the image used for login
  topMatches: MatchEntry[];
}

interface AuthContextType {
  user: AuthUser | null;
  matchInfo: MatchInfo | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, match?: MatchInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Restore user from sessionStorage on mount
    const stored = sessionStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(() => {
    // Restore match info from sessionStorage on mount
    const stored = sessionStorage.getItem('auth_match');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((userData: AuthUser, match?: MatchInfo) => {
    setUser(userData);
    sessionStorage.setItem('auth_user', JSON.stringify(userData));
    if (match) {
      setMatchInfo(match);
      sessionStorage.setItem('auth_match', JSON.stringify(match));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setMatchInfo(null);
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_match');
    sessionStorage.removeItem('auth_login_image');
  }, []);

  const value = useMemo(
    () => ({
      user,
      matchInfo,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, matchInfo, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
