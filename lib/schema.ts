import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── TABLA DE ROLES ───────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TABLA DE USUARIOS ────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  lastname: varchar("lastname", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => roles.id),
  isVerified: boolean("verified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  loginLockUntil: bigint("login_lock_until", { mode: "number" }).default(0).notNull(),
  recoveryAttempts: integer("recovery_attempts").default(0).notNull(),
  recoveryLockUntil: bigint("recovery_lock_until", { mode: "number" }).default(0).notNull(),
  timeSession: bigint("session_time", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TIPOS INFERIDOS ─────────────────────────────────────────────────────────
// ─── TABLA DE BACKUPS ─────────────────────────────────────────────────────────
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).default(0).notNull(),
  driveFileId: varchar("drive_file_id", { length: 200 }),
  driveUrl: varchar("drive_url", { length: 500 }),
  type: varchar("type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  errorMessage: text("error_message"),
  tables: jsonb("tables"),
  rowCount: integer("row_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TIPOS INFERIDOS ─────────────────────────────────────────────────────────
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Backup = typeof backups.$inferSelect;
export type NewBackup = typeof backups.$inferInsert;