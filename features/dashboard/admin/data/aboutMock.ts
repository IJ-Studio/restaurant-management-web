export interface Schedule {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface Gallery {
  id: number;
  url: string;
  caption: string;
  order: number;
}

export interface Feature {
  id: number;
  icon: string;
  text: string;
}

export interface RestaurantInfo {
  name: string;
  slogan: string;
  description: string;
  history: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  mapEmbed: string;
  instagram: string;
  facebook: string;
  twitter: string;
  schedule: Schedule[];
  features: Feature[];
  gallery: Gallery[];
  coverImage: string;
  logoText: string;
  rfc: string;
  razonSocial: string;
}

export const INITIAL_ABOUT_INFO: RestaurantInfo = {
  name: "El Quijote",
  slogan: "Cocina internacional con alma española",
  description:
    "El Quijote es un restaurante independiente que ofrece cocina internacional con fuerte inspiración española y una experiencia gastronómica distintiva en Huejutla de Reyes, Hidalgo.",
  history:
    "Fundado por Alejandro Daniel Monterrubio Caballero, el restaurante nació con la visión de llevar sabores del mundo a la Huasteca hidalguense. Desde su apertura, se ha convertido en el punto de encuentro gastronómico de la región.",
  phone: "771 272 8818",
  email: "ftdanielcaballero@gmail.com",
  website: "www.restauranteelquijote.mx",
  address: "Plaza Hidalgo #5-1, Centro, Huejutla de Reyes, Hgo. C.P. 43000",
  mapEmbed: "https://maps.google.com/?q=Plaza+Hidalgo+5-1+Huejutla+Hidalgo",
  instagram: "@elquijotehujutla",
  facebook: "Restaurante El Quijote",
  twitter: "@quijote_hjl",
  rfc: "EQRE001010XXX",
  razonSocial: "Restaurante El Quijote S.A. de C.V.",
  logoText: "Q",
  coverImage: "",
  schedule: [
    { day: "Lunes", open: "13:00", close: "23:00", closed: false },
    { day: "Martes", open: "13:00", close: "23:00", closed: false },
    { day: "Miércoles", open: "13:00", close: "23:00", closed: false },
    { day: "Jueves", open: "13:00", close: "23:00", closed: false },
    { day: "Viernes", open: "13:00", close: "23:00", closed: false },
    { day: "Sábado", open: "13:00", close: "23:00", closed: false },
    { day: "Domingo", open: "13:00", close: "23:00", closed: false },
  ],
  features: [
    { id: 1, icon: "🍷", text: "Carta de vinos importados" },
    { id: 2, icon: "🎭", text: "Ambiente elegante y acogedor" },
    { id: 3, icon: "🚗", text: "Estacionamiento disponible" },
    { id: 4, icon: "📱", text: "Reservas en línea" },
    { id: 5, icon: "🍕", text: "Cocina internacional" },
    { id: 6, icon: "🎂", text: "Eventos privados y banquetes" },
  ],
  gallery: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
      caption: "Interior del restaurante",
      order: 1,
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
      caption: "Nuestra cocina",
      order: 2,
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600",
      caption: "Terraza",
      order: 3,
    },
  ],
};
