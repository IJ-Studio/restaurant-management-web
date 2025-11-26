'use client';

import { auth } from "@/lib/firebaseConfig";
import { useState } from 'react';
import Button from '@/components/Button'
import { useSearchParams, useRouter } from "next/navigation";
import { handleResetPassword } from "@/actions/(email-actions)/ResetPassword";

export default function VerificationPage() {
    const params = useSearchParams();
    const mode = params.get("mode");
    const actionCode = params.get("oobCode");
    const apiKey = params.get("apiKey");
    const continueUrl = params.get("continueUrl");
    const [new_pass, setPass] = useState('');
    const [error, setError] = useState<string | null>(null)
    const [response, setResponse] = useState("");
    const router = useRouter();

    async function handleReset() {
        if (!actionCode) return;

        const result = await handleResetPassword(auth, actionCode, new_pass);
        if (result.success) {
            setResponse("Contraseña restablecida correctamente.");
            setTimeout(() => router.push('/login'), 1800);
        } else {
            setResponse(result.message);
        }
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
                            Restablecer contraseña
                        </h2>
                    </div>

                    {response && (
                        <div className={`mt-4 p-3 rounded-md text-sm font-semibold text-center transition-all duration-300
                            ${response.includes('correctamente') ? 'bg-green-100 text-green-700 border border-green-300 shadow' : 'bg-red-100 text-red-700 border border-red-300 shadow'}`}
                        >
                            {response}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleReset();
                        }}>

                        <div className='relative'>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 sr-only">
                                Ingresa tu nueva contraseña
                            </label>
                            <input
                                id="newpassword"
                                name="newpassword"
                                type="password"
                                autoComplete=""
                                required
                                placeholder="XXXXXX"
                                className="block w-full rounded-lg border border-gray-200 py-3.5 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={new_pass}
                                onChange={(e) => setPass(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">Nueva contraseña*</span>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-[#232f38] px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-[#3b4b57]"
                        >
                            Establecer nueva contraseña
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block h-screen p-10" />

        </div>
    );
}
