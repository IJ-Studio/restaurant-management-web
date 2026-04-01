"use client";

import { forwardRef } from "react";
import type { ButtonProps } from "@/types";

/**
 * Button — primitive UI component with variants.
 *
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleSave}>
 *   Guardar
 * </Button>
 *
 * <Button variant="danger" loading={isDeleting} icon={<Trash size={16} />}>
 *   Eliminar
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // ── Base styles ──────────────────────────────────────────────────────
    const base =
      "inline-flex items-center justify-center gap-2 font-bold rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[.97] select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

    // ── Variant styles ───────────────────────────────────────────────────
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-brand text-white border-brand hover:bg-brand-dark shadow-md shadow-brand/20 focus-visible:ring-brand",
      secondary:
        "bg-surface-alt text-text border-border hover:bg-border focus-visible:ring-brand",
      ghost:
        "bg-transparent text-text-sec border-transparent hover:bg-surface-alt focus-visible:ring-brand",
      danger:
        "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 focus-visible:ring-red-600",
      outline:
        "bg-transparent text-brand border-brand hover:bg-brand hover:text-white focus-visible:ring-brand",
    };

    // ── Size styles ──────────────────────────────────────────────────────
    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8  px-3  text-xs",
      md: "h-10 px-5  text-sm",
      lg: "h-12 px-7  text-base",
    };

    const classes = [base, variants[variant], sizes[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} disabled={isDisabled} className={classes} {...props}>
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        {/* Icon left */}
        {!loading && icon && iconPosition === "left" && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Label */}
        {children && <span>{children}</span>}

        {/* Icon right */}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
