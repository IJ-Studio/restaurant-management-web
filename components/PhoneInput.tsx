"use client";

interface PhoneInputProps {
  lada: string;
  setLada: (value: string) => void;
  telefono: string;
  setTelefono: (value: string) => void;
  isPhoneValid: boolean;
  showError?: boolean;
}

export default function PhoneInput({
  lada,
  setLada,
  telefono,
  setTelefono,
  isPhoneValid,
  showError = false,
}: PhoneInputProps) {
  return (
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
          className="w-20 sm:w-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 px-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 sm:text-sm"
        >
          <option value="+52">+52</option>
        </select>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          inputMode="numeric"
          pattern="[0-9]{7,15}"
          placeholder="Teléfono"
          className={`flex-1 rounded-lg border py-2.5 px-3 text-[var(--color-text)] shadow-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 sm:text-sm
            ${telefono && !isPhoneValid ? "border-red-400 focus:ring-red-300" : "border-[var(--color-border)]"}`}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      {showError && telefono && !isPhoneValid && (
        <p className="text-xs text-red-500 mt-1">
          Debe contener entre 7 y 15 dígitos.
        </p>
      )}
    </div>
  );
}
