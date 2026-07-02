'use client';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  lastname: string;
  phone: string;
  roleName: string;
}

interface AuthContextType {
  user: User | null;
  isLogged: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLogged: false, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
          }
        } else {
          // Si el token expiró o es inválido, limpiamos
          localStorage.removeItem("authToken");
        }
      } catch (err) {
        console.error("Error cargando sesión global:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogged: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
