export type CategoryKey = string;

export type MenuCategory = {
  key: CategoryKey;
  label: string;
  icon?: string;
  order?: number;
};

export interface Dish {
  id: number;
  name: string;
  catKey: CategoryKey;
  catLabel: string;
  catIcon?: string;
  catOrder?: number;
  desc: string;
  price: string;
  numPrice: number;
  tag?: string;
  rating: number;
  time: string;
  img: string;
}

export interface Promo {
  id: number;
  badge: string;
  title: string;
  desc: string;
  originalPrice: string;
  price: string;
  color: string;
}

export interface Combo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioRegular?: number | null;
  disponible: boolean;
}

export interface CartItem extends Dish {
  qty: number;
}

export type ReservaData = {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
  personas: string;
};
