"use client";

interface FloatingInputProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  rightElement?: React.ReactNode;
  error?: string; // ← nueva prop opcional
}

export default function FloatingInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  label,
  required = false,
  rightElement,
  error,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`input-floating ${rightElement ? "pr-20" : ""} ${error ? "border-red-400 focus:ring-red-300" : ""}`}
        value={value}
        onChange={onChange}
      />
      <span className="input-label">{label}*</span>
      {rightElement && rightElement}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
