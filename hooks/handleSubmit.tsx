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
          
    const role = data.user?.roleName;
    if (role === 'admin')        redirectTo('/dashboard/admin');
    else if (role === 'cajero')  redirectTo('/dashboard/cajero');
    else if (role === 'mesero')  redirectTo('/dashboard/mesero');
    else if (role === 'cocina')  redirectTo('/dashboard/cocina');
    else                         redirectTo('/dashboard/cliente');
                
        } catch (err: any) {
            setError(err.message)
        }
    }

    return { handleSubmit }
}