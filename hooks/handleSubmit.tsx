import store from './localstore';
import { useRedirect } from './useRedirect';

export function useHandleSubmit() {

    const { redirectTo } = useRedirect()

    async function handleSubmit(
        e: React.FormEvent,
        url: string,
        items: any,
        setError: (v: string | null) => void,
        nexturl?: string
    ) {
        e.preventDefault();
        setError(null)

        try {
            const response = await fetch(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(items)
                }
            )

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            const data = await response.json();

            // 1. Guardar sesión en localStorage
            store(
                [
                    // ['token', data.token], // Token comentado por ahora
                    ['user', data.user]    // Guardamos id, email y ROLE
                ],
                true // true para stringify
            )

            // 2. Lógica de Redirección Inteligente por Rol
            if (data.user && data.user.role === 'admin') {
                // Si es admin, forzamos la redirección a su panel
                redirectTo('/dashboard/admin');
            } else {
                // Si es usuario normal, usamos el nexturl original (ej. /dashboard)
                if (nexturl) redirectTo(nexturl);
            }
            
        } catch (err: any) {
            setError(err.message)
        }
    }

    return { handleSubmit }
}