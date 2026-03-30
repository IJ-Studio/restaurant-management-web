import React from "react";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8">

      {/* Fila 1: Fotos + texto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">

        {/* Galería de fotos reales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-72 rounded-[2rem] overflow-hidden col-span-2">
            <Image
              src="https://lh3.googleusercontent.com/places/ANXAkqE6SwHydIngTNzQ_Rmc8pP8AXaOkj4X5F6w4I47jNOtpLi8AchhHJQ8iGYLNGGnYxcaaMb2uWLh6em28ZC4Q002P7PurJMnZg8=s4800-w800-h600"
              alt="Restaurante El Quijote interior"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              ⭐ 4.3 · 51 reseñas en Google
            </div>
          </div>
          <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/places/ANXAkqH9cuEBmlN7WPf6ZXAFmuDdNARol6-ENmXLgbDpVJxs_0gM2YEnHUd6FSGdNxJaxD2RN968QwI5gXUBnmkci3M9HdJAqn4y_q4=s4800-w800-h600"
              alt="Platillos El Quijote"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/places/ANXAkqFTum8ygee60BCkXU4Mv2eCCWcLUYmXBZoFzYzJcp-iokkz9VntBOXi4QI_4NjCZhBp5C56tqNqhFd0rQlmXsoFU9JoziAXQNo=s4800-w800-h600"
              alt="Ambiente El Quijote"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Texto real */}
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3">Quiénes somos</p>
          <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">
            Cocina Nacional e Internacional <span className="text-orange-500">en Huejutla</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Restaurante El Quijote es un espacio gastronómico ubicado en el corazón de Huejutla de Reyes, Hidalgo. Ofrecemos una amplia variedad de preparaciones culinarias nacionales e internacionales, así como una selección de bebidas para todos los gustos.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            Desde entradas y ensaladas hasta cortes americanos, mariscos y postres, nuestra carta está diseñada para ofrecer una experiencia completa en un ambiente cómodo, tranquilo y acogedor. Un lugar ideal para compartir en familia o con amigos.
          </p>

          {/* Info de contacto real */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-black text-sm">Dirección</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pzla. Hidalgo 5-1, Centro, Huejutla de Reyes, Hgo., C.P. 43000</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-xl">🕐</span>
              <div>
                <p className="font-black text-sm">Horario</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lunes a Domingo · 1:00 PM – 11:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-black text-sm">Teléfono</p>
                <a href="tel:+527717028172" className="text-xs text-orange-500 font-bold hover:underline">+52 771 702 8172</a>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <a
              href="https://www.facebook.com/ElQuijote.Huejutla"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#166fe5] transition-colors"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href="https://maps.google.com/?cid=9162171458926916171"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-black/10 dark:border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              🗺️ Ver en Maps
            </a>
          </div>
        </div>
      </div>

      {/* Fila 2: Reseñas reales de clientes */}
      <div>
        <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3 text-center">Lo que dicen nuestros clientes</p>
        <h3 className="text-2xl font-black text-center mb-8 tracking-tight">Reseñas <span className="text-orange-500">Verificadas</span> de Google</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { text: 'Excelente lugar. Muy tranquilo y agradable, con deliciosa comida y bebidas. Altamente recomendado.', stars: 5 },
            { text: 'Lo que buscaba. Excelente restaurante. Recomiendo el molcajete Mar y Tierra estilo Quijote, con vino tinto.', stars: 5 },
            { text: 'Buen restaurante donde disfrutas platillos variados, desde papas rellenas hasta pizza. Tienen juegos de mesa mientras esperas.', stars: 4 },
          ].map((review, i) => (
            <div key={i} className="bg-white dark:bg-[#161616] p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s < review.stars ? '#f59e0b' : '#d1d5db'} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-black text-orange-500">G</div>
                <p className="text-xs font-bold text-gray-500">Reseña de Google Maps</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>

  );
}
