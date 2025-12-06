'use client';

import { useState, useEffect, useRef } from 'react';
import { emailRegex } from "@/utils/validators";

export default function RecoverPage() {
    const [correo, setCorreo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState("");

    const [waitSeconds, setWaitSeconds] = useState<number | null>(null);
    const intervalRef = useRef<any>(null);

    const isEmailValid = emailRegex.test(correo);
    const isFormReady = isEmailValid;

    // === 1. Timer ===
    useEffect(() => {
        if (waitSeconds === null) return;

        if (waitSeconds <= 0) {
            setWaitSeconds(null);
            return;
        }

        intervalRef.current = setInterval(() => {
            setWaitSeconds(prev =>
                prev !== null ? prev - 1 : null
            );
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [waitSeconds]);

    async function handleSend() {
        setError(null);
        setResponse("");

        const res = await fetch("/api/auth/recovery_request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
        });

        const data = await res.json();

        if (data.waitSeconds) {
            setWaitSeconds(data.waitSeconds);
        }

        if (!res.ok) {
            // Error normal o cooldown
            if (!data.waitSeconds) setError(data.message);
            return;
        }

        // Éxito
        setResponse("Correo enviado correctamente.");
    }

    return (
        <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div className="flex flex-col justify-center px-6 py-12 lg:px-10">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    <h2 className="text-3xl font-bold text-gray-900 mb-10">Recuperación de contraseña</h2>

                    {/* Error normal */}
                    {error && !waitSeconds && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Mensaje éxito */}
                    {response && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm font-semibold text-center">
                            {response}
                            <div className="mt-2 text-xs text-gray-700">
                                Revisa tu correo electrónico.
                            </div>
                        </div>
                    )}

                    {/* Bloqueo */}
                    {waitSeconds !== null && (
                        <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md text-sm font-semibold text-center">
                            Debes esperar {waitSeconds} segundos antes de enviar otro correo.
                        </div>
                    )}

                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >

                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Ingresa tu correo electrónico"
                                className="block w-full rounded-lg border border-gray-200 py-3.5 px-4"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
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
                            disabled={!isFormReady || waitSeconds !== null}
                            className={`flex w-full justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300
                                ${waitSeconds !== null
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : isFormReady
                                        ? "bg-[#232f38] hover:bg-[#3b4b57]"
                                        : "bg-[#232f38] opacity-40 cursor-not-allowed"
                                }`}
                        >
                            {waitSeconds !== null
                                ? `Bloqueado (${waitSeconds}s)`
                                : "Enviar enlace de recuperación"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block h-screen p-10" />
        </div>
    );
}
