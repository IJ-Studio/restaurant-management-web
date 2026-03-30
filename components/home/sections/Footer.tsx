import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 px-8 lg:px-24 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-black tracking-tighter">Restaurante<span className="text-orange-500"> El Quijote</span></span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
            Preparación culinaria nacional e internacional, así como bebidas. En el centro de Huejutla de Reyes, Hidalgo. Abiertos todos los días.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-orange-500 mb-4">Visítanos</p>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li>Pzla. Hidalgo 5-1, Centro</li>
            <li>Huejutla de Reyes, Hgo. 43000</li>
            <li>Lun–Dom: 1:00 PM – 11:00 PM</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-orange-500 mb-4">Contacto</p>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><a href="tel:+527717028172" className="hover:text-orange-500 transition-colors">+52 771 702 8172</a></li>
            <li><a href="https://www.facebook.com/ElQuijote.Huejutla" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Facebook</a></li>
            <li><a href="https://www.instagram.com/elquijotehuejutla/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">@elquijotehuejutla</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>© 2026 Restaurante El Quijote. Todos los derechos reservados.</p>
        <p></p>
      </div>
    </footer>
  );
}
