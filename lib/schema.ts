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
  numeric,
  json
} from "drizzle-orm/pg-core";

// ─── TABLA DE ROLES ───────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TABLA DE PUESTOS ─────────────────────────────────────────────────────────
export const puestos = pgTable("puestos", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  descripcion: text("descripcion"),
  salarioBase: numeric("salario_base", { precision: 10, scale: 2 }),
  departamento: varchar("departamento", { length: 100 }),
  activo: boolean("activo").default(true),
  createdAt: timestamp("creado_en").defaultNow()
});

// ─── TABLA DE EMPLEADOS ───────────────────────────────────────────────────────
import { uuid, date } from "drizzle-orm/pg-core";

export const empleados = pgTable("empleados", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }).unique(),
  puestoId: integer("puesto_id").references(() => puestos.id),
  numeroEmpleado: varchar("numero_empleado", { length: 20 }).unique(),
  fotoUrl: text("foto_url"),
  fechaNacimiento: date("fecha_nacimiento", { mode: 'string' }),
  genero: varchar("genero", { length: 20 }),
  estadoCivil: varchar("estado_civil", { length: 20 }),
  curp: varchar("curp", { length: 18 }).unique(),
  nss: varchar("nss", { length: 15 }).unique(),
  rfcEmpleado: varchar("rfc_empleado", { length: 13 }).unique(),
  telefonoEmergencia: varchar("telefono_emergencia", { length: 20 }),
  contactoEmergencia: varchar("contacto_emergencia", { length: 150 }),
  direccionEmpleado: text("direccion_empleado"),
  fechaIngreso: date("fecha_ingreso", { mode: 'string' }),
  fechaBaja: date("fecha_baja", { mode: 'string' }),
  tipoContrato: varchar("tipo_contrato", { length: 50 }),
  jornada: varchar("jornada", { length: 30 }),
  salarioMensual: numeric("salario_mensual", { precision: 10, scale: 2 }),
  banco: varchar("banco", { length: 80 }),
  clabeInterbancaria: varchar("clabe_interbancaria", { length: 18 }),
  activo: boolean("activo").default(true),
  notas: text("notas"),
  createdAt: timestamp("creado_en").defaultNow(),
  updatedAt: timestamp("actualizado_en").defaultNow(),
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

// ─── TABLA DE PRODUCTOS (INVENTARIO) ─────────────────────────────────────────
export const products = pgTable("inventario_productos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: varchar("sku", { length: 50 }).notNull().default(""),
  category: varchar("category", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("pza"),
  stock: numeric("stock", { precision: 10, scale: 3 }).notNull().default("0"),
  minStock: numeric("min_stock", { precision: 10, scale: 3 }).notNull().default("0"),
  maxStock: numeric("max_stock", { precision: 10, scale: 3 }).notNull().default("100"),
  costPerUnit: numeric("cost_per_unit", { precision: 10, scale: 2 }).notNull().default("0"),
  supplier: text("supplier").notNull().default(""),
  active: boolean("active").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── TABLA DE MERMAS ─────────────────────────────────────────────────────────
export const mermas = pgTable("inventario_mermas", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  justification: text("justification").notNull(),
  reportedBy: text("reported_by").notNull().default(""),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── TABLA DE PROVEEDORES ───────────────────────────────────────────────────
export const suppliers = pgTable("inventario_proveedores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  website: text("website"),
  address: text("address"),
  category: text("category").notNull().default(""),
  products: json("products").$type<string[]>().notNull().default([]),
  paymentTerms: text("payment_terms").notNull().default("Contado"),
  deliveryDays: integer("delivery_days").notNull().default(1),
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── TABLA DE ÓRDENES DE COMPRA ──────────────────────────────────────────────
export const purchaseOrders = pgTable("inventario_ordenes", {
  id: serial("id").primaryKey(),
  folio: varchar("folio", { length: 30 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("borrador"),
  items: json("items").$type<{
    productName: string; quantity: number; unit: string; unitCost: number;
  }[]>().notNull().default([]),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  expectedAt: text("expected_at"),
  receivedAt: text("received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── TABLA DE CONFIGURACIONES DEL SISTEMA ────────────────────────────────────
export const settings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── TIPOS INFERIDOS ─────────────────────────────────────────────────────────
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Puesto = typeof puestos.$inferSelect;
export type NewPuesto = typeof puestos.$inferInsert;
export type Empleado = typeof empleados.$inferSelect;
export type NewEmpleado = typeof empleados.$inferInsert;
export type Backup = typeof backups.$inferSelect;
export type NewBackup = typeof backups.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Merma = typeof mermas.$inferSelect;
export type NewMerma = typeof mermas.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;