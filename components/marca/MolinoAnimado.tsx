import { cn } from "@/lib/utils";

/**
 * Molino de la casa en trazo de boceto (D-21: conversión de `components/landing/MolinoAnimado.jsx`
 * a TSX con tokens). Ilustración de marca, decorativa (`aria-hidden`).
 *
 * - Trazo en `currentColor`; el relleno de las piezas sólidas es el fondo sobre el que va
 *   (`sobre="fondo"` o `"cafe"`), así que no hay ningún color literal.
 * - Las aspas dan dos vueltas lentas y el viento pasa dos veces al entrar; después se quedan
 *   quietos (DESIGN.md § Motion: sin bucles). Con movimiento reducido no se mueve nada. Antes
 *   giraba con SMIL (`animateTransform`), que no respeta `prefers-reduced-motion`.
 */
export function MolinoAnimado({ sobre = "fondo", className }: { sobre?: "fondo" | "cafe"; className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 600 600"
			aria-hidden="true"
			focusable="false"
			className={cn("molino-animado h-auto w-full", sobre === "cafe" && "molino-animado--cafe", className)}
		>

        {/* CAPA 1: Viento */}
        <g className="molino-animado__viento">
          <path className="viento" d="M 0 100 C 150 50, 250 150, 400 100 C 550 50, 650 150, 800 100 C 950 50, 1050 150, 1200 100" />
          <path className="viento" d="M -200 250 C -50 300, 50 200, 200 250 C 350 300, 450 200, 600 250 C 750 300, 850 200, 1000 250" />
          <path className="viento opacity-30" d="M 100 400 C 200 380, 300 420, 400 400 C 500 380, 600 420, 700 400 C 800 380, 900 420, 1000 400" />
        </g>

        {/* CAPA 2: Entorno y Suelo */}
        <g>
          <path className="tinta" strokeWidth="2" d="M 50 540 Q 150 535 250 545 T 400 540 T 550 550" />
          <path className="tinta" strokeWidth="1.5" d="M 40 550 Q 200 540 300 560 T 560 555" />
          <path className="sombra" d="M 100 540 L 80 560 M 110 545 L 90 565 M 120 545 L 100 570 M 450 540 L 430 560 M 460 545 L 440 565 M 470 542 L 450 570" />

          <g transform="translate(120 540)"><path className="tinta" strokeWidth="1.5" d="M 0 0 Q -5 -15 -15 -20 M 0 0 Q 0 -20 -5 -30 M 0 0 Q 8 -18 15 -25 M 0 0 Q 15 -10 20 -5" /></g>
          <g transform="scale(0.8) translate(30, 10) translate(150 538)"><path className="tinta" strokeWidth="1.5" d="M 0 0 Q -5 -15 -15 -20 M 0 0 Q 0 -20 -5 -30 M 0 0 Q 8 -18 15 -25 M 0 0 Q 15 -10 20 -5" /></g>
          <g transform="translate(220 543)"><path className="tinta" strokeWidth="1.5" d="M 0 0 Q -5 -15 -15 -20 M 0 0 Q 0 -20 -5 -30 M 0 0 Q 8 -18 15 -25 M 0 0 Q 15 -10 20 -5" /></g>
          <g transform="scale(1.2) translate(-60, -90) translate(420 540)"><path className="tinta" strokeWidth="1.5" d="M 0 0 Q -5 -15 -15 -20 M 0 0 Q 0 -20 -5 -30 M 0 0 Q 8 -18 15 -25 M 0 0 Q 15 -10 20 -5" /></g>
          <g transform="translate(480 548)"><path className="tinta" strokeWidth="1.5" d="M 0 0 Q -5 -15 -15 -20 M 0 0 Q 0 -20 -5 -30 M 0 0 Q 8 -18 15 -25 M 0 0 Q 15 -10 20 -5" /></g>
        </g>

        {/* CAPA 3: Torre */}
        <g>
          <path className="solido" strokeWidth="2.5" d="M 200 540 L 230 260 C 230 180 370 180 370 260 L 400 540 Z" />
          <path className="sombra" strokeWidth="1.5" d="M 205 540 L 235 260 C 235 180 365 180 365 260 L 395 540 Z" />
          <path className="solido" strokeWidth="2.5" d="M 220 230 C 220 120 380 120 380 230 Z" />
          <path className="sombra" strokeWidth="1" d="M 240 180 Q 300 200 360 180 M 250 160 Q 300 180 350 160" />
          <path className="tinta" strokeWidth="1.2" d="M 225 300 L 280 300 M 320 300 L 375 300" />
          <path className="tinta" strokeWidth="1.2" d="M 220 330 L 260 330 M 300 330 L 380 330" />
          <path className="tinta" strokeWidth="1.2" d="M 215 360 L 290 360 M 340 360 L 385 360" />
          <path className="tinta" strokeWidth="1.2" d="M 210 390 L 240 390 M 270 390 L 330 390 M 360 390 L 390 390" />
          <path className="sombra" d="M 380 330 L 370 350 M 385 360 L 375 380 M 390 390 L 380 410" />

          <rect x="175" y="420" width="250" height="20" className="solido" strokeWidth="2.5" />
          <rect x="185" y="440" width="230" height="30" className="solido" strokeWidth="2" />
          <line x1="195" y1="440" x2="195" y2="470" className="tinta" strokeWidth="2" />
          <line x1="225" y1="440" x2="225" y2="470" className="tinta" strokeWidth="2" />
          <line x1="255" y1="440" x2="255" y2="470" className="tinta" strokeWidth="2" />
          <line x1="285" y1="440" x2="285" y2="470" className="tinta" strokeWidth="2" />
          <line x1="315" y1="440" x2="315" y2="470" className="tinta" strokeWidth="2" />
          <line x1="345" y1="440" x2="345" y2="470" className="tinta" strokeWidth="2" />
          <line x1="375" y1="440" x2="375" y2="470" className="tinta" strokeWidth="2" />
          <line x1="405" y1="440" x2="405" y2="470" className="tinta" strokeWidth="2" />

          <rect x="260" y="470" width="80" height="70" className="solido" strokeWidth="2.5" />
          <rect x="270" y="480" width="25" height="30" className="tinta" strokeWidth="1.5" />
          <rect x="305" y="480" width="25" height="30" className="tinta" strokeWidth="1.5" />
          <line x1="300" y1="470" x2="300" y2="540" className="tinta" strokeWidth="2" />
          <circle cx="290" cy="515" r="3" className="tinta" />
          <rect x="275" y="290" width="50" height="60" className="solido" strokeWidth="2" />
          <line x1="300" y1="290" x2="300" y2="350" className="tinta" strokeWidth="1.5" />
          <line x1="275" y1="320" x2="325" y2="320" className="tinta" strokeWidth="1.5" />
        </g>

        {/* CAPA 4: Aspas y Rotor */}
        <g className="molino-animado__aspas">
          <g><polygon points="296,290 296,40 304,40 304,290" className="solido" strokeWidth="2" />
            <polygon points="304,50 360,60 345,260 304,260" className="solido" strokeWidth="1.5" />
            <line x1="304" y1="80" x2="356" y2="84" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="110" x2="353" y2="116" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="140" x2="351" y2="148" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="170" x2="348" y2="180" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="200" x2="346" y2="212" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="230" x2="344" y2="244" className="tinta" strokeWidth="1.5" />
            <line x1="330" y1="55" x2="325" y2="260" className="tinta" strokeWidth="1.2" />
            <path className="sombra" d="M 305 250 L 315 260 M 305 240 L 315 250 M 305 230 L 315 240" /></g>
          <g transform="rotate(90 300 280)"><polygon points="296,290 296,40 304,40 304,290" className="solido" strokeWidth="2" />
            <polygon points="304,50 360,60 345,260 304,260" className="solido" strokeWidth="1.5" />
            <line x1="304" y1="80" x2="356" y2="84" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="110" x2="353" y2="116" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="140" x2="351" y2="148" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="170" x2="348" y2="180" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="200" x2="346" y2="212" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="230" x2="344" y2="244" className="tinta" strokeWidth="1.5" />
            <line x1="330" y1="55" x2="325" y2="260" className="tinta" strokeWidth="1.2" />
            <path className="sombra" d="M 305 250 L 315 260 M 305 240 L 315 250 M 305 230 L 315 240" /></g>
          <g transform="rotate(180 300 280)"><polygon points="296,290 296,40 304,40 304,290" className="solido" strokeWidth="2" />
            <polygon points="304,50 360,60 345,260 304,260" className="solido" strokeWidth="1.5" />
            <line x1="304" y1="80" x2="356" y2="84" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="110" x2="353" y2="116" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="140" x2="351" y2="148" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="170" x2="348" y2="180" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="200" x2="346" y2="212" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="230" x2="344" y2="244" className="tinta" strokeWidth="1.5" />
            <line x1="330" y1="55" x2="325" y2="260" className="tinta" strokeWidth="1.2" />
            <path className="sombra" d="M 305 250 L 315 260 M 305 240 L 315 250 M 305 230 L 315 240" /></g>
          <g transform="rotate(270 300 280)"><polygon points="296,290 296,40 304,40 304,290" className="solido" strokeWidth="2" />
            <polygon points="304,50 360,60 345,260 304,260" className="solido" strokeWidth="1.5" />
            <line x1="304" y1="80" x2="356" y2="84" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="110" x2="353" y2="116" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="140" x2="351" y2="148" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="170" x2="348" y2="180" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="200" x2="346" y2="212" className="tinta" strokeWidth="1.5" />
            <line x1="304" y1="230" x2="344" y2="244" className="tinta" strokeWidth="1.5" />
            <line x1="330" y1="55" x2="325" y2="260" className="tinta" strokeWidth="1.2" />
            <path className="sombra" d="M 305 250 L 315 260 M 305 240 L 315 250 M 305 230 L 315 240" /></g>
          <circle cx="300" cy="280" r="22" className="solido" strokeWidth="2.5" />
          <circle cx="300" cy="280" r="14" className="tinta" strokeWidth="1.5" />
          <circle cx="300" cy="280" r="4" className="solido" strokeWidth="1.5" />
          <path className="sombra" d="M 290 270 Q 310 290 300 295" />
        </g>
		</svg>
	);
}
