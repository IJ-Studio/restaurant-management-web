'use client';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/index';

/**
 * Sesión para compatibilidad. Ya no consulta `/auth/me` por su cuenta ni lee `authToken`
 * (PLAN 2.15): el usuario sale del store, que hidrata una sola lectura de `/api/auth/me` por carga.
 * Sin contexto propio: un valor de contexto que cambia al llegar la sesión obligaba a React a pintar
 * en el cliente el segmento del panel aún en streaming (dos `<main id="contenido-panel">`). Cada
 * consumidor se suscribe al store con `useSelector`, que solo avisa a lo ya hidratado.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const useAuth = () => {
  const { user, loading } = useSelector((estado: RootState) => estado.auth);
  return useMemo(() => ({ user, isLogged: !!user, loading }), [user, loading]);
};
