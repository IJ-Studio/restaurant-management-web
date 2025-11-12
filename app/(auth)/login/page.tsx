'use client';

import { useState } from 'react';
import Button from '@/components/Button'
import { useHandleSubmit } from '@/hooks/handleSubmit';

export default function LoginPage() {
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const { handleSubmit } = useHandleSubmit()

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
                    {/* 
                    <Button
                        type='button'
                        style=''
                        label='Continuar con Google'
                        url='/google-auth'
                        className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200'
                        ico={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden>
                                <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.3-4.3-50.6H272.1v95.7h147.5c-.7 4.2-3.8 7.7-8.7 10.3v68h86.1c50.4-46.4 81.1-115 81.1-196.1z" />
                                <path fill="#34A853" d="M272.1 544.3c72.8 0 134-24.1 178.7-65.6l-86.1-68c-24 16.2-54.9 25.8-92.6 25.8-71 0-131.3-47.8-152.9-112.1h-90.6v70.4c44.3 87.9 135.4 150.1 243.5 150.1z" />
                                <path fill="#FBBC05" d="M119.2 321.4c-10.9-32.6-10.9-67.6 0-100.2V150.8H28.6C-2.1 204.5-2.1 339.8 28.6 393.5l90.6-72.1z" />
                                <path fill="#EA4335" d="M272.1 109.1c39.6-.6 75.5 14.1 103.6 40.6l77.8-77.8C413.8 24.9 356.7 1 272.1 1 163.9 1 72.8 63.1 28.6 150.8l90.6 70.4C140.8 156.9 201.1 109.1 272.1 109.1z" />
                            </svg>
                        }
                    />

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-400 font-light">o</span>
                        </div>
                    </div> */}

                    <form
                        className="space-y-6"
                        onSubmit={
                            (e) => handleSubmit(
                                e,
                                // `${process.env.API_BACKEND_URL}/auth/register`,
                                "/api/auth/login",
                                { correo, password },
                                setError,
                                '/dashboard'
                            )
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
                            {/* Olvidaste tu contraseña? {' '} */}
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
