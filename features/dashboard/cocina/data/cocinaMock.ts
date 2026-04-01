export type KitchenOrderState = 'nuevo' | 'preparando' | 'listo';

export interface KitchenItem {
  nombre: string;
  qty: number;
  notas: string;
}

export interface KitchenOrder {
  id: string;
  mesa: string;
  llegada: string;
  estado: KitchenOrderState;
  items: KitchenItem[];
}

export interface InventoryItem {
  nombre: string;
  stock: number;
  unidad: string;
  minimo: number;
  critico: boolean;
}

export const PEDIDOS_INIT: KitchenOrder[] = [
  {
    id: '#9024', mesa: 'Barra 1', llegada: '2 min', estado: 'nuevo',
    items: [
      { nombre: 'Burger Clásica', qty: 1, notas: 'Sin cebolla' },
      { nombre: 'Refresco', qty: 1, notas: '' },
    ]
  },
  {
    id: '#9023', mesa: 'Mesa 3', llegada: '8 min', estado: 'preparando',
    items: [
      { nombre: 'Pizza Funghi', qty: 1, notas: 'Bien cocida' },
      { nombre: 'Pasta Carbonara', qty: 1, notas: '' },
    ]
  },
  {
    id: '#9022', mesa: 'Mesa 7', llegada: '14 min', estado: 'preparando',
    items: [
      { nombre: 'Burger Doble', qty: 2, notas: 'Término medio' },
      { nombre: 'Agua Fresca', qty: 2, notas: '' },
      { nombre: 'Tacos x3', qty: 1, notas: 'Picante' },
    ]
  },
  {
    id: '#9021', mesa: 'Mesa 2', llegada: '22 min', estado: 'listo',
    items: [
      { nombre: 'Pizza Margarita', qty: 1, notas: '' },
      { nombre: 'Café Americano', qty: 3, notas: '' },
    ]
  },
];

export const INVENTARIO: InventoryItem[] = [
  { nombre: 'Carne de Res', stock: 2.5, unidad: 'kg', minimo: 3, critico: true },
  { nombre: 'Harina para Pizza', stock: 8, unidad: 'kg', minimo: 5, critico: false },
  { nombre: 'Queso Mozzarella', stock: 1.2, unidad: 'kg', minimo: 2, critico: true },
  { nombre: 'Pasta', stock: 6, unidad: 'kg', minimo: 4, critico: false },
  { nombre: 'Tomate', stock: 4, unidad: 'kg', minimo: 5, critico: true },
  { nombre: 'Aceite de Oliva', stock: 3, unidad: 'L', minimo: 2, critico: false },
  { nombre: 'Tortillas', stock: 30, unidad: 'pzas', minimo: 50, critico: true },
  { nombre: 'Pollo', stock: 5, unidad: 'kg', minimo: 3, critico: false },
];
