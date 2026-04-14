"use client";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
}: CheckboxProps) {
  return (
    <div className="flex items-start pt-1 pb-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-[var(--color-secondary)] border-[var(--color-border)] rounded focus:ring-[var(--color-brand)]"
      />
      <label
        htmlFor={id}
        className="ml-3 text-sm font-light text-[var(--color-text-sec)]"
      >
        {label}
      </label>
    </div>
  );
}
