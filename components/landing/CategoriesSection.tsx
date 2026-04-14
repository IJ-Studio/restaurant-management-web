import { ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoriesSectionProps {
  categories: Category[];
  onSelectCategory: (id: string) => void;
  activeCategory: string;
  loading?: boolean;
}

export default function CategoriesSection({
  categories,
  onSelectCategory,
  activeCategory,
  loading = false,
}: CategoriesSectionProps) {
  // Esqueletos de carga
  if (loading) {
    return (
      <section className="py-20 px-8 lg:px-24">
        <div className="flex justify-between items-end mb-12">
          <div className="text-left">
            <div className="skeleton-title w-48 h-8" />
            <div className="skeleton h-1.5 w-20 mt-2" />
          </div>
          <div className="skeleton w-36 h-5" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-card h-48 rounded-[2rem]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-8 lg:px-24">
      <div className="flex justify-between items-end mb-12">
        <div className="text-left">
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Categorías
          </h2>
          <div className="h-1.5 w-20 bg-[var(--color-brand)] rounded-full" />
        </div>
        <a
          href="#menu"
          className="group text-[var(--color-brand)] flex items-center gap-2 font-bold"
        >
          Ver menú completo{" "}
          <ChevronRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </a>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`group bg-[var(--color-surface-alt)] p-8 rounded-[2rem] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 transition-all cursor-pointer text-left ${
              activeCategory === cat.id
                ? "ring-2 ring-[var(--color-brand)]"
                : ""
            }`}
          >
            <div className="w-14 h-14 bg-[var(--color-brand)]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--color-brand)] group-hover:scale-110 transition-all">
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-8 h-8 object-contain"
              />
            </div>
            <h3 className="text-lg font-bold">{cat.name}</h3>
            <p className="text-xs text-[var(--color-text-sec)] mt-1">
              {cat.count} platillos
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
