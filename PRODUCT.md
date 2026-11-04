# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Comensales** (público): personas que eligen dónde cenar o celebrar, revisan la carta, reservan mesa, piden en mesa (QR / número de mesa) o a domicilio y pagan en línea. Llegan sobre todo desde el móvil.
- **Gerencia / administración** (uso diario en escritorio): revisa ventas, reservas, inventario, carta, promociones, personal y reportes.
- **Caja** (escritorio o tablet en mostrador): cobra tickets y cierra turnos.
- Roles secundarios existentes en el código: mesero (móvil) y cocina (pantalla de comandas). No son el foco de este rediseño, pero sus pantallas deben seguir funcionando y no romperse en móvil o tablet.

## Product Purpose

Sitio web de **El Quijote** con dos caras:

1. **Parte pública**: una sola landing larga dividida en secciones (navegación por anclas `#`) que muestra un poco de todo; las acciones que lo requieran (reservar, pedir en mesa, pedir a domicilio, pagar, cuenta) viven en páginas propias, con migas de pan y botón de regreso para volver a la sección de origen.
2. **Parte administrativa**: paneles por rol con pocos indicadores clave, jerarquía clara y tablas responsivas.

Éxito: el comensal entiende la propuesta y reserva o pide sin fricción en cualquier dispositivo; la gerencia y la caja leen el estado del día de un vistazo.

## Positioning

Restaurante de **comida mexicana** en el centro de Huejutla de Reyes, Hidalgo (decisión D-22 del usuario, 2026-11-03). El enfoque principal es la comida; el vino es una de las bebidas que se venden, sin especialización: no hay carta de vinos, bodega ni maridajes. El copy original del sitio hablaba de «cocina mexicana de alta gama», y `config/restaurant.config.ts` describe la carta como «cocina nacional e internacional». Los datos factuales (dirección, horario, teléfono, cifras, historia) salen solo de la configuración o del API; lo que falte está por confirmar con el restaurante (`docs/rediseno/PLAN-AMPLIACION.md`).

## Operating Context

- Los datos llegan de una API externa (`NEXT_PUBLIC_API_URL`); las imágenes, de Cloudinary.
- Existe una app móvil del mismo proyecto que usa Fraunces y DM Sans.
- La caja trabaja en mostrador con tablet o escritorio; la gerencia, en portátil o PC.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19, Tailwind CSS 4, pnpm.
- Funcionalidad existente: carta por categorías y detalle de producto, pedido en mesa, checkout con Stripe y facturación (RFC/CFDI), reservas con mapa de mesas, registro e inicio de sesión, perfil, promociones, páginas legales; paneles de admin (inicio, reportes, finanzas, facturas, nómina, inventario, proveedores, carta, reservas, predicción, usuarios, promociones, ajustes, acerca de, rendimiento de BD), caja, mesero y cocina.
- Restricción del rediseño: solo UI, UX y seguridad aplicable desde la interfaz o la configuración del front, ampliada por las decisiones D-22 a D-38 (`docs/rediseno/PLAN-AMPLIACION.md`): textos de identidad, retirada de los datos de ejemplo y conexión con el API, con los cambios del API aditivos y compatibles con la app móvil.

## Brand Commitments

- Nombre: **El Quijote** — Restaurante. Lema actual: "Sabor con Alma".
- Logo: tipografía serif antigua en versalitas con un molino de viento en lugar de la "O" y una lanza como subrayado; versión blanca (para fondo oscuro) y negra. Hoy se sirve desde Cloudinary.
- Concepto visual pedido por el usuario: clásico y cuidado, de restaurante con mesa bien puesta; sin plantillas ni estética genérica. La gramática de etiqueta (número de lote, filete doble, contraetiqueta) es solo estilo visual.
- Paleta pedida: derivada del logo blanco, con tonos café, ocre o dorado apagado, negro cálido y blanco hueso; tema oscuro por defecto y tema claro disponible.
- Tipografías de partida: Fraunces (títulos) y DM Sans (texto), las mismas de la app móvil.

## Evidence on Hand

- Logo SVG (blanco y negro) en Cloudinary, nube pública `dcb1tspbj`.
- Fotos de platillos y promociones: vienen de la API/Cloudinary; no se verificaron en esta etapa (el MCP de Cloudinary no estaba autorizado).
- No hay fotografías propias de sala ni de fachada en el repositorio; los fondos de login y registro usan una imagen propia de la nube (D-23). No hay testimonios, premios ni prensa: no se deben inventar.

## Product Principles

1. Una sola historia pública: la landing cuenta el restaurante completo; las páginas aparte existen solo para actuar.
2. Siempre hay camino de vuelta: migas de pan y regreso a la sección de origen.
3. Datos honestos: ningún dato de demostración se presenta como real; los fallos se muestran como fallos, no como cero.
4. Poco y claro en la administración: pocas cifras, la más importante primero.
5. Seguridad y privacidad por defecto: nada de la aplicación ni de la sesión queda guardado en el navegador.

## Accessibility & Inclusion

WCAG 2.2 AA como mínimo. Panel de opciones de accesibilidad con tema claro/oscuro, tamaño de texto y reducción de movimiento, aplicado sin parpadeo al cargar. Áreas táctiles de 44 px, teclado completo y foco visible.
