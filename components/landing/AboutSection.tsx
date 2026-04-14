import Image from "next/image";

interface AboutData {
  description: string;
  address: string;
  schedule: string;
  phone: string;
  facebookUrl: string;
  mapsUrl: string;
  reviews: Array<{ text: string; stars: number }>;
  galleryImages: string[];
}

export default function AboutSection({
  data,
  loading,
}: {
  data: AboutData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="py-24 px-8 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="skeleton h-72 rounded-[2rem]" />
            <div className="skeleton h-44 rounded-[1.5rem]" />
          </div>
          <div className="space-y-4">
            <div className="skeleton-title w-48 h-8" />
            <div className="skeleton-text w-full h-20" />
            <div className="skeleton-text w-full h-20" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section
      id="nosotros"
      className="py-24 bg-[var(--color-surface-alt)] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-72 rounded-[2rem] overflow-hidden col-span-2">
            <Image
              src={data.galleryImages[0]}
              alt="Restaurante"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
            <Image
              src={data.galleryImages[1]}
              alt="Platillo"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
            <Image
              src={data.galleryImages[2]}
              alt="Ambiente"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-brand)] font-bold mb-3">
            Quiénes somos
          </p>
          <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">
            Cocina Nacional e Internacional{" "}
            <span className="text-[var(--color-brand)]">en Huejutla</span>
          </h2>
          <div
            className="text-[var(--color-text-sec)] leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
          <div className="space-y-3 mt-8">
            <div className="flex items-start gap-3 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-black text-sm">Dirección</p>
                <p className="text-xs text-[var(--color-text-sec)]">
                  {data.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
              <span className="text-xl">🕐</span>
              <div>
                <p className="font-black text-sm">Horario</p>
                <p className="text-xs text-[var(--color-text-sec)]">
                  {data.schedule}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-black text-sm">Teléfono</p>
                <a
                  href={`tel:${data.phone}`}
                  className="text-xs text-[var(--color-brand)] font-bold hover:underline"
                >
                  {data.phone}
                </a>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <a
              href={data.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#166fe5] transition-colors"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[var(--color-border)] px-5 py-2.5 rounded-xl text-sm font-bold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              🗺️ Ver en Maps
            </a>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-brand)] font-bold mb-3 text-center">
          Lo que dicen nuestros clientes
        </p>
        <h3 className="text-2xl font-black text-center mb-8 tracking-tight">
          Reseñas <span className="text-[var(--color-brand)]">Verificadas</span>{" "}
          de Google
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.reviews.map((review, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] p-6 rounded-[2rem] border border-[var(--color-border)]"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg
                    key={s}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={
                      s < review.stars
                        ? "var(--color-brand)"
                        : "var(--color-border)"
                    }
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-sec)] leading-relaxed italic">
                “{review.text}”
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center text-xs font-black text-[var(--color-brand)]">
                  G
                </div>
                <p className="text-xs font-bold text-[var(--color-text-sec)]">
                  Reseña de Google Maps
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
