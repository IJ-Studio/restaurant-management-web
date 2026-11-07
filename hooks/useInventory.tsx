import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api";

/**
 * Inventario del administrador contra el API (`/inventario/admin/*`; las mermas solo se consultan:
 * las registra el personal operativo, P1.2), el mismo que usa la móvil). Antes pasaba por rutas internas de la web que escribían en la BD sin
 * comprobar el rol (D-32). Cada cuerpo lleva solo los campos que acepta el DTO del API.
 */

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  supplierId?: number;
  lastUpdated: string;
  active: boolean;
}

export interface Merma {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
  justification: string;
  reportedBy: string;
  date: string;
  cost: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  products: string[];
  paymentTerms: string;
  deliveryDays: number;
  active: boolean;
  website?: string;
  address?: string;
  notes?: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export type OrderStatus =
  | "borrador"
  | "enviada"
  | "confirmada"
  | "en_camino"
  | "recibida"
  | "cancelada";

export interface PurchaseOrder {
  id: number;
  folio: string;
  supplierId: number;
  supplierName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  expectedAt?: string;
  receivedAt?: string;
  notes?: string;
}

/** Cifra tal como llega del API: los numéricos de Postgres pueden venir como texto. */
type Cifra = number | string;
type ProductoApi = Omit<Product, "stock" | "minStock" | "maxStock" | "costPerUnit" | "supplierId"> & {
  stock: Cifra;
  minStock: Cifra;
  maxStock: Cifra;
  costPerUnit: Cifra;
  supplierId?: Cifra | null;
};
type MermaApi = Omit<Merma, "quantity" | "cost"> & { quantity: Cifra; cost: Cifra };
type ProveedorApi = Omit<Supplier, "deliveryDays"> & { deliveryDays: Cifra };
type OrdenApi = Omit<PurchaseOrder, "total" | "items"> & {
  total: Cifra;
  items: (Omit<OrderItem, "quantity" | "unitCost"> & { quantity: Cifra; unitCost: Cifra })[];
};

// ─── Hook Implementation ───────────────────────────────────────────────────────

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Explicitly don't set loading to true here to avoid flickering on updates
    try {
      const [dataP, dataM, dataS, dataO] = await Promise.all([
        api.get<ProductoApi[]>("/inventario/admin/productos"),
        api.get<MermaApi[]>("/inventario/admin/mermas"),
        api.get<ProveedorApi[]>("/inventario/admin/proveedores"),
        api.get<OrdenApi[]>("/inventario/admin/ordenes"),
      ]);

      setProducts(dataP.map((p) => ({
        ...p,
        stock: Number(p.stock),
        minStock: Number(p.minStock),
        maxStock: Number(p.maxStock),
        costPerUnit: Number(p.costPerUnit),
        supplierId:
          p.supplierId != null && p.supplierId !== ""
            ? Number(p.supplierId)
            : undefined,
      })));
      setMermas(dataM.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        cost: Number(m.cost)
      })));
      setSuppliers(dataS.map((s) => ({
        ...s,
        deliveryDays: Number(s.deliveryDays)
      })));
      setOrders(dataO.map((o) => ({
        ...o,
        total: Number(o.total),
        items: o.items.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unitCost: Number(i.unitCost)
        }))
      })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fuera del cuerpo del efecto (react-hooks/set-state-in-effect): la misma carga, una microtarea después.
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  /** Vuelve a pedir todo mostrando la carga (botón «Reintentar», PLAN 5.7). */
  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchData();
  }, [fetchData]);

  // Mutations
  const saveProduct = async (p: Product) => {
    const cuerpo = {
      name: p.name, sku: p.sku, category: p.category, unit: p.unit, stock: p.stock, minStock: p.minStock,
      maxStock: p.maxStock, costPerUnit: p.costPerUnit, supplier: p.supplier, active: p.active,
    };
    if (p.id) await api.patch(`/inventario/admin/productos/${p.id}`, cuerpo);
    else await api.post("/inventario/admin/productos", cuerpo);
    await fetchData();
  };

  const deleteProduct = async (id: number) => {
    await api.delete(`/inventario/admin/productos/${id}`);
    await fetchData();
  };

  const adjustStock = async (id: number, stock: number) => {
    await api.post(`/inventario/admin/productos/${id}/ajuste`, { stock });
    await fetchData();
  };

  const saveSupplier = async (s: Supplier) => {
    const cuerpo = {
      name: s.name, contact: s.contact, email: s.email, phone: s.phone, category: s.category, products: s.products,
      paymentTerms: s.paymentTerms, deliveryDays: s.deliveryDays, active: s.active, website: s.website, address: s.address, notes: s.notes,
    };
    if (s.id) await api.patch(`/inventario/admin/proveedores/${s.id}`, cuerpo);
    else await api.post("/inventario/admin/proveedores", cuerpo);
    await fetchData();
  };

  const deleteSupplier = async (id: number) => {
    await api.delete(`/inventario/admin/proveedores/${id}`);
    await fetchData();
  };

  // El total y el folio los calcula el API.
  const saveOrder = async (o: PurchaseOrder) => {
    const cuerpo = {
      supplierId: o.supplierId || null, status: o.status, expectedAt: o.expectedAt || null, notes: o.notes || null,
      items: o.items.map((i) => ({ productName: i.productName, quantity: i.quantity, unit: i.unit, unitCost: i.unitCost })),
    };
    if (o.id) await api.patch(`/inventario/admin/ordenes/${o.id}`, cuerpo);
    else await api.post("/inventario/admin/ordenes", cuerpo);
    await fetchData();
  };

  const deleteOrder = async (id: number) => {
    await api.delete(`/inventario/admin/ordenes/${id}`);
    await fetchData();
  };

  return {
    products,
    mermas,
    suppliers,
    orders,
    loading,
    error,
    saveProduct,
    deleteProduct,
    adjustStock,
    saveSupplier,
    deleteSupplier,
    saveOrder,
    deleteOrder,
    refreshInventory: fetchData,
    recargar,
  };
}