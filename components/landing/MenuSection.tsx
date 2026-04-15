import { Star, Clock, Plus } from "lucide-react";
// import Image from "next/image";  ← eliminado
import { SkeletonCard } from "./SkeletonCard";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string; // ya no se usará
  tag?: string;
  rating: number;
  prepTime: string;
}

interface MenuSectionProps {
  items: MenuItem[];
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  loading: boolean;
}

export default function MenuSection({
  items,
  categories,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onSelectItem,
  loading,
}: MenuSectionProps) {
  if (loading) {
    return (
      <section id="menu" className="py-24 px-8 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="skeleton-title w-48 h-10" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-20 h-10 rounded-xl" />
            <div className="skeleton w-20 h-10 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24 px-8 lg:px-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Nuestro Menú
          </h2>
          <div className="h-1.5 w-20 bg-[var(--color-brand)] rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeCategory === cat.id
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/30"
                  : "bg-transparent border-[var(--color-border)] text-[var(--color-text-sec)] hover:border-[var(--color-brand)]/50 hover:text-[var(--color-brand)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="menu-card group"
            onClick={() => onSelectItem(item)}
          >
            {/* ───── Sección de imagen reemplazada por placeholder ───── */}
            <div className="menu-card-image">
              {/* Placeholder con gradiente en lugar de Image */}
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              {item.tag && <span className="menu-card-tag">{item.tag}</span>}
              <div className="menu-card-price">
                ${item.price.toLocaleString()}
              </div>
            </div>
            {/* ─────────────────────────────────────────────────────────── */}
            <div className="menu-card-content">
              <p className="menu-card-category">{item.category}</p>
              <h3 className="menu-card-title">{item.name}</h3>
              <p className="menu-card-desc">{item.description}</p>
              <div className="menu-card-footer">
                <div className="menu-card-rating">
                  <Star
                    size={12}
                    fill="var(--color-brand)"
                    className="text-[var(--color-brand)]"
                  />{" "}
                  {item.rating}
                  <span className="mx-1">·</span>
                  <Clock size={12} /> {item.prepTime}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  className="menu-card-add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
