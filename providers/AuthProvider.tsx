'use client';
import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/index';
import type { SessionUser } from '@/types/auth';

interface AuthContextType {
  user: SessionUser | null;
  isLogged: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLogged: false, loading: true });

/**
 * Contexto de sesión para compatibilidad. Ya no consulta `/auth/me` por su cuenta ni lee
 * `authToken` (PLAN 2.15): toma el usuario del store, que hidrata una sola lectura de
 * `/api/auth/me` por carga.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSelector((estado: RootState) => estado.auth);

  return (
    <AuthContext.Provider value={{ user, isLogged: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
