"use client";

interface PasswordToggleButtonProps {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}

export default function PasswordToggleButton({
  showPassword,
  setShowPassword,
}: PasswordToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none border border-gray-400 rounded-md px-2 py-1 bg-transparent"
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {showPassword ? "Ocultar" : "Mostrar"}
    </button>
  );
}
