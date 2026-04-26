import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/authApi';
import { clearTokens } from '../../auth/tokenStore';

const AuthContext = createContext(null);

function normalizeUser(payload) {
  if (!payload) return null;
  return {
    ...payload,
    fullName: payload.fullName || payload.name || '',
    profileImageUrl:
      payload.profileImageUrl || payload.picture || payload.avatarUrl || payload.imageUrl || '',
  };
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const result = await authApi.getCurrentUser();
      setUser(normalizeUser(result.data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithGoogle = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.assign(`${baseUrl}/oauth2/authorization/google`);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore backend logout errors and clear local state.
    }
    clearTokens();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, refreshUser, loginWithGoogle, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
