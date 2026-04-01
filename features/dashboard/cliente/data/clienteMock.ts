export interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  cat: string;
  rating: number;
  tiempo: string;
  img: string;
  tag: string | null;
}

export interface Promotion {
  id: number;
  titulo: string;
  desc: string;
  color: string;
  emoji: string;
  hasta: string;
}

export interface ClientOrder {
  id: string;
  fecha: string;
  items: string[];
  total: number;
  estado: 'entregado' | 'cancelado' | 'en camino' | 'confirmado' | 'preparando' | 'listo';
}

export const CATEGORIAS = ['Todo', 'Hamburguesas', 'Pizzas', 'Pastas', 'Mexicano', 'Bebidas'];

export const MENU: MenuItem[] = [
  { id: 1, nombre: 'Burger Clásica', precio: 18.00, cat: 'Hamburguesas', rating: 4.8, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400', tag: null },
  { id: 2, nombre: 'Burger Doble', precio: 24.00, cat: 'Hamburguesas', rating: 4.9, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=400', tag: '🔥 Popular' },
  { id: 3, nombre: 'Pizza Margarita', precio: 22.00, cat: 'Pizzas', rating: 4.7, tiempo: '20-25', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', tag: null },
  { id: 4, nombre: 'Pizza Funghi', precio: 24.00, cat: 'Pizzas', rating: 4.8, tiempo: '20-25', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400', tag: '⭐ Top' },
  { id: 5, nombre: 'Pasta Carbonara', precio: 18.00, cat: 'Pastas', rating: 4.6, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=400', tag: null },
  { id: 6, nombre: 'Pasta Bolognesa', precio: 17.00, cat: 'Pastas', rating: 4.7, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=400', tag: null },
  { id: 7, nombre: 'Tacos x3', precio: 12.00, cat: 'Mexicano', rating: 4.9, tiempo: '10-15', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400', tag: '🔥 Popular' },
  { id: 8, nombre: 'Agua Fresca', precio: 4.00, cat: 'Bebidas', rating: 4.5, tiempo: '5', img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400', tag: null },
  { id: 9, nombre: 'Refresco', precio: 3.50, cat: 'Bebidas', rating: 4.3, tiempo: '5', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400', tag: null },
  { id: 10, nombre: 'Café Americano', precio: 5.00, cat: 'Bebidas', rating: 4.8, tiempo: '5-10', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400', tag: null },
];

export const PROMOCIONES: Promotion[] = [
  { id: 1, titulo: '2x1 en Pizzas', desc: 'Todos los martes', color: 'from-orange-600 to-red-600', emoji: '🍕', hasta: 'Mar 4 Mar' },
  { id: 2, titulo: '20% en tu primera orden', desc: 'Código: QUIJOTE20', color: 'from-purple-600 to-blue-600', emoji: '🎉', hasta: 'Tiempo limitado' },
  { id: 3, titulo: 'Burger + Refresco', desc: 'Combo desde $18', color: 'from-green-600 to-teal-600', emoji: '🍔', hasta: 'Todo el mes' },
];

export const HISTORIAL: ClientOrder[] = [
  { id: '#8801', fecha: 'Hace 2 días', items: ['Burger Doble', 'Refresco'], total: 27.50, estado: 'entregado' },
  { id: '#8756', fecha: 'Hace 1 semana', items: ['Pizza Funghi x2', 'Agua Fresca'], total: 52.00, estado: 'entregado' },
  { id: '#8712', fecha: 'Hace 2 semanas', items: ['Pasta Carbonara', 'Café Americano'], total: 23.00, estado: 'entregado' },
];
