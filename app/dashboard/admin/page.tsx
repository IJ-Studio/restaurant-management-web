'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/nav';
import Dropdown from '@/components/dropdown';
import { useRedirect } from '@/hooks/useRedirect';

export default function AdminDashboard() {
    const { redirectTo } = useRedirect();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (!userStored) {
            redirectTo('/login');
            return;
        }

        const parsedUser = JSON.parse(userStored);
        
        // 🛡️ EL PORTERO DEL ADMIN 🛡️
        if (parsedUser.role !== 'admin') {
            // Si intenta entrar un mortal, lo mandamos a su dashboard normal
            redirectTo('/dashboard'); 
        } else {
            setUser(parsedUser);
            setIsAuthorized(true);
        }
    }, []);

   const handleLogout = async () => {
        // 1. Pedir al servidor que borre la cookie
        await fetch('/api/auth/logout', { method: 'POST' });
        
        // 2. Borrar datos locales (cosmético)
        localStorage.removeItem('user');
        
        // 3. Redirigir al login (ahora sí, el middleware nos dejará entrar)
        redirectTo('/login');
    };

    const profileMenuItems = [
        { label: 'Cerrar Sesión', action: handleLogout, isDestructive: true }
    ];

    // Diseño original del botón de perfil
    const ProfileButton = (
        <button
            type="button"
            className="p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
            aria-label="Menú de perfil"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
            >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
        </button>
    );

    if (!isAuthorized) return null;

    return (
        <Nav>
            <div className="text-green-700 font-bold mr-4">
                PANEL DE ADMINISTRADOR - {user?.name}
            </div>
            <Dropdown
                toggleContent={ProfileButton}
                menuItems={profileMenuItems}
            />
        </Nav>
    );
}