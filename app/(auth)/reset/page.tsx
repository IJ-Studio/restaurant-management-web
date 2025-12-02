'use client';

import { auth } from "@/lib/firebaseConfig";
import { useState } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { handleResetPassword } from "@/actions/(email-actions)/ResetPassword";
import { length, lowercase, uppercase, number, specialChar } from "@/utils/validators";


export default function VerificationPage() {
    const params = useSearchParams();
    const actionCode = params.get("oobCode");
    const [new_pass, setPass] = useState('');
    const [error, setError] = useState<string | null>(null)
    const [response, setResponse] = useState("");
    const router = useRouter();

    const CheckIcon = () => (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path fill="currentColor" d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
        </svg>
    );

    const XIcon = () => (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path fill="currentColor" d="M18.3 5.71L12 12l6.29 6.29-1.41 1.41L12 13.41l-6.29 6.29-1.41-1.41L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" />
        </svg>
    );

    const getPasswordScore = (pwd: string) => {
        let score = 0;
        if (length.test(pwd)) score++;
        if (lowercase.test(pwd)) score++;
        if (uppercase.test(pwd)) score++;
        if (number.test(pwd)) score++;
        if (specialChar.test(pwd)) score++;
        return score;
    };
    
    const passwordScore = getPasswordScore(new_pass);

    const strengthColor = [
        "bg-red-500",
        "bg-orange-400",
        "bg-yellow-400",
        "bg-green-500",
        "bg-green-900"
    ][Math.min(passwordScore, 4)];

    const validations = {
        length: length.test(new_pass),
        lowercase: lowercase.test(new_pass),
        uppercase: uppercase.test(new_pass),
        number: number.test(new_pass),
        special: specialChar.test(new_pass)
    }

    const isPasswordValid = Object.values(validations).every(Boolean);
    
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
                            if (!isPasswordValid) {
                                setError("Completa todos los campos correctamente antes de continuar.");
                                return;
                            }
                            setError(null);

                            handleReset();
                        }}>

                        <div className='relative'>
                            {/* <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 sr-only">
                                Ingresa tu nueva contraseña
                            </label> */}
                            <input
                                id="newpassword"
                                name="newpassword"
                                type="password"
                                required
                                placeholder="crea una nueva contraseña"
                                autoComplete="password"
                                className="block w-full rounded-lg border border-gray-200 py-2.5 sm:py-2.5 px-3 sm:px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={new_pass}
                                onChange={(e) => setPass(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                Nueva Contraseña*
                            </span>
                            {new_pass.length > 0 && (
                                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strengthColor}`}
                                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                                    ></div>
                                </div>
                            )}
                            <div>
                                <p className="mt-5 text-sm font-medium text-gray-600 mb-3">
                                    La Contraseña debe contener al menos:
                                </p>

                                <ul className="flex flex-col space-y-3 mt-3 text-sm">

                                    <li className="flex items-center gap-2">
                                        <span className={`${validations.length ? "bg-green-600" : "bg-gray-300"} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
                                            {validations.length ? <CheckIcon /> : <XIcon />}
                                        </span>
                                        <span className={validations.length ? "text-gray-800 font-medium" : "text-gray-500"}>
                                            8 caracteres
                                        </span>
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <span className={`${validations.uppercase ? "bg-green-600" : "bg-gray-300"} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
                                            {validations.uppercase ? <CheckIcon /> : <XIcon />}
                                        </span>
                                        <span className={validations.uppercase ? "text-gray-800 font-medium" : "text-gray-500"}>
                                            Una letra mayúscula
                                        </span>
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <span className={`${validations.lowercase ? "bg-green-600" : "bg-gray-300"} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
                                            {validations.lowercase ? <CheckIcon /> : <XIcon />}
                                        </span>
                                        <span className={validations.lowercase ? "text-gray-800 font-medium" : "text-gray-500"}>
                                            Una letra minúscula
                                        </span>
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <span className={`${validations.number ? "bg-green-600" : "bg-gray-300"} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
                                            {validations.number ? <CheckIcon /> : <XIcon />}
                                        </span>
                                        <span className={validations.number ? "text-gray-800 font-medium" : "text-gray-500"}>
                                            Un número
                                        </span>
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <span className={`${validations.special ? "bg-green-600" : "bg-gray-300"} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
                                            {validations.special ? <CheckIcon /> : <XIcon />}
                                        </span>
                                        <span className={validations.special ? "text-gray-800 font-medium" : "text-gray-500"}>
                                            Un caracter especial (! @ # $ % & , . _ -)
                                        </span>
                                    </li>

                                </ul>

                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isPasswordValid}
                            aria-disabled={!isPasswordValid}
                            className={`flex w-full justify-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg 
                                transition-all duration-300 
                                ${isPasswordValid ? "bg-[#232f38] hover:bg-[#3b4b57]" : "bg-[#232f38] opacity-40 cursor-not-allowed"}`}
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
