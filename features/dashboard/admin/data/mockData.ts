/**
 * features/dashboard/admin/data/mockData.ts
 *
 * Datos ficticios para el dashboard de administración.
 * TODO: Eliminar esto y reemplazar por hooks/llamadas a la API real.
 */

export const ORDERS = [
  {
    id: "#0241",
    customer: "Marcos Díaz",
    item: "Filete de res al vino",
    table: "Mesa 3",
    status: "pendiente",
    total: 285,
    time: "23:41",
  },
  {
    id: "#0240",
    customer: "Elena Smith",
    item: "Paella valenciana ×2",
    table: "Mesa 7",
    status: "en_preparacion",
    total: 560,
    time: "23:38",
  },
  {
    id: "#0239",
    customer: "Roberto Gil",
    item: "Costillas BBQ",
    table: "Mesa 1",
    status: "completado",
    total: 250,
    time: "23:22",
  },
  {
    id: "#0238",
    customer: "Lucía Fernández",
    item: "Pizza española + postre",
    table: "Domicilio",
    status: "en_camino",
    total: 340,
    time: "23:15",
  },
  {
    id: "#0237",
    customer: "Carlos Mendoza",
    item: "Menú degustación ×3",
    table: "Mesa 5",
    status: "completado",
    total: 1350,
    time: "22:58",
  },
  {
    id: "#0236",
    customer: "Ana Reyes",
    item: "Crema champiñones + vino",
    table: "Mesa 2",
    status: "completado",
    total: 430,
    time: "22:47",
  },
];

export const ORDER_STATUS: Record<
  string,
  { label: string; colorClass: string; bgClass: string; dotClass: string }
> = {
  pendiente: {
    label: "Pendiente",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    dotClass: "bg-amber-500",
  },
  en_preparacion: {
    label: "En preparación",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
    dotClass: "bg-blue-400",
  },
  en_camino: {
    label: "En camino",
    colorClass: "text-purple-600",
    bgClass: "bg-purple-50",
    dotClass: "bg-purple-400",
  },
  completado: {
    label: "Completado",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    dotClass: "bg-emerald-400",
  },
};

export const HOUR_DATA = [12, 18, 38, 62, 88, 105, 120, 142, 131, 115, 87, 65];
export const HOUR_LABELS = [
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"
];

export const TABLES = [
  { n: 1, status: "ocupada", guests: 4 },
  { n: 2, status: "ocupada", guests: 2 },
  { n: 3, status: "ocupada", guests: 3 },
  { n: 4, status: "libre", guests: 0 },
  { n: 5, status: "ocupada", guests: 6 },
  { n: 6, status: "libre", guests: 0 },
  { n: 7, status: "ocupada", guests: 2 },
  { n: 8, status: "reservada", guests: 0 },
  { n: 9, status: "libre", guests: 0 },
  { n: 10, status: "sucia", guests: 0 },
  { n: 11, status: "reservada", guests: 0 },
  { n: 12, status: "libre", guests: 0 },
];

export const TABLE_CFG: Record<
  string,
  { colorClass: string; bgClass: string; borderClass: string; label: string }
> = {
  ocupada: {
    colorClass: "text-brand",
    bgClass: "bg-brand/10",
    borderClass: "border-brand/40",
    label: "Ocupada",
  },
  libre: {
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-300",
    label: "Libre"
  },
  reservada: {
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-300",
    label: "Reservada",
  },
  sucia: {
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-300",
    label: "Sucia"
  },
};

export const LOW_STOCK = [
  { name: "Pollo entero", stock: 3, min: 8, unit: "kg", urgency: "critical" },
  { name: "Chipotle adobo", stock: 2, min: 5, unit: "pza", urgency: "critical" },
  { name: "Cebolla blanca", stock: 4, min: 5, unit: "kg", urgency: "low" },
  { name: "Refresco cola", stock: 8, min: 12, unit: "caja", urgency: "low" },
];

export const NOTIFS = [
  { icon: "🔴", text: "2 productos en stock crítico", time: "hace 5 min" },
  { icon: "🟡", text: "Caja abierta desde las 12:00", time: "hace 11 h" },
  { icon: "🟢", text: "Reporte diario listo", time: "hace 1 h" },
  { icon: "🔵", text: "Reserva confirmada – Mesa 8", time: "hace 20 min" },
];
