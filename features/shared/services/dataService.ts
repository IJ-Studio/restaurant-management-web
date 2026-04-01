/**
 * features/shared/services/dataService.ts
 *
 * DATA SERVICE ENGINE - The Bridge to "La Base"
 * Manages Reading, Writing, and Persisting data across all restaurant modules.
 * Ensures consistent state between Admin, Client, and Kitchen.
 */

import { 
  STORAGE_KEYS, 
  INITIAL_MENU,
  INITIAL_INVENTORY,
  INITIAL_MERMAS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
  INITIAL_SETTINGS,
  INITIAL_STAFF,
  INITIAL_ROLES,
  INITIAL_SHIFTS,
  INITIAL_RESERVATIONS,
  type MenuCategory,
  type InventoryProduct,
  type Merma,
  type Order,
  type DiningTable,
  type TableStatus,
  type SystemSettings,
  type StaffMember,
  type Role,
  type Shift,
  type Reservation,
  type WaitlistItem,
  type CashierSession,
  type CashMovement,
  type DeliveryOrder,
  type Incidence,
  type AuditLog
} from "../data/restaurantData";

// ── GENERIC PERSISTENCE ─────────────────────────────────────────────────────

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving to storage for key ${key}:`, err);
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading from storage for key ${key}:`, err);
    return fallback;
  }
}

// ── MENU SERVICE ────────────────────────────────────────────────────────────

export const MenuService = {
  getMenu(): MenuCategory[] {
    return loadFromStorage(STORAGE_KEYS.MENU, INITIAL_MENU);
  },
  
  saveMenu(menu: MenuCategory[]): void {
    saveToStorage(STORAGE_KEYS.MENU, menu);
  },

  updateItem(categoryId: string, item: any): void {
    const menu = this.getMenu();
    const updated = menu.map(cat => {
      if (cat.id !== categoryId) return cat;
      const ex = cat.items.find(i => i.id === item.id);
      const items = ex 
        ? cat.items.map(i => i.id === item.id ? item : i)
        : [...cat.items, item];
      return { ...cat, items };
    });
    this.saveMenu(updated);
  }
};

// ── INVENTORY SERVICE ───────────────────────────────────────────────────────

export const InventoryService = {
  getInventory(): InventoryProduct[] {
    return loadFromStorage(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  },
  
  saveInventory(inventory: InventoryProduct[]): void {
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
  },

  updateStock(id: number, delta: number): void {
    const inv = this.getInventory();
    const updated = inv.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    this.saveInventory(updated);
  },

  saveProduct(product: InventoryProduct): void {
    const inv = this.getInventory();
    const exists = inv.find(p => p.id === product.id);
    const updated = exists 
      ? inv.map(p => p.id === product.id ? product : p)
      : [...inv, product];
    this.saveInventory(updated);
  },

  deleteProduct(id: number): void {
    const inv = this.getInventory();
    this.saveInventory(inv.filter(p => p.id !== id));
  }
};

// ── MERMA SERVICE ───────────────────────────────────────────────────────────

export const MermaService = {
  getMermas(): Merma[] {
    return loadFromStorage(STORAGE_KEYS.MERMAS, INITIAL_MERMAS);
  },

  saveMermas(mermas: Merma[]): void {
    saveToStorage(STORAGE_KEYS.MERMAS, mermas);
  },

  addMerma(merma: Merma): void {
    const mermas = this.getMermas();
    this.saveMermas([merma, ...mermas]);
    
    // Auto-update stock
    InventoryService.updateStock(merma.productId, -merma.quantity);
  }
};

// ── ORDER SERVICE ────────────────────────────────────────────────────────────

export const OrderService = {
  getOrders(): Order[] {
    return loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  saveOrders(orders: Order[]): void {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  },

  addOrder(order: Order): void {
    const orders = this.getOrders();
    this.saveOrders([order, ...orders]);
  },

  updateOrderStatus(id: string, status: Order["status"]): void {
    const orders = this.getOrders();
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    this.saveOrders(updated);
  }
};

// ── TABLE SERVICE ────────────────────────────────────────────────────────────

export const TableService = {
  getTables(): DiningTable[] {
    return loadFromStorage(STORAGE_KEYS.TABLES, INITIAL_TABLES);
  },

  saveTables(tables: DiningTable[]): void {
    saveToStorage(STORAGE_KEYS.TABLES, tables);
  },

  updateTableStatus(id: number | string, status: TableStatus, orderId?: string | null): void {
    const tables = this.getTables();
    const updated = tables.map(t => 
      t.id === id 
        ? { ...t, status, currentOrderId: orderId !== undefined ? orderId : t.currentOrderId } 
        : t
    );
    this.saveTables(updated);
  }
};

// ── SETTINGS SERVICE ─────────────────────────────────────────────────────────

export const SettingsService = {
  getSettings(): SystemSettings {
    return loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: SystemSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }
};

// ── STAFF & ACCESS SERVICES ────────────────────────────────────────────────

export const StaffService = {
  getStaff(): StaffMember[] {
    return loadFromStorage(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  saveStaff(staff: StaffMember[]): void {
    saveToStorage(STORAGE_KEYS.STAFF, staff);
  },

  upsertMember(member: StaffMember): void {
    const staff = this.getStaff();
    const exists = staff.find(m => m.id === member.id);
    const updated = exists 
      ? staff.map(m => m.id === member.id ? member : m)
      : [...staff, member];
    this.saveStaff(updated);
  },

  deleteMember(id: string): void {
    const staff = this.getStaff();
    this.saveStaff(staff.filter(m => m.id !== id));
  }
};

export const RoleService = {
  getRoles(): Role[] {
    return loadFromStorage(STORAGE_KEYS.ROLES, INITIAL_ROLES);
  },

  saveRoles(roles: Role[]): void {
    saveToStorage(STORAGE_KEYS.ROLES, roles);
  },

  upsertRole(role: Role): void {
    const roles = this.getRoles();
    const exists = roles.find(r => r.id === role.id);
    const updated = exists 
      ? roles.map(r => r.id === role.id ? role : r)
      : [...roles, role];
    this.saveRoles(updated);
  }
};

export const ShiftService = {
  getShifts(): Shift[] {
    return loadFromStorage(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  },

  saveShifts(shifts: Shift[]): void {
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
  },

  addShift(shift: Shift): string | null {
    // Basic validation for overlaps
    const shifts = this.getShifts();
    const employeeShifts = shifts.filter(s => s.employeeId === shift.employeeId && s.date === shift.date);
    
    for (const ex of employeeShifts) {
      if (
        (shift.startTime >= ex.startTime && shift.startTime < ex.endTime) ||
        (shift.endTime > ex.startTime && shift.endTime <= ex.endTime) ||
        (ex.startTime >= shift.startTime && ex.startTime < shift.endTime)
      ) {
        return "El empleado ya tiene un turno asignado en ese horario.";
      }
    }

    this.saveShifts([...shifts, shift]);
    return null;
  },

  deleteShift(id: string): void {
    const shifts = this.getShifts();
    this.saveShifts(shifts.filter(s => s.id !== id));
  }
};

export const IncidenceService = {
  getIncidences(): Incidence[] {
    return loadFromStorage(STORAGE_KEYS.INCIDENCES, []);
  },

  addIncidence(inc: Incidence): void {
    const list = this.getIncidences();
    saveToStorage(STORAGE_KEYS.INCIDENCES, [inc, ...list]);
  }
};

export const AuditService = {
  getLogs(): AuditLog[] {
    return loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  logAction(userId: string, action: string, details: string): void {
    const logs = this.getLogs();
    const newEntry: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newEntry, ...logs]);
  }
};

// ── RESERVATION SERVICE ─────────────────────────────────────────────────────

export const ReservationService = {
  getReservations(): Reservation[] {
    return loadFromStorage(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  },

  saveReservations(reservations: Reservation[]): void {
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
  },

  upsertReservation(res: Reservation): void {
    const list = this.getReservations();
    const exists = list.find(r => r.id === res.id);
    const updated = exists 
      ? list.map(r => r.id === res.id ? res : r)
      : [res, ...list];
    this.saveReservations(updated);
  },

  cancelReservation(id: string): void {
    const list = this.getReservations();
    const updated = list.map(r => r.id === id ? { ...r, status: "cancelada" as const } : r);
    this.saveReservations(updated);
  },

  checkAvailability(date: string, time: string, tableId: number | string): boolean {
    const reservations = this.getReservations();
    // Validar si existe una reserva confirmada para la misma mesa en el mismo horario
    // (Simplificación: bloqueo de 1.5 horas por reserva)
    const newTime = new Date(`${date}T${time}`).getTime();
    const range = 90 * 60 * 1000; // 90 min

    return !reservations.some(r => {
      if (r.status !== "confirmada" || r.tableId !== tableId || r.date !== date) return false;
      const resTime = new Date(`${r.date}T${r.startTime}`).getTime();
      return Math.abs(newTime - resTime) < range;
    });
  }
};

// ── WAITLIST SERVICE ────────────────────────────────────────────────────────

export const WaitlistService = {
  getWaitlist(): WaitlistItem[] {
    return loadFromStorage(STORAGE_KEYS.WAITLIST, []);
  },

  saveWaitlist(items: WaitlistItem[]): void {
    saveToStorage(STORAGE_KEYS.WAITLIST, items);
  },

  addEntry(entry: WaitlistItem): void {
    const list = this.getWaitlist();
    this.saveWaitlist([...list, entry]);
  },

  updateStatus(id: string, status: WaitlistItem["status"]): void {
    const list = this.getWaitlist();
    this.saveWaitlist(list.map(i => i.id === id ? { ...i, status } : i));
  },

  removeEntry(id: string): void {
    const list = this.getWaitlist();
    this.saveWaitlist(list.filter(i => i.id !== id));
  }
};

// ── CASHIER SERVICE ─────────────────────────────────────────────────────────

export const CashierService = {
  getSessions(): CashierSession[] {
    return loadFromStorage(STORAGE_KEYS.CASHIER, []);
  },

  getActiveSession(): CashierSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.status === "abierta") || null;
  },

  openSession(userId: string, initialAmount: number): CashierSession {
    const sessions = this.getSessions();
    const newSession: CashierSession = {
      id: `CASH-${Date.now()}`,
      userId,
      openedAt: new Date().toISOString(),
      initialAmount,
      status: "abierta",
      movements: []
    };
    saveToStorage(STORAGE_KEYS.CASHIER, [newSession, ...sessions]);
    return newSession;
  },

  addMovement(amount: number, type: CashMovement["type"], reason: string): void {
    const active = this.getActiveSession();
    if (!active) return;

    const movement: CashMovement = {
      id: `MOV-${Date.now()}`,
      amount,
      type,
      reason,
      timestamp: new Date().toISOString()
    };
    
    active.movements.push(movement);
    const sessions = this.getSessions();
    saveToStorage(STORAGE_KEYS.CASHIER, sessions.map(s => s.id === active.id ? active : s));
  },

  closeSession(finalAmount: number): void {
    const active = this.getActiveSession();
    if (!active) return;

    active.status = "cerrada";
    active.closedAt = new Date().toISOString();
    active.finalAmount = finalAmount;
    
    const sessions = this.getSessions();
    saveToStorage(STORAGE_KEYS.CASHIER, sessions.map(s => s.id === active.id ? active : s));
  }
};

// ── DELIVERY SERVICE ────────────────────────────────────────────────────────

export const DeliveryService = {
  getDeliveries(): DeliveryOrder[] {
    return loadFromStorage(STORAGE_KEYS.DELIVERIES, []);
  },

  updateDelivery(orderId: string, status: DeliveryOrder["deliveryStatus"], driverId?: string): void {
    const list = this.getDeliveries();
    const updated = list.map(o => 
      o.id === orderId 
        ? { ...o, deliveryStatus: status, driverId: driverId || o.driverId } 
        : o
    );
    saveToStorage(STORAGE_KEYS.DELIVERIES, updated);
  },

  addDelivery(order: DeliveryOrder): void {
    const list = this.getDeliveries();
    saveToStorage(STORAGE_KEYS.DELIVERIES, [...list, order]);
  }
};
