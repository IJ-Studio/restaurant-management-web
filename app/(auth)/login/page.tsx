'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button'
import { useHandleSubmit } from '@/hooks/handleSubmit';

export default function LoginPage() {
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const { handleSubmit } = useHandleSubmit()
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center">

            <div className="flex flex-col justify-center px-6 py-12 lg:px-10">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="flex items-center space-x-2 mb-12">
                        <span className="text-xl font-medium text-[#3b4b57]">
                            Restaurante El Quijote
                        </span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Iniciar sesión
                        </h2>

                    </div>

                    {success && (
                        <div className="mt-4 p-3 rounded-md text-sm font-semibold text-center bg-green-100 text-green-700 border border-green-300 shadow transition-all duration-300">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        className="space-y-6"
                        onSubmit={
                            (e) => {
                                handleSubmit(
                                    e,
                                    "/api/auth/login",
                                    { correo, password },
                                    setError,
                                    '/dashboard'
                                );
                                setSuccess("¡Inicio de sesión exitoso!");
                                setError(null);

                                setTimeout(() => {
                                    router.push('/dashboard');
                                }, 1500);
                            }
                        }
                    >

                        <div className='relative'>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 sr-only">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Ingresa tu correo electronico"
                                className="block w-full rounded-lg border border-gray-200 py-3.5 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">Correo electronico*</span>
                        </div>

                        <div className='relative'>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Ingresa tu contraseña"
                                className="block w-full rounded-lg border border-gray-200 py-3.5 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">Contraseña*</span>
                        </div>

                        <p className="mt-8 text-right text-sm text-gray-500">
                            <Button
                                type='button'
                                style=''
                                label='Recuperar contraseña'
                                url='/frm_reset'
                                className='font-semibold leading-6 text-[#232f38] hover:text-[#3b4b57]'
                                ico=''
                            />
                        </p>

                        <div>
                            <Button
                                type='submit'
                                style=''
                                label='Iniciar Sesión'
                                url=''
                                className='flex w-full justify-center rounded-xl bg-[#232f38] px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-[#3b4b57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#232f38]'
                                ico=''
                            />
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Aun tienes una cuenta? {' '}
                        <Button
                            type='button'
                            style=''
                            label='Registrarse'
                            url='/register'
                            className='font-semibold leading-6 text-[#232f38] hover:text-[#3b4b57]'
                            ico=''
                        />
                    </p>
                </div>
            </div>

            <div className="hidden lg:block h-screen p-10">
                <div
                    className="relative h-full w-full rounded-[3rem] shadow-xl overflow-hidden bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://cdn.pixabay.com/photo/2019/01/25/21/07/food-3955317_1280.jpg')`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                </div>
            </div>

        </div>
    );
}
