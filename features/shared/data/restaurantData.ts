/**
 * features/shared/data/restaurantData.ts
 *
 * THE "BASE" - Single Source of Truth for the whole restaurant.
 * All modules (Admin, Cashier, Kitchen, Client) must consume and
 * update this data through a unified service.
 */

// ── TYPES ──────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: number | string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  tags?: string[];
  prepTime?: number;
  calories?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

export interface InventoryProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  lastUpdated: string;
  active: boolean;
}

export interface Merma {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  reason: "caducidad" | "accidente" | "calidad" | "coccion" | "otro";
  justification: string;
  reportedBy: string;
  date: string;
  cost: number;
}

export interface OrderItem {
  name: string;
  qty: number;
  notes: string;
}

export interface Order {
  id: string;
  table: string;
  timestamp: string;
  status: "nuevo" | "preparando" | "listo";
  items: OrderItem[];
  total: number;
  customerName?: string;
  isPaid?: boolean;
}

export type TableStatus = "libre" | "ocupada" | "lista";

export interface DiningTable {
  id: number | string;
  name: string;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string | null;
  lastUpdate?: string;
}

export interface SystemAppearance {
  primaryColor: string;
  secondaryColor: string;
  fontDisplay: string;
  fontBody: string;
  borderRadius: "none" | "small" | "medium" | "large" | "full";
}

export interface SystemSettings {
  restaurantIco: string;
  restaurantLogo: string;
  restaurantLogo_light:string;
  restaurantLogo_dark:string;
  restaurantName: string;
  shortName: string;
  tagline: string;
  logoEmoji: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  featuredCategoryIds: string[];
  appearance: SystemAppearance;
  loginBgImageUrl: string;
  registerBgImageUrl: string;
}

export interface StaffMember {
  id: string; // EmpleadoID
  name: string;
  lastname: string;
  documentId: string; // DocumentoIdentidad
  birthDate: string;
  hireDate: string; // FechaIngreso
  position: string; // Cargo
  area: "cocina" | "salón" | "barra" | "limpieza" | "administración";
  contractType: "tiempo completo" | "medio tiempo" | "eventual";
  email: string; // CorreoCorporativo
  phone: string;
  status: "activo" | "inactivo" | "suspendido";
  salary: number; // SalarioBase
  roleId: string; // RolID del sistema
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // ModuloID o AccionID
}

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  employeeId: string;
  type: "apertura" | "intermedio" | "cierre" | "especial";
}

export interface Incidence {
  id: string;
  employeeId: string;
  date: string;
  time: string;
  type: "operativa" | "rendimiento" | "asistencia" | "otra";
  description: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  guests: number;
  tableId?: number | string;
  status: "pendiente" | "confirmada" | "modificada" | "cancelada";
  notes?: string;
  requirements?: string;
  createdAt: string;
}

export interface WaitlistItem {
  id: string;
  customerName: string;
  guests: number;
  arrivalTime: string;
  estimatedWaitMinutes: number;
  status: "esperando" | "notificado" | "atendido" | "cancelado";
  phone?: string;
}

export interface CashMovement {
  id: string;
  type: "ingreso" | "egreso" | "venta";
  amount: number;
  reason: string;
  timestamp: string;
}

export interface CashierSession {
  id: string;
  userId: string;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount?: number;
  status: "abierta" | "cerrada";
  movements: CashMovement[];
}

export interface DeliveryOrder extends Order {
  address: string;
  deliveryStatus: "listo" | "en_camino" | "entregado";
  driverId?: string;
  assignedAt?: string;
}

// ── INITIAL DATA (MOCKS) ────────────────────────────────────────────────────

export const INITIAL_MENU: MenuCategory[] = [
  {
    id: "entradas",
    name: "Entradas",
    icon: "🥗",
    color: "#e85d04",
    items: [
      { id: 101, name: "Guacamole Quijote", description: "Receta secreta con totopos", price: 125, category: "entradas", available: true, tags: ["popular", "vegano"], prepTime: 5, image: "/images/menu/guacamole.jpg" },
      { id: 102, name: "Queso Fundido", description: "Con chorizo y tortillas", price: 140, category: "entradas", available: true, prepTime: 8 },
    ]
  },
  {
    id: "fuertes",
    name: "Platos Fuertes",
    icon: "🥩",
    color: "#2563eb",
    items: [
      { id: 201, name: "Corte New York", description: "300g de calidad sonora", price: 450, category: "fuertes", available: true, tags: ["premium"], prepTime: 20 },
      { id: 202, name: "Enchiladas Huastecas", description: "Con cecina y queso fresco", price: 210, category: "fuertes", available: true, tags: ["tradicion"], prepTime: 12 },
    ]
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: "🍹",
    color: "#0ea5e9",
    items: [
      { id: 301, name: "Margarita Clásica", description: "Tequila reposado y limón", price: 110, category: "bebidas", available: true, prepTime: 5 },
      { id: 302, name: "Agua de Jamaica", description: "Natural y refrescante", price: 45, category: "bebidas", available: true, prepTime: 2 },
    ]
  }
];

export const INITIAL_INVENTORY: InventoryProduct[] = [
  { id: 1, sku: "MT-CEB-01", name: "Cebolla Morada", category: "vegetales", stock: 12, unit: "kg", minStock: 5, maxStock: 30, costPerUnit: 18, supplier: "Frutas Hdz", lastUpdated: "2026-03-30", active: true },
  { id: 2, sku: "MT-CAR-01", name: "Cecina de Res", category: "carnes", stock: 8, unit: "kg", minStock: 10, maxStock: 40, costPerUnit: 220, supplier: "Carnicería Real", lastUpdated: "2026-03-31", active: true },
  { id: 3, sku: "MT-AB-01", name: "Agua de Jamaica", category: "bebidas", stock: 25, unit: "L", minStock: 5, maxStock: 60, costPerUnit: 12, supplier: "Distribuidora Quijote", lastUpdated: "2026-03-31", active: true },
  { id: 4, sku: "MT-LACT-01", name: "Queso Manchego", category: "lacteos", stock: 6, unit: "kg", minStock: 3, maxStock: 15, costPerUnit: 180, supplier: "Lácteos del Norte", lastUpdated: "2026-03-25", active: true },
];

export const INITIAL_MERMAS: Merma[] = [
  {
    id: 1,
    productId: 1,
    productName: "Cebolla Morada",
    quantity: 1.5,
    unit: "kg",
    reason: "calidad",
    justification: "Llegó en mal estado del proveedor",
    reportedBy: "Luis Chef",
    date: "2026-03-28",
    cost: 27
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "#9024",
    table: "Barra 1",
    timestamp: "2 min",
    status: "nuevo",
    items: [
      { name: "Guacamole Quijote", qty: 1, notes: "Sin cebolla" },
      { name: "Agua de Jamaica", qty: 1, notes: "" },
    ],
    total: 170,
  },
  {
    id: "#9023",
    table: "Mesa 3",
    timestamp: "8 min",
    status: "preparando",
    items: [
      { name: "Corte New York", qty: 2, notes: "Término medio" },
      { name: "Margarita Clásica", qty: 2, notes: "" },
    ],
    total: 1120,
  },
];

export const INITIAL_TABLES: DiningTable[] = [
  { id: 1, name: "Mesa 1", status: "libre", capacity: 4 },
  { id: 2, name: "Mesa 2", status: "ocupada", capacity: 2, currentOrderId: "#9021" },
  { id: 3, name: "Mesa 3", status: "ocupada", capacity: 4, currentOrderId: "#9023" },
  { id: 4, name: "Mesa 4", status: "libre", capacity: 6 },
  { id: 5, name: "Mesa 5", status: "lista", capacity: 4, currentOrderId: "#9018" },
  { id: 6, name: "Mesa 6", status: "libre", capacity: 2 },
  { id: 7, name: "Barra 1", status: "ocupada", capacity: 1, currentOrderId: "#9024" },
  { id: 8, name: "Terraza 1", status: "libre", capacity: 4 },
];

export const INITIAL_SETTINGS: SystemSettings = {
  restaurantIco:
    "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1776136090/logo_wgyijz.ico",
  restaurantLogo:
    "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1775662960/logo_text_white_ktnpgg.png",
  restaurantLogo_light:
    "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1776056964/logo_dark_fvfcdk.svg",
  restaurantLogo_dark:
    "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1776056964/logo_light_xy8ce1.svg",
  restaurantName: "El Quijote",
  shortName: "Q",
  tagline: "Sabor con Alma",
  logoEmoji: "",
  heroTitle: "Bienvenido a Casa",
  heroSubtitle: "¿Qué delicia te gustaría probar hoy?",
  heroButtonText: "Ver Menú Completo",
  featuredCategoryIds: ["entradas", "fuertes", "bebidas"],
  appearance: {
    primaryColor: "#e85d04",
    secondaryColor: "#1a1208",
    fontDisplay: "Fraunces",
    fontBody: "DM Sans",
    borderRadius: "medium",
  },
  loginBgImageUrl: "food-3955317_1280_zstvf7.jpg",
  registerBgImageUrl: "meal-4840665_1280_azmrqq.jpg",
};

export const INITIAL_ROLES: Role[] = [
  { id: "admin", name: "Administrador", description: "Acceso total al sistema", permissions: ["dashboard", "usuarios", "menu", "inventario", "finanzas", "reportes", "configuracion", "cocina", "pedidos", "mesero"] },
  { id: "mesero", name: "Mesero", description: "Toma y gestión de pedidos", permissions: ["dashboard", "pedidos", "menu", "mesas"] },
  { id: "cajero", name: "Cajero", description: "Caja, pedidos y facturación", permissions: ["dashboard", "pedidos", "finanzas", "menu"] },
  { id: "cocinero", name: "Cocinero", description: "Preparación de platillos", permissions: ["dashboard", "cocina", "menu"] },
  { id: "repartidor", name: "Repartidor", description: "Gestión de entregas", permissions: ["dashboard", "pedidos"] },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "EMP-001",
    name: "Carlos",
    lastname: "Mendoza",
    documentId: "DNI-12345678",
    birthDate: "1990-05-15",
    hireDate: "2023-01-10",
    position: "Cajero Principal",
    area: "administración",
    contractType: "tiempo completo",
    email: "carlos@quijote.mx",
    phone: "771-123-4567",
    status: "activo",
    salary: 8500,
    roleId: "cajero"
  },
  {
    id: "EMP-002",
    name: "Ana",
    lastname: "Reyes",
    documentId: "DNI-87654321",
    birthDate: "1995-08-20",
    hireDate: "2023-03-01",
    position: "Mesera Senior",
    area: "salón",
    contractType: "tiempo completo",
    email: "ana@quijote.mx",
    phone: "771-234-5678",
    status: "activo",
    salary: 7200,
    roleId: "mesero"
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: "SH-001", date: "2026-04-01", startTime: "08:00", endTime: "16:00", zone: "Salón Principal", employeeId: "EMP-002", type: "apertura" },
  { id: "SH-002", date: "2026-04-01", startTime: "09:00", endTime: "17:00", zone: "Caja", employeeId: "EMP-001", type: "apertura" },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "RES-001",
    customerName: "Laura Martínez",
    customerPhone: "555-0101",
    customerEmail: "laura@example.com",
    date: "2026-04-01",
    startTime: "20:00",
    guests: 4,
    status: "pendiente",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // Hace 1 hora
  },
  {
    id: "RES-002",
    customerName: "Roberto Gómez",
    customerPhone: "555-0102",
    customerEmail: "roberto@example.com",
    date: "2026-04-01",
    startTime: "21:30",
    guests: 2,
    tableId: 1,
    status: "confirmada",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // Hace 2 horas
  }
];

export const STORAGE_KEYS = {
  MENU: "restaurant_menu",
  INVENTORY: "restaurant_inventory",
  ORDERS: "restaurant_orders",
  TABLES: "restaurant_tables",
  MERMAS: "restaurant_mermas",
  USERS: "restaurant_users",
  STAFF: "restaurant_staff",
  ROLES: "restaurant_roles",
  SHIFTS: "restaurant_shifts",
  INCIDENCES: "restaurant_incidences",
  AUDIT_LOGS: "restaurant_audit_logs",
  FINANCE: "restaurant_finance",
  SETTINGS: "restaurant_settings",
  RESERVATIONS: "restaurant_reservations",
  WAITLIST: "restaurant_waitlist",
  CASHIER: "restaurant_cashier",
  DELIVERIES: "restaurant_deliveries",
} as const;
