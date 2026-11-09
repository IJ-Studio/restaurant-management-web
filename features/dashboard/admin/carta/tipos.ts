/**
 * Tipos de la carta en administración. Antes vivían en `restaurantData.ts`, junto a los datos de
 * ejemplo que se retiraron con D-24; los nombres de campo se conservan para no tocar la importación
 * ni la exportación.
 */
export interface MenuItem {
	id: number | string;
	name: string;
	description: string;
	price: number;
	category: string;
	/** URL pública de la imagen (Cloudinary `secure_url`). */
	imageUrl?: string;
	/** ID de la imagen en Cloudinary (`public_id`), que se guarda en la BD. */
	imagePublicId?: string;
	available: boolean;
	tags?: string[];
	prepTime?: number;
	calories?: number;
}

export interface MenuCategory {
	id: string;
	name: string;
	color: string;
	items: MenuItem[];
}

/** Etiquetas de un platillo (antes en `menuMock`). */
export type TagKey = "popular" | "vegano" | "picante" | "nuevo" | "sin-gluten";
