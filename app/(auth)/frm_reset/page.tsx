'use client';

import { auth } from "@/lib/firebaseConfig";
import { useState } from 'react';
import { handleSendEmail } from "@/actions/(email-actions)/sendPasswordResetEmail";
import { emailRegex } from "@/utils/validators";

export default function RecoverPage() {
    const [correo, setCorreo] = useState('')
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState("");
    
    const isEmailValid = emailRegex.test(correo);

    const isFormReady = isEmailValid;

    async function handleSend() {
        console.log("Ejecutando handleSend con:", correo);
        if (!correo) return;

        const result = await handleSendEmail(auth, correo);

        if (result.success) setResponse("Correo enviado correctamente.");
        else setResponse(result.message);
    }

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
                            Recuperación de contraseña
                        </h2>

                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {response && (
                        <div className={`mt-4 p-3 rounded-md text-sm font-semibold text-center transition-all duration-300
                            ${response.includes('correctamente') ? 'bg-green-100 text-green-700 border border-green-300 shadow' : 'bg-red-100 text-red-700 border border-red-300 shadow'}`}>
                            {response}
                            {response.includes('correctamente') && (
                                <div className="mt-2 text-xs font-normal text-gray-700">
                                    Revisa tu correo electrónico y sigue el enlace para continuar con el cambio de contraseña.
                                </div>
                            )}
                        </div>
                    )}

                    <form className="space-y-6"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await handleSend();
                        }}
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
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                Correo electrónico*
                            </span>
                            {correo && !isEmailValid && (
                                <p className="text-xs text-red-500 mt-1">Ingresa un correo electrónico válido.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!isFormReady}
                            aria-disabled={!isFormReady}
                            className={`flex w-full justify-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg 
                                transition-all duration-300 
                                ${isFormReady ? "bg-[#232f38] hover:bg-[#3b4b57]" : "bg-[#232f38] opacity-40 cursor-not-allowed"}`}
                        >
                            Enviar enlace de recuperación de contraseña
                        </button>

                    </form>
                </div>
            </div>

            <div className="hidden lg:block h-screen p-10" />

        </div>
    );
}
