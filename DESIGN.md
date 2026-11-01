---
name: El Quijote — Bodega de guarda
description: Sistema visual clásico de alta gama para el sitio y los paneles de El Quijote; mezcla el estándar de la alta cocina con la gramática de la etiqueta de un vino de guarda.
colors:
  fondo: "#14100C"
  superficie: "#1C1712"
  superficie-elevada: "#262019"
  superficie-cafe: "#2B2119"
  borde-sutil: "#2E261F"
  borde-control: "#7D6E5A"
  texto-principal: "#EFE7DA"
  texto-secundario: "#BDB09C"
  texto-tenue: "#978A76"
  acento: "#C9A267"
  acento-intenso: "#DBB97F"
  texto-sobre-acento: "#14100C"
  foco: "#E8C98F"
  error: "#E8846F"
  exito: "#9CC08F"
  aviso: "#D9AE5B"
  info: "#9DB4C7"
  fondo-claro: "#F4EEE3"
  superficie-claro: "#FBF8F2"
  superficie-elevada-claro: "#FFFFFF"
  superficie-cafe-claro: "#EBE1D0"
  borde-sutil-claro: "#E2D8C8"
  borde-control-claro: "#8C7C66"
  texto-principal-claro: "#1E1813"
  texto-secundario-claro: "#54473A"
  texto-tenue-claro: "#6A5C4B"
  acento-claro: "#835E25"
  acento-intenso-claro: "#6C4C1B"
  texto-sobre-acento-claro: "#FBF8F2"
  foco-claro: "#6C4C1B"
  error-claro: "#A43A2A"
  exito-claro: "#3D6838"
  aviso-claro: "#7F5A12"
  info-claro: "#2F5672"
typography:
  portada:
    fontFamily: "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
    fontSize: "clamp(2.75rem, 1.6rem + 5.2vw, 5.75rem)"
    fontWeight: 380
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  titulo-1:
    fontFamily: "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  titulo-2:
    fontFamily: "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
    fontSize: "clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  titulo-3:
    fontFamily: "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
    fontSize: "clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0em"
  titulo-interfaz:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  entradilla:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  cuerpo:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  pequeno:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  etiqueta:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
  cifra-destacada:
    fontFamily: "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
    fontSize: "clamp(2rem, 1.7rem + 1.2vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
  cifra-tabla:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  control: "2px"
  tarjeta: "4px"
  dialogo: "6px"
  pastilla: "999px"
spacing:
  2xs: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
  4xl: "6rem"
components:
  boton-primario:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.texto-sobre-acento}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 1.5rem"
    height: "2.75rem"
  boton-primario-hover:
    backgroundColor: "{colors.acento-intenso}"
    textColor: "{colors.texto-sobre-acento}"
  boton-secundario:
    backgroundColor: "transparent"
    textColor: "{colors.texto-principal}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.control}"
    padding: "0 1.5rem"
    height: "2.75rem"
  campo-texto:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-principal}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.control}"
    padding: "0 0.875rem"
    height: "2.75rem"
  tarjeta:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.tarjeta}"
    padding: "1.5rem"
  indicador:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-principal}"
    typography: "{typography.cifra-destacada}"
    rounded: "{rounded.tarjeta}"
    padding: "1.25rem 1.5rem"
---

# Design System: El Quijote — Bodega de guarda

> **Fuente única de verdad del diseño.** Los valores normativos están en el frontmatter y en el bloque de tokens CSS (§ Tokens). El código **no** define colores, tipografías, radios, sombras ni duraciones fuera de `styles/tokens.css`. Si algo no está aquí, se añade aquí primero.
>
> Producto y contexto: ver `PRODUCT.md`. Plan de implementación: `docs/rediseno/PLAN.md`.

## Overview

**Concepto: «Bodega de guarda».** Es una fusión aprobada por el usuario entre dos referencias:

- **El estándar de la alta cocina:** fondo oscuro, titulares serif, fotografía a sangre, mucho aire y un solo dorado.
- **La gramática de la etiqueta de un vino de guarda:** etiqueta y contraetiqueta, filetes finos, numeración de añada y sello de la casa.

El resultado debe sentirse como abrir la carta de un restaurante exclusivo de noche: papel oscuro, tinta hueso, oro apagado, todo en su sitio.

**Cómo se reparten las dos referencias:**

- **La alta cocina pone el escenario.** En la parte pública: portada con fotografía a sangre y velo cálido, titulares en Fraunces con mucho aire, una sola llamada a la acción por pantalla y ritmo vertical amplio.
- **La etiqueta de vino pone la gramática:**
  - Cada sección se abre con una **etiqueta de sección**: número de lote («Nº 03»), nombre en versalitas espaciadas, **filete doble** ocre y título serif.
  - Los datos se leen como una **contraetiqueta**: pares rótulo/valor separados por filetes finos y cifras tabulares (origen, maridaje, alérgenos, precio; en el admin: periodo, comparación, fuente).
  - Un **sello de la casa**, el molino del logo dentro de un círculo con filete, aparece **una vez por página** como firma, nunca como decoración repetida.

**Modo por superficie:**

- **Landing y páginas públicas (persuadir):** se compromete del todo con el concepto.
- **Paneles (operar):** el concepto se queda en los detalles: etiquetas de sección, filetes, cifras serif en los indicadores y contraetiquetas en los detalles. Lo demás es contención, densidad legible y patrones conocidos.

**Mejoras incorporadas de las propuestas descartadas:**

- Los estados cambian el relleno y el filete, no solo el tinte.
- Los filetes y motivos se repiten en unidades enteras, nunca cortados.
- Las cifras van en columnas fijas tabulares, para que no bailen al actualizarse.
- Cada plato o vino muestra siempre sus datos clave al lado.
- El foco es lo más luminoso de la pantalla.

**Referencias de nivel de acabado** (decisión D-14 del usuario). Marcan el listón de calidad; no son maquetas que copiar. El mundo lo manda «Bodega de guarda».

- **The Macallan, TimeSpirit Dining Experience** (`themacallan.com`): imagen cinematográfica oscura y cálida, ritmo pausado, pocas palabras por pantalla y una sola invitación clara a reservar. *Su página bloquea las descargas automáticas (403); la referencia se toma del conocimiento general de la marca y debe contrastarla una persona en el navegador.*
- **Restaurant Fontané** (`restaurantfontane.com`, del grupo El Celler de Can Roca): contención extrema. Un logotipo, una frase de identidad («Honest, noble, with a touch of sophistication»), la carta y la reserva siempre a un clic, y un pie con dirección, teléfono y condiciones.

**Lo que se toma de ellas:**

- **Pocas piezas por pantalla.** Cada sección de la landing dice una sola cosa.
- **«Reservar» siempre a mano.** Botón compacto persistente en la cabecera, además de la sección `#reservar`.
- **Transiciones lentas y sobrias** (`--duracion-pausada`), nunca efectos.
- **Fotografía grande y oscura** con texto mínimo encima.

**Anti-referencias:**

- La paleta naranja `#e85d04` y la slate fría de la versión anterior.
- Las tarjetas redondeadas con sombras blandas tipo plantilla SaaS.
- Gradientes de texto, glassmorphism y emojis como iconos.
- Títulos en mayúsculas en serif.
- Rejillas de tarjetas idénticas como único recurso.

## Colors

Tema **oscuro por defecto**; tema **claro** disponible desde el panel de accesibilidad. Los dos temas usan **los mismos nombres de token**; solo cambian los valores (§ Tokens).

### Primary

- **`--color-acento`** (oscuro `#C9A267` / claro `#835E25`): oro apagado u ocre de bodega. Se usa en filetes de sección, botón primario, número de lote, enlace activo y sello. **Como mucho una superficie rellena de acento por pantalla**, que es el botón primario; el resto son trazos y texto.
- **`--color-acento-intenso`** (`#DBB97F` / `#6C4C1B`): hover y estado pulsado del acento.
- **`--color-texto-sobre-acento`** (`#14100C` / `#FBF8F2`): texto e iconos sobre relleno de acento.
- **`--color-foco`** (`#E8C98F` / `#6C4C1B`): anillo de foco. Es lo más luminoso de la pantalla en el tema oscuro.

### Neutral

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--color-fondo` | `#14100C` negro cálido | `#F4EEE3` hueso | Fondo de página |
| `--color-superficie` | `#1C1712` | `#FBF8F2` | Tarjetas, campos, tablas |
| `--color-superficie-elevada` | `#262019` | `#FFFFFF` | Diálogos, menús, paneles laterales |
| `--color-superficie-cafe` | `#2B2119` | `#EBE1D0` | Bandas destacadas (bodega, reserva), fila seleccionada |
| `--color-borde-sutil` | `#2E261F` | `#E2D8C8` | Separadores decorativos (no transmiten información) |
| `--color-borde-control` | `#7D6E5A` | `#8C7C66` | Bordes de campos, casillas y controles (≥ 3:1) |
| `--color-texto-principal` | `#EFE7DA` blanco hueso | `#1E1813` | Texto principal, logo |
| `--color-texto-secundario` | `#BDB09C` | `#54473A` | Texto de apoyo |
| `--color-texto-tenue` | `#978A76` | `#6A5C4B` | Metadatos, marcadores de posición, pies |

El blanco hueso del texto principal es el «blanco del logo»: el logo se pinta siempre con `currentColor` sobre `--color-texto-principal`. **Nunca** se usan `#000` ni `#fff` puros en texto o fondos de página.

### Estados (reservados)

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--color-error` | `#E8846F` | `#A43A2A` | Errores de validación y fallos |
| `--color-exito` | `#9CC08F` | `#3D6838` | Confirmaciones |
| `--color-aviso` | `#D9AE5B` | `#7F5A12` | Advertencias, datos de ejemplo |
| `--color-info` | `#9DB4C7` | `#2F5672` | Información neutra |

Los estados **siempre** van con icono y texto, nunca solo con color. Para el fondo de un aviso se usa `color-mix(in oklab, var(--color-error) 12%, var(--color-superficie))`, sin tokens adicionales.

### Gráficas (solo en los paneles)

Paleta categórica en orden fijo (nunca rotada; a partir de la 5.ª serie se agrupa en «Otros»). Validada con el script de la guía de visualización: CVD ΔE ≥ 10, visión normal ΔE ≥ 24.

| Token | Oscuro | Claro |
|---|---|---|
| `--color-grafica-1` | `#BA882E` | `#A76C12` |
| `--color-grafica-2` | `#3578B8` | `#175D9B` |
| `--color-grafica-3` | `#B84455` | `#AE3B4C` |
| `--color-grafica-4` | `#56A76A` | `#60A563` ⚠ 2,81:1 (exige etiquetas directas o vista de tabla) |

Una sola serie siempre usa `--color-grafica-1`. El texto de las gráficas usa los tokens de texto, nunca el color de la serie.

### Contraste verificado (WCAG 2.2 AA)

Calculado con la fórmula de luminancia relativa de WCAG. Mínimos: 4,5:1 para texto normal y 3:1 para bordes de control y foco.

**Tema oscuro**

| Primer plano | fondo | superficie | superficie-elevada | superficie-cafe | Mínimo |
|---|---|---|---|---|---|
| `--color-texto-principal` | 15.43 | 14.49 | 13.13 | 12.83 | 12.83 ✔ |
| `--color-texto-secundario` | 8.88 | 8.35 | 7.56 | 7.39 | 7.39 ✔ |
| `--color-texto-tenue` | 5.60 | 5.26 | 4.77 | 4.66 | 4.66 ✔ |
| `--color-acento` | 7.98 | 7.49 | 6.79 | 6.63 | 6.63 ✔ |
| `--color-acento-intenso` | 10.15 | 9.54 | 8.64 | 8.44 | 8.44 ✔ |
| `--color-error` | 7.18 | 6.74 | 6.11 | 5.97 | 5.97 ✔ |
| `--color-exito` | 9.33 | 8.77 | 7.94 | 7.76 | 7.76 ✔ |
| `--color-aviso` | 9.16 | 8.60 | 7.79 | 7.61 | 7.61 ✔ |
| `--color-info` | 8.82 | 8.29 | 7.51 | 7.33 | 7.33 ✔ |
| `--color-borde-control` (no texto) | 3.83 | 3.60 | 3.26 | 3.19 | 3.19 ✔ |
| `--color-foco` (no texto) | 11.88 | 11.17 | 10.12 | 9.88 | 9.88 ✔ |

`--color-texto-sobre-acento` sobre `--color-acento`: 7.98 · sobre `--color-acento-intenso`: 10.15.

**Tema claro**

| Primer plano | fondo | superficie | superficie-elevada | superficie-cafe | Mínimo |
|---|---|---|---|---|---|
| `--color-texto-principal` | 15.21 | 16.57 | 17.57 | 13.56 | 13.56 ✔ |
| `--color-texto-secundario` | 7.77 | 8.47 | 8.98 | 6.93 | 6.93 ✔ |
| `--color-texto-tenue` | 5.60 | 6.10 | 6.47 | 5.00 | 5.00 ✔ |
| `--color-acento` | 5.06 | 5.51 | 5.84 | 4.51 | 4.51 ✔ |
| `--color-acento-intenso` | 6.77 | 7.37 | 7.81 | 6.03 | 6.03 ✔ |
| `--color-error` | 5.65 | 6.16 | 6.53 | 5.04 | 5.04 ✔ |
| `--color-exito` | 5.62 | 6.12 | 6.49 | 5.01 | 5.01 ✔ |
| `--color-aviso` | 5.39 | 5.87 | 6.22 | 4.81 | 4.81 ✔ |
| `--color-info` | 6.75 | 7.35 | 7.79 | 6.02 | 6.02 ✔ |
| `--color-borde-control` (no texto) | 3.50 | 3.82 | 4.05 | 3.12 | 3.12 ✔ |
| `--color-foco` (no texto) | 6.77 | 7.37 | 7.81 | 6.03 | 6.03 ✔ |

`--color-texto-sobre-acento` sobre `--color-acento`: 5.51 · sobre `--color-acento-intenso`: 7.37.

`--color-borde-sutil` (1,22–1,27:1) es **decorativo a propósito**: nunca delimita por sí solo un control ni transmite información. **Texto sobre fotografía:** se coloca siempre sobre el velo `--velo-fotografia` y se comprueba con axe en la imagen real (criterio de aceptación en el PLAN).

### Named Rules

- **Un solo oro:** por pantalla, como mucho una superficie rellena de acento.
- **Logo blanco, siempre `currentColor`:** el logo y el sello heredan el color del texto principal.
- **Nada de naranja:** el `#e85d04` y sus derivados desaparecen del código.

## Typography

Dos familias de Google Fonts **autoalojadas con `next/font/google`** (sin peticiones a Google en tiempo de ejecución), `display: "swap"`, subconjunto `latin` (incluye ñ y tildes) y `adjustFontFallback` activo para reducir el salto al cambiar de fuente:

| Rol | Familia | Variable CSS | Ejes | Pila de respaldo |
|---|---|---|---|---|
| Títulos, cifras destacadas, números de lote | **Fraunces** (variable) | `--fuente-titulos` | `opsz`, `SOFT`; estilos normal e itálica | `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif` |
| Texto, interfaz, etiquetas, cifras de tabla | **DM Sans** (variable) | `--fuente-texto` | `opsz` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |

Son las mismas fuentes de la app móvil del proyecto, lo que da coherencia de marca. Se eligieron frente a otras opciones porque Fraunces tiene un eje óptico (`opsz`) que la hace delicada en tamaños de portada y robusta en tamaños pequeños, con un aire de imprenta antigua acorde con el logo. DM Sans es geométrica y sobria, y no compite con ella. Las pilas de respaldo se eligieron por su proporción: Palatino e Iowan son las serif de sistema más cercanas a Fraunces; las sans de sistema sustituyen bien a DM Sans.

Se eliminan Ibarra Real Nova, Inter y Roboto, y la carga por `<link>`.

### Hierarchy

| Token tipográfico | Familia | Tamaño | Peso | Interlineado | Uso |
|---|---|---|---|---|---|
| `--texto-portada` | Fraunces (`opsz` automático, `SOFT 30`) | `clamp(2.75rem, 1.6rem + 5.2vw, 5.75rem)` | 380 | 1.02 | Un único titular de la portada |
| `--texto-titulo-1` | Fraunces | `clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem)` | 400 | 1.08 | `h1` de página |
| `--texto-titulo-2` | Fraunces | `clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem)` | 400 | 1.15 | Título de sección de la landing |
| `--texto-titulo-3` | Fraunces | `clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem)` | 500 | 1.2 | Platos, tarjetas destacadas |
| `--texto-titulo-interfaz` | DM Sans | `1.125rem` | 600 | 1.35 | Títulos de tarjeta, diálogo y bloque de panel |
| `--texto-entradilla` | DM Sans | `1.1875rem` | 400 | 1.6 | Primer párrafo de sección (máx. 60ch) |
| `--texto-cuerpo` | DM Sans | `1rem` | 400 | 1.65 (público) / 1.5 (panel) | Texto corrido (máx. 65ch) |
| `--texto-pequeno` | DM Sans | `0.875rem` | 400 | 1.5 | Ayudas, pies, metadatos |
| `--texto-etiqueta` | DM Sans, **MAYÚSCULAS**, espaciado 0.16em | `0.75rem` | 600 | 1.2 | Rótulos de sección, botones, cabeceras de tabla |
| `--texto-numero-lote` | Fraunces itálica | `0.9375rem` | 400 | 1 | «Nº 03» en la etiqueta de sección (color acento) |
| `--texto-cifra-destacada` | Fraunces, `font-variant-numeric: lining-nums tabular-nums` | `clamp(2rem, 1.7rem + 1.2vw, 2.75rem)` | 500 | 1 | Cifra principal de un indicador |
| `--texto-cifra-tabla` | DM Sans, `tabular-nums` | `0.9375rem` | 500 | 1.4 | Importes y cantidades en tablas y precios |

### Named Rules

- **Nunca menos de 12 px.** Desaparecen los `text-[9px]`, `text-[10px]` y `text-[11px]` (más de 420 usos hoy). El tamaño mínimo es `--texto-etiqueta` (0,75rem).
- **Mayúsculas solo en `--texto-etiqueta`.** Nunca en Fraunces ni en párrafos.
- **Títulos equilibrados:** `text-wrap: balance` en títulos y `text-wrap: pretty` en párrafos.
- **Cifras tabulares** en tablas, indicadores, precios y horas, para que no bailen al actualizarse.
- **Tipografía editorial:** `…` en lugar de `...`, comillas latinas «» o tipográficas, espacio duro entre cifra y unidad (`45 min`, `$ 320`). Los textos de carga terminan en `…`.
- **Tamaño de texto escalable:** todas las medidas tipográficas van en `rem`. El panel de accesibilidad cambia el `font-size` raíz (100 %, 112,5 % o 125 %) y todo escala a la vez.

## Layout

- **Unidad base 4 px.** Escala de espacio: `--espacio-2xs` 0.25rem · `--espacio-xs` 0.5rem · `--espacio-sm` 0.75rem · `--espacio-md` 1rem · `--espacio-lg` 1.5rem · `--espacio-xl` 2rem · `--espacio-2xl` 3rem · `--espacio-3xl` 4rem · `--espacio-4xl` 6rem.
- **Tokens semánticos de maquetación:**
  - `--espacio-entre-secciones: clamp(4rem, 2.5rem + 6vw, 8rem)`
  - `--margen-pagina: clamp(1rem, 0.5rem + 2.5vw, 2.5rem)`, al que se suma `env(safe-area-inset-left/right)`
  - `--ancho-lectura: 65ch`
  - `--ancho-contenido: 72rem`
  - `--ancho-amplio: 90rem`
  - `--alto-cabecera: 4rem`
- **Puntos de corte:** los de Tailwind (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem). Anchos de prueba obligatorios: **360, 390, 768, 1024 y 1440 px**. Nada puede romperse ni generar scroll horizontal en 360 px.
- **Alturas de ventana:** `min-height: 100dvh`, con `100vh` como respaldo previo. Nunca `100vh` solo en móvil.
- **Zonas seguras:** cabecera fija, barra inferior y panel lateral usan `env(safe-area-inset-*)`. El viewport declara `viewport-fit=cover`.
- **Áreas táctiles:** mínimo 44 × 44 px en todo elemento interactivo (`.area-tactil-minima`), incluidos los iconos-botón y los enlaces de la cabecera.
- **Anclas:** las secciones de la landing llevan `scroll-margin-top: calc(var(--alto-cabecera) + var(--espacio-md))` para que la cabecera fija no las tape.

### Composición de la landing (una sola página)

La landing tiene una sola columna narrativa con alternancia de fondos (`fondo` y `superficie-cafe`). Solo muestra contenido para el comensal; **nada del personal**. Secciones, cada una con su ancla:

1. **Portada** (`#inicio`): fotografía a sangre con velo, titular de portada, lema, botón primario «Reservar mesa» y botón secundario «Ver la carta».
2. **La casa** (`#la-casa`): historia e imagen, contenido actual de «acerca de».
3. **La carta** (`#carta`): categorías destacadas y platos con su contraetiqueta. Enlace a la carta completa en `/menu`.
4. **Promociones** (`#promociones`).
5. **Reservar** (`#reservar`): banda `superficie-cafe` con el sello de la casa y el enlace a `/reservations`.
6. **Pedir** (`#pedir`): pedir en mesa o a domicilio, con enlaces a las páginas de acción.
7. **Visítanos** (`#visitanos`): dirección, horario, mapa enlazado (sin iframe) y redes sociales.

**Bodega:** no existe todavía contenido de vinos. La sección queda reservada en el diseño, pero no se pinta hasta que el API exponga los datos (ver NOTAS-PENDIENTES).

**Navegación pública:**

- La cabecera tiene logo, enlaces a anclas con estado activo por sección visible y acceso a la cuenta del comensal.
- Las páginas de acción (`/reservations`, `/menu`, `/menu/pedido`, checkout, `/login`, `/register`, `/profile`, legales) llevan **migas de pan** («Inicio › La carta › Entradas») y un botón **Volver** que regresa a la sección de origen (`/#carta`) o usa el historial cuando procede del mismo sitio.
- **El acceso del personal** solo existe como un enlace discreto en la última fila del pie («Acceso del personal», con `--color-texto-tenue` y tamaño `--texto-pequeno`). Ninguna función operativa aparece en la parte pública.

### Paneles

- Sidebar de 16rem en `lg` o más.
- Por debajo de 1024 px, un **panel lateral** (drawer) con botón de menú en la barra superior.
- Contenido con `max-width: var(--ancho-amplio)`.
- Primera fila: **como mucho 4 indicadores**, y el primero, más ancho, es la cifra protagonista.
- Debajo, un bloque principal (tabla o gráfica) y uno secundario.
- Las tablas pasan a **tarjetas apiladas por debajo de 768 px**, siguiendo el patrón de reservas.

## Elevation & Depth

En el tema oscuro, la profundidad se expresa **con el tono de la superficie**, no con sombras: `fondo` → `superficie` → `superficie-elevada`. Las sombras quedan para lo que flota sobre la página.

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--sombra-flotante` | `0 16px 40px rgb(0 0 0 / 0.5)` | `0 16px 40px rgb(30 24 19 / 0.14)` | Diálogos, menús desplegables, panel lateral |
| `--sombra-cabecera` | `0 1px 0 var(--color-borde-sutil)` | igual | Cabecera fija al hacer scroll |
| `--velo-fotografia` | `linear-gradient(to top, rgb(20 16 12 / 0.92) 0%, rgb(20 16 12 / 0.6) 45%, rgb(20 16 12 / 0.2) 100%)` | igual (la foto siempre lleva el velo oscuro) | Texto sobre fotografía |

### Named Rules

- **Sin sombras de colores.** Desaparecen los `shadow-[...rgba(232,93,4,...)]`.
- **Sin desenfoques decorativos.** Solo se permite `backdrop-filter` en la cabecera fija, con respaldo opaco si `@supports` falla.

## Shapes

Formas rectas y precisas, como una etiqueta impresa:

- `--radio-control: 2px` para botones, campos y casillas.
- `--radio-tarjeta: 4px` para tarjetas, indicadores e imágenes.
- `--radio-dialogo: 6px`.
- `--radio-pastilla: 999px`, **solo** para insignias de estado y contadores.

**Filetes:**

- `--grosor-filete: 1px`.
- **Filete doble** (`.filete-doble`): dos líneas de 1 px separadas 3 px, en `--color-acento`. Se repite en unidades enteras, nunca recortado.
- Los separadores comunes son de 1 px en `--color-borde-sutil`.

El **sello de la casa** es la única forma circular grande: el molino del logo dentro de un círculo con filete doble.

## Components

Todos los componentes viven en `components/ui/` (primitivas) y `components/marca/` (piezas de identidad). Se estilizan con utilidades de Tailwind generadas a partir de los tokens y con **clases de nombre explícito** para los patrones de marca. Cada componente documenta y prueba **todos sus estados**: reposo, hover, pulsado, foco visible, deshabilitado, cargando, error, vacío y seleccionado, según corresponda.

### Buttons — `Boton` y `BotonEnlace`

**Variantes:**

- `primario`: relleno de acento.
- `secundario`: filete de 1 px en `--color-texto-principal` y fondo transparente.
- `fantasma`: solo texto con subrayado al hover.
- `peligro`: filete y texto en `--color-error`; relleno solo al confirmar.

**Medidas:** alto 2,75rem (44 px); `--texto-etiqueta`.

**Estados:**

- **Hover:** el acento pasa a acento intenso; en el secundario, el fondo pasa a `--color-superficie-cafe`.
- **Pulsado:** `translateY(1px)`.
- **Foco:** `outline: 2px solid var(--color-foco); outline-offset: 3px`.
- **Deshabilitado:** opacidad 0,5 con `cursor: not-allowed` y `aria-disabled`.
- **Cargando:** icono `LoaderCircle` girando, texto «Enviando…», `aria-busy="true"` y bloqueo de clics repetidos.

**Uso:** `BotonEnlace` envuelve `next/link`, para navegar sin `router.push` en botones.

### Inputs / Fields — `Campo`, `AreaTexto`, `Selector`, `Casilla`, `Interruptor`

- **Etiqueta y ayuda:** `<label for>` siempre visible, encima del control (sin etiquetas flotantes). La ayuda va en `--texto-pequeno`.
- **Errores:** debajo, en `--color-error` con el icono `CircleAlert`, enlazados con `aria-describedby`. El campo lleva `aria-invalid="true"`.
- **Atributos:** `autocomplete`, `inputmode`, `maxLength` y `spellcheck={false}` en correo y códigos.
- **Bordes:** `--color-borde-control`; en foco pasan a `--color-foco`, con anillo.
- **Contador** cuando hay límite de longitud.
- `Selector` nativo con `background-color` y `color` explícitos, para que respete el tema.
- **Al enviar con errores,** el foco va al primer campo inválido.

### Cards / Containers — `Tarjeta`, `Indicador`

- **`Tarjeta`:** superficie, filete sutil y `--radio-tarjeta`, sin sombra.
- **`Indicador`:**
  - Rótulo en `--texto-etiqueta`, cifra en `--texto-cifra-destacada` y comparación en `--texto-pequeno` («+8 % frente al martes pasado»), con icono de tendencia y texto.
  - **Estados:** cargando (esqueleto del mismo tamaño), error («No se pudo cargar», con botón Reintentar; nunca «$0»), sin comparación (no se muestra la línea) y **datos de ejemplo** (insignia «Datos de ejemplo» en `--color-aviso`).

### Navigation

- **`CabeceraSitio`** (componente de servidor con isla de cliente para la cuenta):
  - Fija, alto `--alto-cabecera`, transparente sobre la portada y `--color-fondo` con `--sombra-cabecera` al hacer scroll.
  - El enlace de la sección activa lleva `aria-current="true"` y filete inferior de acento.
  - Un `BotonEnlace` compacto **«Reservar»** (variante `secundario`, alto mínimo de 44 px) siempre visible, también en móvil junto al botón de menú. Es la única llamada a la acción persistente.
  - En móvil, menú en `PanelLateral` con trampa de foco y cierre con Esc.
- **`MigasDePan`:** `<nav aria-label="Migas de pan">` con `<ol>` y `aria-current="page"` en la última miga.
- **`BotonVolver`:** vuelve a la sección de origen.
- **`NavegacionPanel`:**
  - Usa `<Link>` con `aria-current="page"`, grupos con rótulo `--texto-etiqueta` y entradas **filtradas por rol** desde `config/navigation`.
  - El elemento activo lleva relleno `--color-superficie-cafe` y un filete de acento a la izquierda: cambia el relleno, no solo el tinte.
- **`PieSitio`:** de servidor. Contiene datos de contacto, horario, legales, redes con nombre accesible y, en la última fila, el «Acceso del personal».

### Signature components

- **`EtiquetaSeccion`:** el sello de identidad de cada sección. De arriba abajo:
  1. Número de lote (`--texto-numero-lote`, acento).
  2. Rótulo en `--texto-etiqueta`.
  3. Filete doble de acento de 3rem.
  4. Título (`h2`).
  5. Entradilla opcional.

  Clase: `.etiqueta-seccion`.
- **`Contraetiqueta`:** lista de definiciones (`<dl>`) con pares rótulo/valor separados por filetes sutiles y cifras tabulares, a una o dos columnas. Se usa en el detalle de plato, la ficha de vino futura, el resumen de pedido, el resumen de reserva y el detalle en paneles. Clase: `.contraetiqueta`.
- **`SelloCasa`:** SVG del molino en un círculo con filete doble, 6rem en escritorio y 4,5rem en móvil. Una vez por página. Decorativo (`aria-hidden`).
- **`Logo`:** SVG local con `fill="currentColor"`. Sustituye las URL de Cloudinary y elimina el SVG remoto.

### Otros componentes base

- **`Dialogo`** y **`PanelLateral`** (Radix): trampa de foco, `overscroll-behavior: contain`, cierre con Esc y un botón con nombre accesible. Sustituyen a `alert()` y `confirm()`.
- **`Aviso`**: en línea, con `role="status"` o `role="alert"` según la gravedad.
- **`Notificacion`**: región con `aria-live="polite"`.
- **`Tabla`**: `<table>` semántica con `<caption>` oculto para lectores.
  - Por encima de 768 px: scroll horizontal con contenedor enfocable.
  - Por debajo: tarjetas con contraetiqueta.
- **`EstadoVacio`**: ilustración lineal mínima, frase que explica el vacío y una acción.
- **`Esqueleto`**: bloques `--color-superficie-elevada` con pulso de opacidad, sin pulso si el movimiento está reducido.
- **`Insignia`**, **`Pestanas`** (el estado seleccionado lleva filete doble inferior) y **`Paginacion`**.
- **`Imagen`**: envoltorio de `next/image` con el cargador de Cloudinary y un respaldo que sí existe.
- **`PanelAccesibilidad`**: ver más abajo.

### Iconos

**Una sola librería: Lucide** (`lucide-react`, ya instalada y usada en 120 archivos). Se importan **solo los iconos usados** por nombre; Next optimiza el paquete con `optimizePackageImports`.

- **Trazo:** `strokeWidth={1.5}`.
- **Tamaño:** 1.25rem en la interfaz y 1rem en línea con texto.
- **Accesibilidad:** `aria-hidden="true"` si son decorativos; los iconos-botón llevan `aria-label`.
- **Sustituciones:** se eliminan los 22 SVG hechos a mano. Las únicas excepciones son las piezas de marca (`Logo`, `SelloCasa` y, si se conservan, `MolinoAnimado` y `Plato`), que son ilustraciones, no iconos.
- **Redes sociales:** Lucide no tiene logotipos de marca. Se usan los iconos genéricos `Facebook`/`Instagram` de Lucide si existen en la versión instalada; si no, el texto del nombre de la red.

### Panel de opciones de accesibilidad — `PanelAccesibilidad`

Se abre desde un botón de la cabecera (icono `Settings2`, «Opciones de accesibilidad») y desde el pie.

| Opción | Valores | Por defecto |
|---|---|---|
| Tema | Oscuro · Claro | Oscuro |
| Tamaño de texto | Normal (100 %) · Grande (112,5 %) · Muy grande (125 %) | Normal |
| Movimiento | Según el sistema · Reducido | Según el sistema (`prefers-reduced-motion`) |

- **Dónde se guarda:** se persiste **solo esto** en `localStorage`, con la clave `elquijote:preferencias` y el formato `{ v: 1, tema, tamanoTexto, movimiento }`, sin datos personales. Es el único uso permitido de `localStorage` en toda la aplicación.
- **Sin parpadeo:** un script en línea mínimo, con `nonce` de la CSP, se ejecuta en `<head>` antes de pintar. Fija `data-tema`, `data-tamano-texto` y `data-movimiento` en `<html>`, junto con `color-scheme` y `<meta name="theme-color">`. Si `localStorage` falla, aplica los valores por defecto sin error.

## Motion

El movimiento es sobrio: confirma, nunca adorna.

| Token | Valor | Uso |
|---|---|---|
| `--duracion-instantanea` | `100ms` | Pulsado y cambio de color de un control |
| `--duracion-breve` | `180ms` | Hover y foco |
| `--duracion-media` | `240ms` | Diálogos, panel lateral y menús |
| `--duracion-pausada` | `480ms` | Aparición de secciones al entrar en pantalla (una sola vez) |
| `--curva-salida` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entradas |
| `--curva-estandar` | `cubic-bezier(0.4, 0, 0.2, 1)` | Cambios de estado |

- **Qué se anima:** solo `transform` y `opacity`, con las propiedades listadas. Nunca `transition: all`.
- **Aparición de secciones:** opacidad 0→1 y `translateY(12px)` → 0, una vez, con `IntersectionObserver`. Si JavaScript no llega, el contenido es visible.
- **Diálogos:** opacidad con escala 0,98 → 1.
- **Prohibido:** sin parallax, sin vídeo en autoplay y sin animaciones en bucle.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` o `data-movimiento="reducido"`, todas las duraciones pasan a `0.01ms`, desaparecen los desplazamientos (solo cambios de opacidad instantáneos) y el `scroll-behavior` deja de ser `smooth`.

## Tokens (`styles/tokens.css`) — el único lugar donde se definen valores

```css
/* styles/tokens.css — valores de diseño. Cambiar un color o una fuente = editar SOLO este archivo. */
@theme {
  /* Color — tema oscuro (por defecto) */
  --color-fondo: #14100C;
  --color-superficie: #1C1712;
  --color-superficie-elevada: #262019;
  --color-superficie-cafe: #2B2119;
  --color-borde-sutil: #2E261F;
  --color-borde-control: #7D6E5A;
  --color-texto-principal: #EFE7DA;
  --color-texto-secundario: #BDB09C;
  --color-texto-tenue: #978A76;
  --color-acento: #C9A267;
  --color-acento-intenso: #DBB97F;
  --color-texto-sobre-acento: #14100C;
  --color-foco: #E8C98F;
  --color-error: #E8846F;
  --color-exito: #9CC08F;
  --color-aviso: #D9AE5B;
  --color-info: #9DB4C7;
  --color-grafica-1: #BA882E;
  --color-grafica-2: #3578B8;
  --color-grafica-3: #B84455;
  --color-grafica-4: #56A76A;

  /* Radios */
  --radius-control: 2px;
  --radius-tarjeta: 4px;
  --radius-dialogo: 6px;
  --radius-pastilla: 999px;

  /* Sombras */
  --shadow-flotante: 0 16px 40px rgb(0 0 0 / 0.5);

  /* Movimiento */
  --ease-salida: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-estandar: cubic-bezier(0.4, 0, 0.2, 1);
}

@theme inline {
  /* Fuentes: las variables --fuente-* las crea next/font en <html> */
  --font-titulos: var(--fuente-titulos), "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --font-texto: var(--fuente-texto), system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

:root {
  color-scheme: dark;
  --texto-portada: clamp(2.75rem, 1.6rem + 5.2vw, 5.75rem);
  --texto-titulo-1: clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem);
  --texto-titulo-2: clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem);
  --texto-titulo-3: clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem);
  --texto-titulo-interfaz: 1.125rem;
  --texto-entradilla: 1.1875rem;
  --texto-cuerpo: 1rem;
  --texto-pequeno: 0.875rem;
  --texto-etiqueta: 0.75rem;
  --texto-numero-lote: 0.9375rem;
  --texto-cifra-destacada: clamp(2rem, 1.7rem + 1.2vw, 2.75rem);
  --texto-cifra-tabla: 0.9375rem;

  --espacio-2xs: 0.25rem; --espacio-xs: 0.5rem; --espacio-sm: 0.75rem; --espacio-md: 1rem;
  --espacio-lg: 1.5rem; --espacio-xl: 2rem; --espacio-2xl: 3rem; --espacio-3xl: 4rem; --espacio-4xl: 6rem;
  --espacio-entre-secciones: clamp(4rem, 2.5rem + 6vw, 8rem);
  --margen-pagina: clamp(1rem, 0.5rem + 2.5vw, 2.5rem);
  --ancho-lectura: 65ch;
  --ancho-contenido: 72rem;
  --ancho-amplio: 90rem;
  --alto-cabecera: 4rem;
  --grosor-filete: 1px;

  --sombra-cabecera: 0 1px 0 var(--color-borde-sutil);
  --velo-fotografia: linear-gradient(to top, rgb(20 16 12 / 0.92) 0%, rgb(20 16 12 / 0.6) 45%, rgb(20 16 12 / 0.2) 100%);

  --duracion-instantanea: 100ms;
  --duracion-breve: 180ms;
  --duracion-media: 240ms;
  --duracion-pausada: 480ms;
}

:root[data-tema="claro"] {
  color-scheme: light;
  --color-fondo: #F4EEE3;
  --color-superficie: #FBF8F2;
  --color-superficie-elevada: #FFFFFF;
  --color-superficie-cafe: #EBE1D0;
  --color-borde-sutil: #E2D8C8;
  --color-borde-control: #8C7C66;
  --color-texto-principal: #1E1813;
  --color-texto-secundario: #54473A;
  --color-texto-tenue: #6A5C4B;
  --color-acento: #835E25;
  --color-acento-intenso: #6C4C1B;
  --color-texto-sobre-acento: #FBF8F2;
  --color-foco: #6C4C1B;
  --color-error: #A43A2A;
  --color-exito: #3D6838;
  --color-aviso: #7F5A12;
  --color-info: #2F5672;
  --color-grafica-1: #A76C12;
  --color-grafica-2: #175D9B;
  --color-grafica-3: #AE3B4C;
  --color-grafica-4: #60A563;
  --shadow-flotante: 0 16px 40px rgb(30 24 19 / 0.14);
}

:root[data-tamano-texto="grande"] { font-size: 112.5%; }
:root[data-tamano-texto="muy-grande"] { font-size: 125%; }

@media (prefers-reduced-motion: reduce) {
  :root:not([data-movimiento="completo"]) { --duracion-instantanea: 0.01ms; --duracion-breve: 0.01ms; --duracion-media: 0.01ms; --duracion-pausada: 0.01ms; }
}
:root[data-movimiento="reducido"] { --duracion-instantanea: 0.01ms; --duracion-breve: 0.01ms; --duracion-media: 0.01ms; --duracion-pausada: 0.01ms; }
```

**Integración con Tailwind v4:**

- Los colores definidos en `@theme` generan utilidades con nombre propio: `bg-fondo`, `bg-superficie`, `text-texto-principal`, `border-borde-control`, `text-acento`, `rounded-tarjeta`, `font-titulos`, `font-texto`, `shadow-flotante`, `ease-salida`.
- El tema claro **solo redefine las variables**, así que las utilidades no cambian. Se elimina la variante `dark:` y no se escriben clases condicionales por tema.
- En `styles/globals.css` se declara `@custom-variant dark (&:where(:root:not([data-tema="claro"]), :root:not([data-tema="claro"]) *));` únicamente como red de seguridad durante la migración: las clases `dark:` heredadas se aplican mientras el tema no sea claro, porque el oscuro es el tema por defecto y no lleva atributo. Se retira con los alias temporales (PLAN 5.20).

**Clases explícitas** (en `styles/componentes.css`, capa `@layer components`): `.contenedor-pagina`, `.seccion-landing`, `.etiqueta-seccion`, `.filete-doble`, `.contraetiqueta`, `.texto-cifra-destacada`, `.numeros-tabulares`, `.enlace-subrayado`, `.area-tactil-minima`, `.solo-lectores`, `.salto-al-contenido`, `.titulo-equilibrado`, `.aparece-al-entrar`. Cada nombre dice lo que hace; no se crean clases genéricas tipo `.card2` o `.btn-x`.

## Do's and Don'ts

### Do:

- **Do** abrir cada sección pública con `EtiquetaSeccion` y numerarlas en orden («Nº 01» … «Nº 07»).
- **Do** usar una sola llamada a la acción rellena por pantalla; la secundaria va en `secundario` o `fantasma`.
- **Do** mostrar los datos de un plato, vino, pedido o reserva como `Contraetiqueta`, con cifras tabulares.
- **Do** etiquetar como «Datos de ejemplo» cualquier cifra que no venga del API.
- **Do** mostrar un error como error («No se pudo cargar», con Reintentar), nunca como cero.
- **Do** probar cada pantalla en 360, 390, 768, 1024 y 1440 px, en los dos temas y con texto al 125 %.
- **Do** usar `rem` para todo lo tipográfico y para los espacios que deben crecer con el texto.

### Don't:

- **Don't** usar colores, tamaños, radios, sombras o duraciones literales fuera de `styles/tokens.css`. Están prohibidos los `bg-[#...]`, `text-[11px]` y `style={{ color: ... }}`.
- **Don't** usar el naranja `#e85d04`, la paleta slate fría, `bg-white`, `#000` o `#fff` puros.
- **Don't** usar gradientes en el texto, glassmorphism, sombras de colores, bordes laterales gruesos de color como decoración, ni emojis como iconos o imágenes.
- **Don't** poner títulos en mayúsculas ni en Fraunces menor de 1.25rem.
- **Don't** construir secciones como rejillas de tarjetas idénticas con icono, título y texto; la carta se compone como una carta, no como una plantilla de características.
- **Don't** mostrar en la parte pública nada del personal: ni paneles, ni roles, ni accesos visibles en la cabecera.
- **Don't** animar `width`, `height`, `top`, `left` ni usar `transition: all`; no hay animaciones en bucle ni parallax.
- **Don't** repetir el sello de la casa más de una vez por página.
