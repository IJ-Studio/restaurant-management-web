/**
 * types/ui.ts
 *
 * UI primitive types — Button, Badge, Input variants, etc.
 * Replaces the old types/ButtonProps.tsx (wrong extension, weak typing).
 */

// ── Button ────────────────────────────────────────────────────────────────
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconPosition?: "left" | "right";
}

// ── Badge ─────────────────────────────────────────────────────────────────
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// ── Modal ─────────────────────────────────────────────────────────────────
export interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  className?: string;
}
