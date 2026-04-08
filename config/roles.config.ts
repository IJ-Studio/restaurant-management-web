/**
 * config/roles.config.ts
 *
 * Role definitions aligned with backend roleId values
 * Used for type-safe role checking and UI rendering
 */

export const ROLES = {
  ADMIN: 1,
  CAJERO: 2,
  MESERO: 3,
  COCINA: 4,
  CLIENTE: 5,
} as const;

export const ROLE_NAMES: Record<number, string> = {
  1: "admin",
  2: "cajero",
  3: "mesero",
  4: "cocina",
  5: "cliente",
};

export const ROLE_LABELS: Record<number, string> = {
  1: "Administrador",
  2: "Cajero",
  3: "Mesero",
  4: "Cocina",
  5: "Cliente",
};

// Roles que el admin puede crear (excluye admin)
export const CREATABLE_ROLES = [2, 3, 4, 5] as const;

// Mapeo inverso: nombre → roleId
export const ROLE_IDS: Record<string, number> = {
  admin: 1,
  cajero: 2,
  mesero: 3,
  cocina: 4,
  cliente: 5,
};

// Type-safe role type
export type RoleId = (typeof ROLES)[keyof typeof ROLES];
export type RoleName = keyof typeof ROLE_IDS;
