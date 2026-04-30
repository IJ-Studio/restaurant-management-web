import { useState, useEffect, useCallback } from "react";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: any;
  unit: any;
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
  unit: any;
  reason: any;
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
      const [resP, resM, resS, resO] = await Promise.all([
        fetch("/api/inventory/products"),
        fetch("/api/inventory/mermas"),
        fetch("/api/inventory/suppliers"),
        fetch("/api/inventory/orders"),
      ]);

      if (!resP.ok || !resM.ok || !resS.ok || !resO.ok) {
        throw new Error("Failed to fetch inventory data");
      }

      const [dataP, dataM, dataS, dataO] = await Promise.all([
        resP.json(),
        resM.json(),
        resS.json(),
        resO.json(),
      ]);

      setProducts(dataP.map((p: any) => ({
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
      setMermas(dataM.map((m: any) => ({
        ...m,
        quantity: Number(m.quantity),
        cost: Number(m.cost)
      })));
      setSuppliers(dataS.map((s: any) => ({
        ...s,
        deliveryDays: Number(s.deliveryDays)
      })));
      setOrders(dataO.map((o: any) => ({
        ...o,
        total: Number(o.total),
        items: o.items.map((i: any) => ({
          ...i,
          quantity: Number(i.quantity),
          unitCost: Number(i.unitCost)
        }))
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutations
  const saveProduct = async (p: Product) => {
    const method = p.id && p.id !== 0 ? "PUT" : "POST";
    const res = await fetch("/api/inventory/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!res.ok) throw new Error("Could not save product");
    await fetchData();
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`/api/inventory/products?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Could not delete product");
    await fetchData();
  };

  const adjustStock = async (id: number, stock: number) => {
    const res = await fetch(`/api/inventory/products/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock }),
    });
    if (!res.ok) throw new Error("Could not adjust stock");
    await fetchData();
  };

  const saveMerma = async (m: Merma) => {
    const res = await fetch("/api/inventory/mermas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m),
    });
    if (!res.ok) throw new Error("Could not save merma");
    await fetchData();
  };

  const saveSupplier = async (s: Supplier) => {
    const method = s.id && s.id !== 0 ? "PUT" : "POST";
    const res = await fetch("/api/inventory/suppliers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    if (!res.ok) throw new Error("Could not save supplier");
    await fetchData();
  };

  const deleteSupplier = async (id: number) => {
    const res = await fetch(`/api/inventory/suppliers?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Could not delete supplier");
    await fetchData();
  };

  const saveOrder = async (o: PurchaseOrder) => {
    const method = o.id && o.id !== 0 ? "PUT" : "POST";
    const res = await fetch("/api/inventory/orders", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    });
    if (!res.ok) throw new Error("Could not save order");
    await fetchData();
  };

  const deleteOrder = async (id: number) => {
    const res = await fetch(`/api/inventory/orders?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Could not delete order");
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
    saveMerma,
    saveSupplier,
    deleteSupplier,
    saveOrder,
    deleteOrder,
    refreshInventory: fetchData,
  };
}