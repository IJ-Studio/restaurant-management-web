'use client';
import { useState } from 'react';
import Button from '@/components/Button';
import { useHandleSubmit } from '@/hooks/handleSubmit';
import { registerWithEmail } from "@/actions/(email-actions)/sendEmailVerification";
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [lada, setLada] = useState('+52');
    const [telefono, setTelefono] = useState('');
    const [password, setpassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { handleSubmit } = useHandleSubmit();
    const router = useRouter();

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,30}$/;
    const phoneRegex = /^\d{10,15}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const isNameValid = nameRegex.test(nombre);
    const isLastnameValid = nameRegex.test(apellido);
    const isPhoneValid = phoneRegex.test(telefono);

    const getPasswordScore = (pwd: string) => {
        let score = 0;
        if (/.{8,}/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd)) score++;
        return score;
    };

    const passwordScore = getPasswordScore(password);

    const strengthColor = [
        "bg-red-500",
        "bg-orange-400",
        "bg-yellow-400",
        "bg-green-500",
        "bg-green-900"
    ][Math.min(passwordScore, 4)];


    return (
        <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div className="flex flex-col justify-center h-full px-4 py-8 sm:px-8 lg:px-10 lg:py-8">
                <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-sm">
                    <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                        <span className="text-xl font-medium text-[#3b4b57]">
                            Restaurante El Quijote
                        </span>
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Crea tu cuenta</h2>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 rounded-md text-sm font-semibold text-center bg-green-100 text-green-700 border border-green-300 shadow transition-all duration-300">
                            {success}
                        </div>
                    )}

                    <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                            const result = await handleSubmit(
                                e,
                                "/api/auth/register",
                                { nombre, apellido, correo, telefono: `${lada}${telefono}`, password },
                                setError,
                                '/dashboard'
                            );

                            // Enviar correo de verificación con Firebase
                            try {
                                await registerWithEmail(nombre, apellido, correo, password);
                            } catch (err) {
                                // Puedes mostrar un mensaje de error si falla el envío
                                setError("No se pudo enviar el correo de verificación.");
                            }

                            setSuccess("¡Cuenta creada exitosamente! Revisa tu correo y confirma tu cuenta antes de iniciar sesión.");
                            setError(null);

                            setTimeout(() => {
                                router.push('/login'); // o la página que corresponda
                            }, 1800);
                        }}
                    >
                        <div className="flex space-x-2">
                            <div className='relative w-1/2'>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    autoComplete="given-name"
                                    placeholder="Nombre"
                                    className={`block w-full rounded-lg border py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 sm:text-sm
                                        ${nombre && !isNameValid ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-gray-300"}`}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                                {nombre && !isNameValid && (
                                    <p className="text-xs text-red-500 mt-1">Solo letras, máximo 30 caracteres.</p>
                                )}
                                <span className="absolute left-3 sm:left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                    Nombre*
                                </span>
                            </div>

                            <div className='relative w-1/2'>
                                <input
                                    id="apellido"
                                    name="apellido"
                                    type="text"
                                    required
                                    autoComplete="family-name"
                                    placeholder="Apellido"
                                    className={`block w-full rounded-lg border py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 sm:text-sm
                                        ${apellido && !isLastnameValid ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-gray-300"}`}
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                />
                                {apellido && !isLastnameValid && (
                                    <p className="text-xs text-red-500 mt-1">Solo letras, máximo 30 caracteres.</p>
                                )}
                                <span className="absolute left-3 sm:left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                    Apellido*
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                required
                                placeholder="Correo electrónico"
                                autoComplete="correo"
                                className="block w-full rounded-lg border border-gray-200 py-2.5 sm:py-2.5 px-3 sm:px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                Correo electrónico*
                            </span>
                            {correo && !emailRegex.test(correo) && (
                                <p className="text-xs text-red-500 mt-1">Ingresa un correo electrónico válido.</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="telefono" className="sr-only">
                                Teléfono
                            </label>
                            <div className="flex gap-2">
                                <select
                                    id="lada"
                                    name="lada"
                                    value={lada}
                                    onChange={(e) => setLada(e.target.value)}
                                    className="w-20 sm:w-28 rounded-lg border border-gray-200 py-2.5 sm:py-2.5 px-2 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm"
                                >
                                    <option value="+52">+52 </option>
                                </select>
                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]{7,15}"
                                    placeholder="Teléfono"
                                    className={`flex-1 rounded-lg border py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 sm:text-sm
                                        ${telefono && !isPhoneValid ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-gray-300"}`}
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                                />
                                {telefono && !isPhoneValid && (
                                    <p className="text-xs text-red-500 mt-1">Debe contener entre 7 y 15 dígitos.</p>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="password"
                                autoComplete="new-password"
                                className="block w-full rounded-lg border border-gray-200 py-2.5 sm:py-2.5 px-3 sm:px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6"
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                            />
                            <span className="absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs text-gray-600">
                                Contraseña*
                            </span>
                            {password.length > 0 && (
                                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strengthColor}`}
                                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start pt-1 pb-3">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label
                                htmlFor="terms"
                                className="ml-3 text-sm font-light text-gray-600"
                            >
                                Acepto los{' '}
                                <span className="font-medium hover:underline text-gray-900 cursor-pointer">
                                    Términos y condiciones
                                </span>
                                ,y {' '}
                                <span className="font-medium hover:underline text-gray-900 cursor-pointer">
                                    Política de Privacidad
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!agreed}
                            className={`flex w-full justify-center rounded-xl px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg 
                                transition-all duration-300 
                                ${agreed ? "bg-[#232f38] hover:bg-[#3b4b57]" : "bg-[#232f38] opacity-40 cursor-not-allowed"}`}
                        >
                            Crear cuenta
                        </button>


                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        ¿Ya tienes una cuenta?{' '}
                        <Button
                            type="button"
                            style=''
                            label="Inicia sesión"
                            url="/login"
                            className="font-semibold leading-6 text-[#232f38] hover:text-[#3b4b57]"
                            ico=""
                        />

                    </p>
                </div>
            </div>

            <div className="hidden lg:block h-screen p-10">
                <div
                    className="relative h-full w-full rounded-[3rem] shadow-xl overflow-hidden bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://cdn.pixabay.com/photo/2020/02/11/19/03/meal-4840665_1280.jpg')`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                    }}
                ></div>
            </div>
        </div>
    );

}