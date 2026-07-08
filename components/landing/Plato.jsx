import React from 'react';

export default function PlatoBocetoUltraDetallado({
  // Usamos el color naranja del plato inyectado en la clase de texto para que currentColor lo lea
  colorClassName = "text-[#d97736]",
  bgColorClassName = "bg-[#fcfbf7]",
  fillColor = "#fcfbf7"
}) {
  return (
    <div className={`w-full max-w-4xl mx-auto overflow-hidden ${bgColorClassName} ${colorClassName}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className="w-full h-full">
        <defs>
          <style>{`
            /* Adaptado al estilo del Molino:
              - Uso de currentColor.
              - Trazos principales a 2.5.
              - Detalles, achurados y sombras a 1.5.
            */
            .boceto-guia { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-dasharray: 4 4; opacity: 0.3; }
            .boceto-principal { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.5; }
            .boceto-medio { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; opacity: 0.7; }
            .boceto-fino { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; opacity: 0.4; }
            .boceto-achurado { fill: none; stroke: currentColor; stroke-width: 1.5; opacity: 0.5; stroke-linecap: round; }
            .boceto-sombra-densa { fill: none; stroke: currentColor; stroke-width: 1.5; opacity: 0.8; stroke-linecap: round; }

            /* Equivalente a ".solido" en el molino: Relleno sólido y contorno de 2.5 */
            .figura-rellena { fill: ${fillColor}; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.5; }

            /* Truco de máscara para tallos */
            .trazo-fondo { fill: none; stroke: ${fillColor}; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }

            .punto { fill: currentColor; opacity: 0.9; }
          `}</style>
        </defs>

        {/* CAPA 1: EL PLATO Y GUÍAS */}
        <g id="plato-y-guias">
          <line x1="300" y1="10" x2="300" y2="590" className="boceto-guia" />
          <line x1="10" y1="300" x2="590" y2="300" className="boceto-guia" />

          <circle cx="300" cy="18" r="2.5" className="boceto-principal" />
          <circle cx="300" cy="582" r="2.5" className="boceto-principal" />
          <circle cx="18" cy="300" r="2.5" className="boceto-principal" />
          <circle cx="582" cy="300" r="2.5" className="boceto-principal" />

          {/* Base del plato */}
          <circle cx="300" cy="300" r="285" className="figura-rellena" />
          <circle cx="300" cy="300" r="282" className="boceto-fino" />
          <circle cx="300" cy="300" r="275" className="boceto-medio" />
          <circle cx="300" cy="300" r="270" className="boceto-fino" />
          <circle cx="300" cy="300" r="268" className="boceto-guia" />

          <circle cx="300" cy="300" r="215" className="figura-rellena" />
          <circle cx="300" cy="300" r="211" className="boceto-fino" />
          <circle cx="300" cy="300" r="207" className="boceto-guia" />

          {/* Achurado curvo (Sombras del bisel del plato) */}
          <path className="boceto-achurado" d="M 95 180 Q 150 120 220 95 M 85 200 Q 140 140 210 110 M 75 220 Q 120 170 190 130 M 70 240 Q 110 200 170 160 M 65 260 Q 100 230 150 190" />
          <path className="boceto-achurado" d="M 380 95 Q 450 120 505 180 M 390 110 Q 460 140 515 200 M 410 130 Q 480 170 525 220 M 430 160 Q 490 200 530 240" />
          <path className="boceto-achurado" d="M 100 400 Q 150 480 230 510 M 85 380 Q 130 460 210 490 M 75 360 Q 120 440 190 470 M 65 340 Q 105 410 170 450 M 60 320 Q 95 380 150 430" />
          <path className="boceto-achurado" d="M 370 510 Q 450 480 500 400 M 390 520 Q 470 490 520 420 M 410 525 Q 490 500 535 440 M 430 525 Q 510 510 550 460" />

          <path className="boceto-guia" d="M 130 300 A 170 170 0 0 1 200 160 M 350 140 A 170 170 0 0 1 460 250 M 465 350 A 170 170 0 0 1 350 460 M 200 440 A 170 170 0 0 1 130 350" />
        </g>

        {/* CAPA 2: LECHUGA */}
        <g id="lechuga">
          <path className="figura-rellena" d="M 120 220 C 80 235 60 270 75 300 C 60 325 70 355 90 370 C 70 395 85 435 120 435 C 105 470 145 500 180 485 C 200 525 255 535 290 515 C 310 555 375 565 415 525 C 455 555 520 525 540 475 C 570 480 585 435 560 405 C 585 375 565 320 540 315 C 565 295 550 255 520 260 C 500 225 450 230 435 255 Z" />

          <path className="boceto-fino" d="M 170 380 Q 220 370 260 350 M 180 390 Q 220 400 250 380 M 160 400 Q 190 410 210 390 M 280 470 Q 320 440 360 410 M 290 485 Q 330 455 370 425 M 370 500 Q 400 460 420 430 M 390 515 Q 410 480 430 450 M 490 470 Q 470 430 440 400 M 540 380 Q 500 370 470 360 M 520 360 Q 490 350 460 340" />
          <path className="boceto-sombra-densa" d="M 100 260 Q 130 250 150 260 M 110 270 Q 140 260 160 270 M 95 285 Q 120 280 140 290 M 90 320 Q 120 310 140 320 M 100 335 Q 125 325 145 335 M 320 510 Q 350 490 370 500 M 340 525 Q 365 505 385 515 M 520 440 Q 490 420 470 430 M 500 460 Q 475 445 455 455 M 530 350 Q 500 340 480 350" />
        </g>

        {/* CAPA 3: PATATAS */}
        <g id="patatas">
          <path className="figura-rellena" d="M 190 100 C 230 60 320 50 350 90 C 310 105 250 115 190 100 Z" />
          <path className="boceto-medio" d="M 210 95 C 260 85 300 85 330 95" />
          <path className="boceto-fino" d="M 230 75 L 235 85 M 270 70 L 275 80 M 310 75 L 315 85 M 250 72 L 253 82 M 290 72 L 293 82" />

          <path className="figura-rellena" d="M 110 190 C 130 150 180 100 220 120 C 180 150 140 180 110 190 Z" />
          <path className="boceto-medio" d="M 130 170 C 160 140 190 120 210 120 M 120 180 C 150 155 180 135 200 135" />

          <path className="figura-rellena" d="M 140 170 C 190 130 280 120 310 160 C 250 170 190 180 140 170 Z" />
          <path className="boceto-medio" d="M 160 160 C 210 145 260 145 290 155 M 180 152 C 220 140 250 140 270 148" />

          <path className="figura-rellena" d="M 200 190 C 250 160 340 180 370 230 C 310 230 250 210 200 190 Z" />
          <path className="boceto-medio" d="M 230 190 C 280 185 320 200 350 220 M 250 183 C 290 180 310 190 330 205" />

          <path className="figura-rellena" d="M 290 210 C 320 180 380 200 410 260 C 360 250 320 230 290 210 Z" />
          <path className="boceto-medio" d="M 310 210 C 340 205 370 220 395 250 M 320 218 C 345 215 365 225 380 245" />

          <path className="figura-rellena" d="M 390 80 C 410 100 420 170 410 230 C 390 180 380 130 390 80 Z" />
          <path className="boceto-medio" d="M 395 100 C 405 140 405 190 400 220 M 402 110 C 412 145 412 185 407 210" />

          <path className="figura-rellena" d="M 450 90 C 470 120 460 200 420 240 C 420 180 430 130 450 90 Z" />
          <path className="boceto-medio" d="M 445 110 C 450 150 440 190 425 220 M 455 120 C 460 155 450 185 435 210" />
        </g>

        {/* CAPA 4: CUENCO DE SALSA */}
        <g id="salsa">
          <circle cx="485" cy="270" r="69" className="boceto-guia" />
          <circle cx="485" cy="270" r="65" className="figura-rellena" />
          <circle cx="485" cy="270" r="62" className="boceto-fino" />
          <circle cx="485" cy="270" r="59" className="boceto-guia" />
          <circle cx="485" cy="270" r="52" className="figura-rellena" />

          <path className="boceto-medio" d="M 445 255 C 470 220 520 230 525 270 C 535 310 480 325 455 295 C 435 270 450 235 485 235 C 510 235 515 265 495 280 C 475 295 460 275 470 260 C 480 250 495 255 490 270" />
          <path className="boceto-fino" d="M 460 260 C 480 230 510 245 510 270 C 510 290 485 305 465 285" />
        </g>

        {/* CAPA 5: EL FILETE DE CARNE */}
        <g id="carne">
          <path className="figura-rellena" d="M 120 320 C 105 240 150 215 230 225 C 300 230 350 255 385 320 C 430 390 370 500 270 510 C 170 535 130 450 120 320 Z" />
          <path className="boceto-medio" d="M 125 315 C 115 245 155 225 225 235 C 290 240 340 265 375 325 C 415 390 360 490 265 500 M 130 310 C 120 250 160 235 220 245" />
          <path className="boceto-fino" d="M 115 330 C 100 260 140 210 235 215 M 270 518 C 160 545 125 460 115 325 M 390 320 C 435 400 375 505 275 515" />

          {/* Marcas de Parrilla */}
          <path className="boceto-principal" d="M 125 255 Q 180 240 245 255" />
          <path className="boceto-medio" d="M 120 265 Q 180 250 255 265" />
          <path className="boceto-achurado" d="M 120 250 Q 180 235 240 250" />

          <path className="boceto-principal" d="M 115 295 Q 190 280 310 315" />
          <path className="boceto-medio" d="M 115 305 Q 190 290 320 325" />
          <path className="boceto-achurado" d="M 115 285 Q 190 270 300 305" />

          <path className="boceto-principal" d="M 118 340 Q 210 320 350 370" />
          <path className="boceto-medio" d="M 120 350 Q 210 330 360 380" />
          <path className="boceto-achurado" d="M 118 330 Q 210 310 340 360" />

          <path className="boceto-principal" d="M 130 395 Q 230 370 380 435" />
          <path className="boceto-medio" d="M 135 405 Q 230 380 385 445" />
          <path className="boceto-achurado" d="M 125 385 Q 230 360 370 425" />

          <path className="boceto-sombra-densa" d="M 120 330 L 135 345 M 120 340 L 135 355 M 120 350 L 135 365 M 120 360 L 135 375 M 125 370 L 140 385 M 125 380 L 140 395 M 130 390 L 145 405 M 135 400 L 150 415" />
        </g>

        {/* CAPA 6: TOMATES CHERRY */}
        <g id="tomates">
          <circle cx="410" cy="370" r="38" className="figura-rellena" />
          <circle cx="410" cy="370" r="35" className="boceto-medio" />

          <path className="boceto-sombra-densa" d="M 378 350 Q 410 325 438 350 M 373 365 Q 410 335 447 365 M 373 385 Q 410 355 447 385" />

          <path className="trazo-fondo" d="M 405 330 L 400 305 M 405 330 L 423 312 M 405 330 L 418 300 M 405 330 L 388 312 M 405 330 L 380 325" />
          <path className="boceto-principal" d="M 405 330 L 400 305 M 405 330 L 423 312 M 405 330 L 418 300 M 405 330 L 388 312 M 405 330 L 380 325" />
          <circle cx="405" cy="330" r="3.5" className="figura-rellena" />

          <circle cx="450" cy="460" r="35" className="figura-rellena" />
          <circle cx="450" cy="460" r="32" className="boceto-medio" />

          <path className="boceto-sombra-densa" d="M 422 440 Q 450 415 478 440 M 417 455 Q 450 425 483 455 M 417 475 Q 450 445 483 475" />

          <path className="trazo-fondo" d="M 430 490 L 412 508 M 430 490 L 418 518 M 430 490 L 442 512 M 430 490 L 455 500" />
          <path className="boceto-principal" d="M 430 490 L 412 508 M 430 490 L 418 518 M 430 490 L 442 512 M 430 490 L 455 500" />
          <circle cx="430" cy="490" r="3" className="figura-rellena" />
        </g>

        {/* CAPA 7: RAMITAS DE ROMERO */}
        <g id="romero">
          <path className="trazo-fondo" d="M 65 395 C 150 390 220 450 320 460" />
          <path className="boceto-principal" d="M 65 395 C 150 390 220 450 320 460" />

          <path className="trazo-fondo" d="M 180 435 C 240 370 250 350 280 355" />
          <path className="boceto-principal" d="M 180 435 C 240 370 250 350 280 355" />

          <g className="hojas-romero">
            <path className="figura-rellena" d="M 90 395 Q 70 410 65 430 Q 80 410 100 400 Z" /> <path className="boceto-fino" d="M 90 395 L 65 430" />
            <path className="figura-rellena" d="M 110 395 Q 90 420 95 440 Q 110 420 125 400 Z" /> <path className="boceto-fino" d="M 110 395 L 95 440" />
            <path className="figura-rellena" d="M 135 405 Q 110 440 120 460 Q 140 430 150 415 Z" /> <path className="boceto-fino" d="M 135 405 L 120 460" />

            <path className="figura-rellena" d="M 160 418 Q 150 450 160 470 Q 175 440 175 425 Z" /> <path className="boceto-fino" d="M 160 418 L 160 470" />
            <path className="figura-rellena" d="M 195 435 Q 185 470 205 485 Q 215 450 210 440 Z" /> <path className="boceto-fino" d="M 195 435 L 205 485" />

            <path className="figura-rellena" d="M 285 455 Q 310 475 330 480 Q 315 460 300 455 Z" /> <path className="boceto-fino" d="M 285 455 L 330 480" />

            <path className="figura-rellena" d="M 200 415 Q 180 390 170 370 Q 195 385 210 405 Z" /> <path className="boceto-fino" d="M 200 415 L 170 370" />
            <path className="figura-rellena" d="M 220 390 Q 200 370 195 350 Q 220 365 235 385 Z" /> <path className="boceto-fino" d="M 220 390 L 195 350" />

            <path className="figura-rellena" d="M 140 400 Q 150 370 170 360 Q 165 390 155 405 Z" /> <path className="boceto-fino" d="M 140 400 L 170 360" />
            <path className="figura-rellena" d="M 100 400 Q 110 370 130 365 Q 120 395 110 405 Z" /> <path className="boceto-fino" d="M 100 400 L 130 365" />
          </g>
        </g>
      </svg>
    </div>
  );
}
