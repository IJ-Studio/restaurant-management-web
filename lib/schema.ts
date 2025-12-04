import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  bigint,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(), // serial crea números autoincrementales
  name: varchar("name", { length: 50 }).notNull(),
  lastname: varchar("lastname", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  isVerified: boolean("verified").default(false).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  loginLockUntil: bigint("login_lock_until", { mode: "number" }).default(0).notNull(), //ms
  recoveryAttempts: integer("recovery_attempts").default(0).notNull(),
  recoveryLockUntil: bigint("recovery_lock_until", { mode: "number" }).default(0).notNull(),
  timeSession: bigint("session time", { mode: "number" }).default(0).notNull(), //ms
});
