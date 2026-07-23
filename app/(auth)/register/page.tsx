"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import FloatingInput from "@/components/FloatingInput";
import PhoneInput from "@/components/PhoneInput";
import Checkbox from "@/components/Checkbox";
import PasswordToggleButton from "@/components/PasswordToggleButton";
import PasswordRequirements from "@/components/PasswordRequirements";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { SettingsService } from "@/features/shared/services/dataService";
import { type SystemSettings } from "@/features/shared/data/restaurantData";
import { phoneRegex, emailRegex } from "@/utils/validators";
import {
  letters,
  haveAnVowel,
  noRepeatMoreThreeTimes,
  noRepeatConsonantsMoreThreeTimes,
} from "@/utils/validators";
import {
  length,
  lowercase,
  uppercase,
  number,
  specialChar,
} from "@/utils/validators";
export const dynamic = 'force-dynamic'
// ----- Funciones de validación (sin cambios) -----
const validateNameBlock = (value: string) => {
  if (!value) return false;
  const cleaned = value.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(" ");
  if (parts.length < 1 || parts.length > 2) return false;
  for (const p of parts) {
    if (!letters.test(p)) return false;
    if (!haveAnVowel.test(p)) return false;
    if (noRepeatMoreThreeTimes.test(p)) return false;
    if (noRepeatConsonantsMoreThreeTimes.test(p)) return false;
  }
  return true;
};

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isPasswordContainingPersonalData = (
  pwd: string,
  nombre: string,
  apellido: string,
  correo: string,
  telefono: string,
) => {
  const lowerPwd = normalize(pwd);
  const emailUser = normalize(correo.split("@")[0]);
  const nombreParts = normalize(nombre).split(/\s+/).filter(Boolean);
  const apellidoParts = normalize(apellido).split(/\s+/).filter(Boolean);
  const telefonoLimpio = telefono.replace(/\D/g, "");
  const personalData = [
    emailUser,
    telefonoLimpio,
    ...nombreParts,
    ...apellidoParts,
  ].filter((v) => v && v.length >= 3);
  return personalData.some((data) => lowerPwd.includes(data));
};

const MIN_SEQ = 3;
const hasIncrementalNumbers = (pwd: string) => {
  const digits = "0123456789";
  for (let i = 0; i <= digits.length - MIN_SEQ; i++) {
    if (pwd.includes(digits.slice(i, i + MIN_SEQ))) return true;
  }
  return false;
};
const hasDecrementalNumbers = (pwd: string) => {
  const digits = "9876543210";
  for (let i = 0; i <= digits.length - MIN_SEQ; i++) {
    if (pwd.includes(digits.slice(i, i + MIN_SEQ))) return true;
  }
  return false;
};
const hasIncrementalLetters = (pwd: string) => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const lowerPwd = pwd.toLowerCase();
  for (let i = 0; i <= letters.length - MIN_SEQ; i++) {
    if (lowerPwd.includes(letters.slice(i, i + MIN_SEQ))) return true;
  }
  return false;
};
const hasDecrementalLetters = (pwd: string) => {
  const letters = "zyxwvutsrqponmlkjihgfedcba";
  const lowerPwd = pwd.toLowerCase();
  for (let i = 0; i <= letters.length - MIN_SEQ; i++) {
    if (lowerPwd.includes(letters.slice(i, i + MIN_SEQ))) return true;
  }
  return false;
};
const hasRepeatedCharacters = (pwd: string) => /(.)\1{2,}/.test(pwd);
const hasSequentialPattern = (pwd: string) =>
  hasRepeatedCharacters(pwd) ||
  hasIncrementalNumbers(pwd) ||
  hasDecrementalNumbers(pwd) ||
  hasIncrementalLetters(pwd) ||
  hasDecrementalLetters(pwd);

// ----- Componente principal -----
export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [lada, setLada] = useState("+52");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const router = useRouter();

  useEffect(() => {
    setSettings(SettingsService.getSettings());
  }, []);

  // Validaciones
  const isNameValid = validateNameBlock(nombre);
  const isLastnameValid = validateNameBlock(apellido);
  const isEmailValid = emailRegex.test(correo);
  const isPhoneValid = phoneRegex.test(telefono);
  const validations = {
    length: length.test(password),
    lowercase: lowercase.test(password),
    uppercase: uppercase.test(password),
    number: number.test(password),
    special: specialChar.test(password),
  };
  const isPasswordValid =
    Object.values(validations).every(Boolean) &&
    !hasSequentialPattern(password) &&
    !isPasswordContainingPersonalData(
      password,
      nombre,
      apellido,
      correo,
      telefono,
    );

  const isFormValid =
    isNameValid &&
    isLastnameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    agreed;

  // Acción asíncrona de registro
  const registerAction = async () => {
    const reqData = {
      name: nombre,
      lastname: apellido,
      email: correo,
      phone: `${lada}${telefono}`,
      password,
      passwordConfirm: password,
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqData),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Ocurrió un error al registrarse");
    return data;
  };

  const {
    execute: handleRegister,
    loading,
    error,
    success,
  } = useAsyncAction({
    action: registerAction,
    successMessage:
      "¡Cuenta creada exitosamente! Revisa tu correo y confirma tu cuenta antes de iniciar sesión.",
    onSuccess: () => {
      setTimeout(() => router.push("/login"), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      // El error ya se maneja mediante los mensajes individuales en cada campo
      return;
    }
    handleRegister();
  };

  return (
    <div className="auth-grid">
      <div className="auth-form-wrapper">
        <div className="auth-form-inner">
          <BackButton fallbackHref="/" label="Volver" />
          <div className="mb-4 sm:mb-6">
            <h2 className="auth-title">Crea tu cuenta</h2>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <div className="w-1/2">
                <FloatingInput
                  id="nombre"
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  label="Nombre"
                  required
                  error={
                    nombre && !isNameValid
                      ? "Solo letras, máximo 30 caracteres."
                      : undefined
                  }
                />
              </div>
              <div className="w-1/2">
                <FloatingInput
                  id="apellido"
                  type="text"
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  label="Apellido"
                  required
                  error={
                    apellido && !isLastnameValid
                      ? "Solo letras, máximo 30 caracteres."
                      : undefined
                  }
                />
              </div>
            </div>

            <FloatingInput
              id="correo"
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              label="Correo electrónico"
              required
              error={
                correo && !isEmailValid
                  ? "Ingresa un correo electrónico válido."
                  : undefined
              }
            />

            <PhoneInput
              lada={lada}
              setLada={setLada}
              telefono={telefono}
              setTelefono={setTelefono}
              isPhoneValid={isPhoneValid}
              showError
            />

            <div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Crea una contraseña"
                  autoComplete="new-password"
                  className="input-floating pr-28"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-label">Contraseña*</span>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <PasswordToggleButton
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                  <PasswordRequirements validations={validations} />
                </div>
              </div>
              {password.length > 0 && (
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      [
                        "bg-red-500",
                        "bg-orange-400",
                        "bg-yellow-400",
                        "bg-green-500",
                        "bg-green-900",
                      ][
                        Math.min(
                          Object.values(validations).filter(Boolean).length,
                          4,
                        )
                      ]
                    }`}
                    style={{
                      width: `${(Object.values(validations).filter(Boolean).length / 5) * 100}%`,
                    }}
                  />
                </div>
              )}
              {password && hasSequentialPattern(password) && (
                <p className="text-xs text-red-500 mt-1">
                  La contraseña contiene secuencias predecibles.
                </p>
              )}
              {password &&
                isPasswordContainingPersonalData(
                  password,
                  nombre,
                  apellido,
                  correo,
                  telefono,
                ) && (
                  <p className="text-xs text-red-500 mt-1">
                    La contraseña contiene información personal.
                  </p>
                )}
            </div>

            <Checkbox
              id="terms"
              checked={agreed}
              onChange={setAgreed}
              label={
                <>
                  Acepto los{" "}
                  <span className="font-medium hover:underline text-[var(--color-text)] cursor-pointer">
                    Términos y condiciones
                  </span>
                  ,y{" "}
                  <span className="font-medium hover:underline text-[var(--color-text)] cursor-pointer">
                    Política de Privacidad
                  </span>
                </>
              }
            />

            <button
              type="submit"
              disabled={!isFormValid}
              className="btn-secondary"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:block h-screen p-10">
        <div className="relative h-full w-full rounded-[3rem] shadow-xl overflow-hidden transition-all duration-1000 animate-in zoom-in-95">
          <CldImage
            src={settings?.registerBgImageUrl || "food-3955317_1280"}
            fill
            alt="Register background"
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}
