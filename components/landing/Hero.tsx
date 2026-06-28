import { Utensils, Calendar } from "lucide-react";
import { CldImage } from "next-cloudinary";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  stats: Array<{ value: string; label: string }>;
  loading?: boolean;
}

export default function Hero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  stats,
}: HeroProps) {


  return (
    <section className="relative min-h-screen flex items-center px-8 lg:px-24 overflow-hidden pt-20">
      <div className="z-10 max-w-3xl text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-bold uppercase tracking-widest mb-6">
          Abierto ahora · Lun–Dom
        </div>
        <h1
          className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="text-[var(--color-text-sec)] text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-5">
          <a href={ctaLink} className="btn-primary flex items-center gap-3">
            {ctaText} <Utensils size={20} />
          </a>
          <a
            href="#reserva"
            className="border-2 border-[var(--color-border)] hover:border-[var(--color-brand)] px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3"
          >
            Reservar Mesa <Calendar size={20} />
          </a>
        </div>
        <div className="flex gap-10 mt-14 pt-10 border-t border-[var(--color-border)]">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-black text-[var(--color-brand)]">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-[var(--color-text-sec)] mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 hidden xl:block w-[680px] h-[680px]">
        <div className="relative w-full h-full animate-spin-slow">
          <CldImage
            src="https://res.cloudinary.com/dcb1tspbj/image/upload/v1778827570/Gemini_Generated_Image_lbwn93lbwn93lbwn_veznen.png" // Solo el public ID de Cloudinary (sin la URL completa)
            alt="Plato Gourmet"
            width={680}
            height={680}
            className="object-cover rounded-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
