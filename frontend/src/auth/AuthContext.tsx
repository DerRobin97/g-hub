import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type Me,
  type LoginPayload,
  type RegisterPayload,
} from '../lib/api';

interface AuthContextValue {
  user: Me | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  // Beim Start prüfen, ob eine gültige Sitzung (Cookie) existiert.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload: LoginPayload): Promise<void> => {
    setUser(await apiLogin(payload));
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setUser(await apiRegister(payload));
  };

  const logout = async (): Promise<void> => {
    await apiLogout();
    setUser(null);
  };

  // Lädt die /me-Daten neu (z. B. nach dem Speichern im Profil-Sheet).
  const refresh = async (): Promise<void> => {
    setUser(await getMe());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden.');
  return ctx;
}
