# Diagnóstico del front — El Quijote (estado previo al rediseño)

> **Fecha:** 2026-10-30 · **Rama:** `feature/rediseno-web` (creada desde `developer`, commit `922c05d`) · **Alcance:** solo lectura; en esta etapa no se modificó código de la aplicación.
>
> Este documento resume el diagnóstico y remite a cuatro anexos con el detalle por archivo y línea (A: estructura y estilos · B: imágenes, formularios y dashboards · C: seguridad del front · D: verificaciones y Lighthouse). Ningún valor de variable de entorno ni secreto aparece en este documento: los secretos se citan por archivo, línea y nombre, con el valor enmascarado.

## Estado actual (2026-11-05, tanda autónoma de ampliación)

> Este documento es el diagnóstico de partida (2026-10-30). Lo hecho después está en `BITACORA.md` y `PLAN-AMPLIACION.md`; este bloque resume el estado vigente.

| Área | Estado vigente |
|---|---|
| Base de datos | RLS en todas las tablas de `public`, con política para los roles propios; vistas con `security_invoker`; 46 índices de claves foráneas; deriva de Drizzle corregida; tabla de registros eliminados con restauración; correo único sin distinguir mayúsculas; motivo de cancelación y tipo de categoría. Avisos de seguridad de Supabase: sin ERROR ni WARN. |
| Acceso a datos desde la web | La web ya no accede a la BD: se retiraron las rutas internas `/api/inventory/*`, `lib/db`, los esquemas de Drizzle y `pg`. Solo queda la capa de sesión (`/api/auth/*`). |
| API (`fix/api-correcciones`, sin publicar) | Promociones, inventario del admin, listado de facturas, reactivación de usuarios, normalización de textos y teléfonos, cifrado preparado (escritura desactivada), motivo de cancelación obligatorio y predicción de ausencias desactivable. 394 pruebas en verde. |
| Web (`feature/rediseno-web-admin`) | Formularios con un solo clic, cierre de sesión caducada sin 401, usuarios del admin contra las rutas reales, facturas, inventario, WhatsApp en reservas, «Platos de la casa» solo con comida, formato «Primera mayúscula» y cifras de consola en los paneles. |
| Móvil (`feature/paridad-api-web`) | Formato «Primera mayúscula» y motivo obligatorio al cancelar. 457 pruebas en verde. |
| Preparado sin aplicar (requiere decisión o despliegue) | Migración B (mayúsculas), migración de teléfonos a E.164, escritura cifrada, CSP (2.5) y NP-47. |

## Cómo se obtuvo y límites de la medición

- Recorrido del código con búsquedas dirigidas, `pnpm install --frozen-lockfile`, `tsc --noEmit`, ESLint (preset de Next instalado fuera del repo, porque el proyecto no tiene configuración), `next build`, `next start` y Lighthouse 12.8 (Chrome headless) en móvil y escritorio.
- **No hay `.env` en el checkout.** El build se hizo con valores ficticios solo en el entorno del proceso; por eso la carta, el producto y las reservas se midieron en estado de error o vacío (sin backend ni base de datos).
- **Los dashboards no se midieron con Lighthouse** porque requieren sesión; se analizaron por código.
- El MCP de Cloudinary se autorizó el 2026-10-31 y se usó **solo para consultar** (§8.1). Antes, las imágenes se habían verificado por código y con `curl -I`.
- El disco `C:` del equipo está prácticamente lleno (≈0,5 GB libres): varias ejecuciones de Lighthouse fallaron por espacio. Cualquier herramienta pesada (navegadores de Playwright) debe instalarse en `D:`.

## Resumen ejecutivo

| Área | Estado | Gravedad |
|---|---|---|
| Seguridad | Hallazgos de seguridad en las rutas internas del front, la sesión, las dependencias y las cabeceras. Lo aplicable desde el front se resolvió en la fase 2 del PLAN; lo que depende del API está pendiente de endurecer en el API. El detalle se conserva fuera del repositorio. | **Crítica** |
| Producto y contenido | El copy dice "cocina **mexicana** de alta gama" (Huejutla de Reyes, Hidalgo); no existe carta de vinos. La landing solo pinta el hero (el resto de secciones está comentado). Reserva de la home **simulada** (`setTimeout`). | Alta |
| Datos | Seis pantallas de admin y la de caja muestran **mocks como si fueran datos reales**; ajustes, mesero y cocina persisten en `localStorage`. | Alta |
| Diseño | Paleta de facto naranja `#e85d04` + slate fría de Tailwind; 101 hex distintos; sin escala tipográfica (`text-[10px]` ×208); `dark:` no sigue al toggle; 5 familias de Google Fonts por `<link>` y el cuerpo en Ibarra Real Nova. | Alta |
| Componentes | ~27 componentes muertos (~5.500 líneas con la copia de `predictive`), 2 Button, 3 sidebars, 2 navbars, ~20 modales sin base común, 4–5 tarjetas de KPI. | Media |
| Accesibilidad | 0 `aria-invalid`, 0 `aria-describedby`, 1 `autocomplete`; etiquetas como `<span>`; 32 `alert()`; sidebar del admin sin versión móvil. Lighthouse a11y 90–92. | Alta |
| Rendimiento | Lighthouse móvil 47–74 (inicio 47, TBT 1,85 s, LCP > 4 s); escritorio 91–98. Navbar y footer se renderizan solo en cliente (`ssr:false`). | Alta |
| Calidad | Sin ESLint configurado (con el preset de Next: 233 errores / 135 avisos); sin pruebas; `tsc` limpio. | Media |

---

## 1. Versión de Next y router

- **Next 16.0.7**, React 19.2.1, TypeScript 5.9.3, Tailwind CSS 4.1.16 (configuración CSS-first), pnpm (el pnpm global del equipo está roto; se usó `npx pnpm@9`). Node 24.
- **Solo App Router** (`app/`); no existe `pages/`.
- `proxy.ts` (nombre de Next 16 para el middleware) protege únicamente `/dashboard/**` por rol; deja pasar todo `/api/*` y cualquier otra ruta. `middleware.ts.bk` es una copia comentada, pero está incluida en `tsconfig.json`.
- Alias `@/*` → raíz. `@/store` resuelve a `store.ts` de la raíz (marcado "TODO: Remove") antes que a la carpeta `store/`.

## 2. Estructura de carpetas

`app/` (rutas y 18 route handlers), `components/` (mezcla de primitivas, layout y lógica), `features/` (dominios del dashboard con mocks y servicios), `hooks/` (3 sin uso), `lib/` (cliente API, **Drizzle/PG**, sesión, `cn`), `providers/` (duplica `components/providers/`), `store/` (Redux, solo auth), `styles/` (`globals.css` de 826 líneas, ~520 de CSS muerto; `loading.css` sin importar), `types/`, `utils/` (clientes de Supabase sin uso, `validators.tsx`), `config/` (navegación por rol sin uso), `scripts/`, `public/` (solo iconos PWA y `sw.js`), `drizzle/` (migraciones).

En la raíz sobran scripts sueltos de base de datos (`check_backups.ts`, `delete_cron_date.cjs`, tres `setup_settings.*`), `store.ts`, `middleware.ts.bk`, `tailwind.config.js` (todo comentado) y documentos (`workplan.md`, `requisitos funcionales.md`). Detalle en el anexo A §2.

## 3. Páginas

**Públicas (17):** `/`, `/about`, `/promociones`, `/reservations`, `/menu`, `/menu/categoria/[slug]`, `/menu/producto/[id]`, `/menu/pedido`, `/menu/pedido/checkout`, `/menu/pedido/checkout/exito`, `/login`, `/register`, `/reset`, `/frm_reset`, `/profile`, legales (`/ayuda`, `/condiciones`, `/corporativo`, `/devoluciones`, `/privacidad`, `/seguridad`) y de sistema (`/forbidden`, `/unauthorized`, `/maintenance`, `/offline`).

**Administrativas (20):** `/dashboard` (redirige por rol) · admin: inicio, `about`, `db-performance`, `finance`, `finance/invoices`, `inventory`, `inventory/suppliers`, `menu`, `payroll`, `predictive`, `promociones`, `reports`, `reservations`, `settings`, `users` · `/dashboard/cajero`, `/dashboard/mesero`, `/dashboard/cocina`. **`/dashboard/cliente` no existe**: el rol 5 termina en 404.

Hallazgos: 46 de 50 páginas y layouts son client components (incluidas las legales, que no lo necesitan); `loading`, `error` y `not-found` solo existen en la raíz; `app/dashboard/layout.tsx` monta la sidebar de admin para todos los roles; `predictive/page copy.tsx` (1.719 líneas) vive dentro del árbol de rutas; la landing hace 6 peticiones cuyos datos no usa. Tabla completa en el anexo A §3.

## 4. Componentes

**Duplicados** (unificar en un único componente del sistema de diseño):

| Concepto | Hoy | Sustituto propuesto |
|---|---|---|
| Botón | `components/Button.tsx` (link-button), `components/ui/Button.tsx` (sin uso), clases `.btn-*`, decenas de botones inline | `Boton` + `BotonEnlace` |
| Navegación pública | `Navbar.tsx` + `ConditionalNavbar.tsx` (fetch a `/api/auth/me` en cada ruta, 7 SVG a mano, `cartCount` fijo a 3) | `CabeceraSitio` (servidor) con isla cliente de cuenta |
| Sidebar | `AdminSidebar` (botones con `router.push`), `layout/Sidebar` (muerto), `ActiveSidebar` (muerto), `ClientNav`/`BottomNav` (muertos), `config/navigation` (sin uso) | `NavegacionPanel` alimentada por `config/navigation` según rol |
| Tarjeta KPI | `KpiCard` (fondo inválido `var(--color-brand)15`), `StatCard`, `KitchenStats`, `InventoryStats`, CSS predictivo | `Indicador` |
| Contenedor | `SectionCard`, `.chart-card`, `.predictive-card`, `SupplierCard`, `MenuCard`, `.menu-card`, `.promo-card` | `Tarjeta` |
| Modal y drawer | ~20 modales y 3 drawers, cada uno con su overlay y su manejo de foco | `Dialogo` y `PanelLateral` (Radix, ya instalado) |
| Tema | `ThemeToggle` (muerto), lógica copiada en `ConditionalNavbar`, `useTheme` con MutationObserver, `ThemeProvider` vacío, `next-themes` sin usar | `PreferenciasAccesibilidad` con script anti-parpadeo |
| Auth en cliente | `AuthProvider`, `authSlice` y fetch en la navbar | Una sola fuente (Redux hidratado desde `/api/auth/me`) |
| Otros | 2 `OrderModal`, 2 `AboutSection`, 2 carpetas de providers, 2 `ButtonProps`, `Toggle` y `Checkbox` | Renombrar o eliminar |

**Genéricos o no óptimos** (más de 300 líneas, mezclan fetch y UI): `db-performance/page.tsx` (1.507 líneas, 183 estilos inline), `Importpreviewmodal.tsx` (969), `checkout/page.tsx` (797), `admin/menu/page.tsx` (742), `inventory/page.tsx` (653), `reports/page.tsx` (615), `producto/[id]/page.tsx` (568) y unos 15 más.

**Eliminar (código muerto):** `predictive/page copy.tsx`, `predictivo.css` y el bloque predictivo de `globals.css`; `components/layout/Sidebar.tsx`; `app/dashboard/ActiveSidebar.tsx`; `ThemeToggle`, `IdleLogout` y `handlerEmailActions`; los ~27 componentes sin uso de `features/dashboard/admin/components`; `features/dashboard/cliente/*`; `utils/supabase/*`; 3 hooks; `tailwind.config.js`; `middleware.ts.bk`. Lista completa en el anexo A §4.

## 5. Cómo se estiliza hoy

Tailwind v4 con `@theme` en `styles/globals.css`, pero los tokens se declaran dos veces (`:root` y `@theme`) y hay utilidades reescritas a mano (`.bg-brand`, `.shadow-sm`). Además:

- **No hay `@custom-variant dark`**: los 123 `dark:` siguen la preferencia del sistema operativo, no el toggle.
- 343 estilos inline y `cn()` usado solo en 3 archivos.
- Tokens inexistentes en uso (`bg-bg`, `--color-surface-alt`).
- `DesignSystemProvider` inyecta colores y fuentes desde `localStorage` en tiempo de ejecución, lo que provoca un parpadeo.
- CSS modules solo en las páginas de error.

## 6. Colores y tipografías

- **Paleta de facto:** naranja quemado `#e85d04` (primario), marrón tinta `#1a1208`, beiges `#e8e1d8` y `#f5f3ef`, y rojo y esmeralda de Tailwind para los estados (383 y 297 usos), más una paleta slate fría escrita a mano en las pantallas grandes del admin. Hay **101 hex distintos**, sin tokens de estado. Se percibe más como una taquería moderna que como un restaurante de alta gama con bodega.
- **Tipografías:** `<link>` bloqueante a Google Fonts con 5 familias (DM Sans, Fraunces, Ibarra Real Nova, Inter, Roboto), sin `next/font`. El `body` usa Ibarra Real Nova. Las 154 clases `font-display` y `font-body` probablemente no generan CSS, porque `--font-*` no está en `@theme`. Roboto se descarga y no se usa.

## 7. Iconos

**lucide-react** es la única librería: 120 archivos y unos 105 iconos distintos. Hay **22 `<svg>` hechos a mano** en 13 archivos (7 en `ConditionalNavbar`, 3 en `db-performance`). `Plato.jsx` y `MolinoAnimado.jsx` son ilustraciones de marca, no iconos. En `public/` solo hay `icons/icon.svg` y los PNG de la PWA.

## 8. Imágenes

**Orígenes:**

- Cloudinary (nube pública `dcb1tspbj`), con URLs fijas en `features/shared/data/restaurantData.ts`.
- Datos del API (platos y promociones).
- Unsplash, Google (`lh3.googleusercontent.com`) y un bucket de Supabase.
- Se usan `next/image`, `<img>`, `CldImage`, `cloudinary-react` y `SmartImage`: hay tres SDK de Cloudinary distintos.

**Fallan o se ven mal (verificado con curl):**

1. El fondo de login y registro (`food-3955317_1280`) da 404, y pasar a `CldImage` una URL externa también falla.
2. El icono `shortcut` `logo_text_white_ktnpgg.png` da 404.
3. El fallback del logo `/logo.svg` da 404: no existe en `public/`.
4. La fachada de `/about` (Google) da 403 y deja una caja vacía.
5. Los SVG del logo pasan por `f_auto` y llegan rasterizados.
6. `res.cloudinary.com` no está en `remotePatterns` (afecta a `AboutSection` con `next/image`), que sí incluye hosts de maqueta (`i.pravatar.cc`).
7. Las `<img>` de logo y promociones no tienen `width` ni `height` (CLS) ni `loading="lazy"`.
8. Los alt son genéricos o están en inglés ("Login background", "Logo", "Platillo").
9. Las tarjetas de la carta en la home muestran un emoji en lugar de foto.
10. La subida de imágenes del admin usa el preset placeholder `tu_upload_preset`, sin límites de tipo ni de tamaño.

Los SVG del logo tienen los nombres invertidos: `logo_dark` es blanco y `logo_light` es negro. Detalle en el anexo B §1.

### 8.1 Verificación en Cloudinary (MCP, solo lectura, 2026-10-31)

No se modificó ni se borró ningún recurso. La nube `dcb1tspbj` tiene **73 imágenes** en 5 carpetas (`ElQuijote`, `ElQuijote/hero`, `ElQuijote/menu`, `ElQuijote/Logo`, `ElQuijote/Ico`) más los recursos de muestra de Cloudinary en la raíz.

| Recurso referenciado en el código | ¿Existe? | Formato · tamaño · peso | Observación |
|---|---|---|---|
| `logo_text_white_ktnpgg` (icono `shortcut`, `restaurantData.ts:319`) | **No** | — | Causa el 404 de todas las páginas |
| `logo_dark_fvfcdk` / `logo_light_xy8ce1` | Sí | SVG · 800×800 · 11 KB | Nombres invertidos (el «dark» es blanco). Con `f_auto` llegan rasterizados. Se sustituyen por el SVG local (D-07). |
| `logo_wgyijz` (favicon) | Sí | ICO · 256×256 · 9 KB | Se sustituye por `app/icon.svg` local (paso 1.8) |
| `food-3955317_1280` (fondo de login y registro) | **No con ese ID** | — | El recurso real es `food-3955317_1280_zstvf7` (JPG · 887×1280 · 356 KB). El código usa el ID sin sufijo, de ahí el 404. |
| `Gemini_Generated_Image_2mv3sr2mv3sr2mv3_uciqpl` (portada de `/menu`) | Sí | PNG · 1584×672 · 2,0 MB | **Imagen generada por IA con la marca de agua de Gemini** en la esquina inferior derecha; resolución corta para retina |
| Otras de `ElQuijote/hero` | Sí | 2 PNG de Gemini (825×825 y 1005×565), `image_l57jar` (versión desenfocada, 1584×672), `meal-4840665_1280` (JPG 1280×725), `compressed_…` (WebP 1024²) | Material disponible para la portada y «la casa» |
| `ElQuijote/menu` (37 platos) | Sí | JPG · de 41 a 230 KB · proporciones desde 696×1507 hasta 1507×696 | **Ninguno tiene `alt` ni pie en sus metadatos**. Encuadres muy distintos. `hamburguesa` lleva franjas negras incrustadas, `mystery-box` muestra figuras de anime y hay platos ajenos a la propuesta española (tex-mex, molcajete). Solo `tapas-espanolas` muestra vinos. |
| `ElQuijote/Ico` | Sí | `molino_z1czet` (PNG 551², 7 KB), `molino_white`/`molino_black` (ICO 256²) | El molino sirve de referencia para el `SelloCasa` local |

**Consecuencias para el rediseño:**

- Las imágenes se entregan con `f_auto,q_auto` y un ancho ajustado al hueco (`w_` según `sizes`).
- Los platos usan un recorte uniforme 4:5 (`c_fill,g_auto`).
- El `alt` sale del nombre del plato que envía el API.
- La marca de agua se recorta en la entrega (PLAN 4.3).
- El fondo del login usa el ID correcto o un respaldo local.

La calidad del material, el `alt` en los metadatos y los recursos que sobran están en NP-33.

## 9. Formularios y validaciones

No se usa ninguna librería de validación (ni zod ni react-hook-form): las reglas están en `utils/validators.tsx`, en el registro y en el checkout (`RFC_REGEX` y `CP_REGEX`). Problemas:

- **Accesibilidad:** 0 `aria-invalid`, 0 `aria-describedby`, 0 `role="alert"` y 1 `autoComplete`. `FloatingInput` usa `<span>` como etiqueta y el checkout no tiene etiquetas.
- **Errores:** el admin usa 32 `alert()` y 11 `confirm()`.
- **Envío:** el registro permite enviar dos veces y no hay honeypot ni reCAPTCHA.
- **Login:** `callbackUrl` no se valida (open redirect).
- **Reserva de la home:** es simulada.
- **Recuperación de contraseña:** está desactivada y su aviso está en inglés.
- **Importación XLSX:** usa `xlsx@0.18.5` (con CVE), solo comprueba la extensión y no tiene límite de tamaño.
- **Enumeración de usuarios:** el front muestra `data.message` del API tal cual, así que depende del API.
- **Regla de nombre:** rechaza nombres válidos con apóstrofo o guion.

Tabla de formularios en el anexo B §2.

## 10. Errores y advertencias de consola por página

En todas las páginas medidas aparecen:

- `401 /api/auth/me`, llamado 2 o 3 veces por carga;
- `404` del PNG del logo en Cloudinary;
- `404 /logo.svg`;
- `404 /footer`;
- una petición cancelada del SVG del logo por el cambio de tema.

Además, por página:

| Página | Mensajes adicionales |
|---|---|
| `/` | `404` de `/settings`, `/categories` y `/promotions` (rutas relativas cuando falta `NEXT_PUBLIC_API_URL`) |
| `/menu` | `console.error` de carga y `500 /api/menu/categories` |
| `/menu/categoria/[slug]` | conexión rechazada a `localhost:10000` |
| `/menu/producto/[id]` | URL `undefined/menu/items/1` y el logger trata `notFound()` como un error |
| `/reservations` | conexión rechazada a `localhost:10000` |
| `/promociones` | `404 /api/promociones`, una ruta que no existe |
| `/login` | `404` de la imagen de fondo |

Muchos errores dependen de que no hubiera backend durante la medición, pero revelan fragilidad: 14 usos de `NEXT_PUBLIC_API_URL` sin valor por defecto y un fallback a `localhost:10000` incrustado en el bundle. Las páginas no auditadas con Lighthouse (legales y de sistema) responden 200; su consola se capturará con Playwright en la fase 0 del plan.

## 11. Lint, typecheck, build y pruebas

| Comprobación | Resultado |
|---|---|
| Lint | **No hay configuración de ESLint** y `eslint` no está en `devDependencies`, así que `pnpm lint` falla. Con el preset de Next: **233 errores y 135 avisos** (`no-explicit-any` 153, `no-unused-vars` 110, `set-state-in-effect` 43). Bug real de hooks: `useFetch` condicional en `components/landing/Footer.tsx:34`. |
| Typecheck | `tsc --noEmit` (estricto): **0 errores**. |
| Build | Sin `.env` falla por `DATABASE_URL` (`lib/db.ts`) y por `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (`next-cloudinary`). Con valores ficticios: **éxito, 62 páginas**. |
| Pruebas | **Ninguna**: sin script, sin framework y sin archivos de prueba. |

## 12. Líneas base de Lighthouse (12.8, una ejecución, sin backend)

| Página | Móvil Perf / A11y / BP / SEO | Escritorio Perf / A11y / BP / SEO | LCP móvil | CLS (peor) | TBT móvil |
|---|---|---|---|---|---|
| `/` | **47** / 90 / 96 / 100 | 91 / 90 / 96 / 100 | 4,3 s | 0,113 | **1.850 ms** |
| `/menu` | 74 / 92 / 96 / 100 | 97 / 92 / 96 / 100 | 4,1 s | 0,006 | 490 ms |
| `/menu/categoria/entradas` | 64 / 92 / 96 / 100 | 98 / 92 / 96 / 100 | 4,5 s | 0,001 | 590 ms |
| `/menu/producto/1` | 68 / 92 / 96 / 100 | 96 / 92 / 96 / 100 | 4,2 s | 0,084 | 560 ms |
| `/menu/pedido` | 67 / 90 / 96 / 100 | 92 / 90 / 96 / 100 | 4,4 s | **0,14** | 490 ms |
| `/reservations` | 65 / 92 / 96 / 100 | 94 / 92 / 96 / 100 | 4,4 s | 0,116 | 550 ms |
| `/promociones` | 68 / 90 / 96 / 100 | 96 / 90 / 96 / 100 | 3,0 s | 0,122 | 770 ms |
| `/login` | 54 / 92 / 96 / 100 | 96 / 92 / 96 / 100 | 4,6 s | 0,004 | **1.510 ms** |

Problemas comunes:

- **Contraste:** el badge del hero, el `.btn-primary` y los enlaces del footer no cumplen.
- **Enlaces sin nombre:** los iconos de Facebook e Instagram no tienen texto accesible.
- **Orden de encabezados:** incorrecto en varias páginas.
- **Imágenes sin dimensiones:** las `<img>` de logo no llevan `width` ni `height`.
- **JavaScript:** sin usar, heredado y bloqueante.
- **bf-cache:** falla en categoría y producto.
- **Best Practices:** baja por los errores de consola.

Meta del rediseño: 90 o más en las cuatro categorías, en móvil y en escritorio.

## 13. Dashboards: qué muestran y qué sobra

| Panel | Qué muestra | Qué satura o sobra |
|---|---|---|
| Inicio admin | 4 KPI, pedidos recientes y barras por hora | Saludo fijo "Buenas noches, Admin"; el contador de stock apunta a una ruta errónea (siempre 0); sin estado de error (un fallo se ve como "$0"); tabla sin scroll en móvil; huecos con widgets comentados |
| Reportes | 4 KPI, 6 mini-stats, 2 barras, donut y tabla con sparklines | **Ventas y Personal son mock** ("Mejor día Sábado $9,400", deltas fijos); todo pesa lo mismo y no hay una cifra protagonista |
| Rendimiento BD | 4 KPI y 8 bloques técnicos, sondeo cada 10 s | Pantalla de DBA dentro del admin de un restaurante; no es responsiva; hex fijos sin tema |
| Finanzas y facturas | 4 KPI y pestañas | Mock en memoria: lo guardado se pierde al recargar |
| Inventario y proveedores | 4 KPI, pestañas y tabla | Correcto en datos (handlers internos); sin jerarquía |
| Carta (admin) | Tarjetas, filtros e importar/exportar | Dos fuentes de verdad (`localStorage` y API); errores con `alert()` |
| Reservas | Filtros y tabla → tarjetas en móvil | **El mejor modelo responsivo**: referencia para los demás |
| Predicción, nómina, usuarios, promociones | KPI, tablas y gráfica | Aceptables; usuarios usa `alert()` |
| Ajustes y "acerca de" | Formularios | Se guardan en `localStorage` o mock: lo editado no llega a la web pública |
| Caja | 4 StatCard y tickets | **Todo mock** |
| Mesero y cocina | Mesas y kanban | Datos en `localStorage` |

Problemas transversales:

- **Las ventas del día se calculan en cuatro sitios**, con fuentes distintas.
- **La sidebar** tiene 18 entradas, no filtra por rol y es fija de 260 px, sin drawer: en un móvil de 390 px quedan unos 130 px para el contenido.
- **Las entradas de la sidebar** son `<button>` en lugar de `<Link>`, sin `aria-current`.

Propuesta de 3 a 5 KPI por panel en el anexo B §3.2.

## 14. Seguridad del front

Se revisaron 21 áreas: acceso a datos desde el front, secretos, dependencias, variables públicas y de servidor, almacenamiento en el navegador, cookies, service worker, caché, terceros, HTML interpretado, URL construidas desde datos, enlaces externos, formularios y subidas, cabeceras, source maps, imágenes remotas, cierre de sesión, protección de rutas, registros y autorización por propietario.

- **Lo aplicable desde el front** se ejecutó en la fase 2 del PLAN (pasos 2.1 a 2.16, salvo 2.5) y en las fases 3 a 5.
- **Lo que depende del API, la base de datos o la infraestructura** está pendiente de endurecer en el API (notas NP-01 a NP-11, NP-15, NP-20 a NP-22 y NP-32) y se ejecuta en el paquete del API de [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- El detalle por archivo y línea se conserva fuera del repositorio, porque el repositorio es público.

## 15. Producto y contenido

- El sitio se presenta como "Restaurante El Quijote — cocina mexicana de alta gama" (`app/layout.tsx:20`, `app/page.tsx:131`), mientras que el encargo habla de cocina española con carta de vinos. **Decisión del usuario: conservar el contenido en esta etapa** y anotarlo en NOTAS-PENDIENTES.
- No existe una carta de vinos: "vino" solo aparece en mocks y en el inventario.
- La landing solo renderiza el hero; las secciones de categorías, promociones, carta, "acerca de" y reserva están comentadas.

## 16. ¿Conviene reestructurar carpetas?

**Sí, pero de forma incremental y sin mover nada de `app/`** (la estructura de rutas no se toca). Razones:

- A favor: hay unas 5.500 líneas muertas, cada concepto tiene varias implementaciones y no existe `components/ui`. Sin reestructurar, el rediseño acabaría duplicando componentes otra vez.
- En contra: no hay pruebas, y `restaurantData` y `dataService` se importan desde 40 y 18 archivos. Mover en bloque rompería pantallas sin que se note.
- Decisión:
  1. Borrar el código muerto en pasos verificados.
  2. Crear `components/ui/` (primitivas) y `components/marca/` (cabecera, pie, logo) durante el rediseño.
  3. Migrar pantalla por pantalla.
  4. Dejar `features/` por dominio como está.
  5. No mover `app/api` ni `lib/db` (es backend, ver NOTAS).

  Antes de cualquier movimiento se capturan líneas base con Playwright (capturas y consola) para comparar después.

---

# Anexos

Los anexos son los informes completos de los subagentes, sin editar salvo por la eliminación de rutas temporales locales. Las cifras y referencias de archivo:línea corresponden al commit `922c05d`.

---

## Anexo A — Auditoría front-end A: estructura y estilos

**Proyecto:** `D:/repositories/IJ-STUDIO/restaurant-management-web` · **Rama:** `feature/rediseno-web` · **Fecha:** 2026-10-30
Auditoría de solo lectura: no se modificó ningún archivo del repo. Rutas relativas a la raíz del repo.

> Nota de contexto: el código y los metadatos describen el sitio como **"Restaurante El Quijote… Cocina mexicana de alta gama… Huejutla de Reyes, Hidalgo"** (`app/layout.tsx:20`, `app/page.tsx:131`). No hay ninguna "carta de vinos" como sección o ruta. "Vino" solo aparece en mocks (`features/dashboard/admin/data/*Mock*`) y en `app/dashboard/admin/inventory/page.tsx`. Si el posicionamiento es "restaurante español de alta gama con carta de vinos", el copy actual no lo refleja.

---

### 1. Stack, router y configuración

| Elemento | Declarado (`package.json`) | Resuelto (`pnpm-lock.yaml`) | Instalado |
|---|---|---|---|
| next | `^16.0.7` | 16.0.7 (`pnpm-lock.yaml:65-67`, `:2221`) | **No hay `node_modules/`**: las dependencias no están instaladas en este checkout, así que no se puede leer `node_modules/next/package.json` |
| react / react-dom | `^19.2.1` | 19.2.1 | idem |
| tailwindcss | `^4.1.16` (+ `@tailwindcss/postcss`, `@tailwindcss/cli`) | 4.1.16 | idem |
| next-themes | `^0.4.6` | 0.4.6 | **instalado pero no se usa** (ver §5) |
| lucide-react | `^0.575.0` | 0.575.0 | — |
| clsx / tailwind-merge | `^2.1.1` / `^3.5.0` | — | — |
| Otros relevantes | `recharts`, `@reduxjs/toolkit` + `react-redux`, `drizzle-orm` + `pg`, `firebase` + `firebase-admin`, `@supabase/ssr` + `supabase-js`, `googleapis`, `bcrypt`, `jose`, `cloudinary-core` + `cloudinary-react` + `next-cloudinary`, `@stripe/*`, `xlsx`, `@radix-ui/react-popover` | | |

- Hay varias dependencias de servidor en el bundle del front (`bcrypt`, `pg`, `firebase-admin`, `googleapis`, `drizzle-orm`). Además hay **tres SDK de Cloudinary** y dos backends (Supabase y Firebase).
- `autoprefixer` sobra en Tailwind v4: `postcss.config.mjs` solo usa `@tailwindcss/postcss`.
- **Router:** solo **App Router** (`app/`). No existe `pages/`.
- **`proxy.ts`** (raíz, 120 líneas) es el **middleware activo**: en Next 16, `middleware.ts` pasó a llamarse `proxy.ts`. Exporta `proxy()` (`proxy.ts:51`) y `config.matcher` (`proxy.ts:109-118`). Hace auth JWT con `jose`, define `PUBLIC_ROUTES` (`proxy.ts:6`) y `ROLE_ROUTES` por rol 1-5 (`proxy.ts:9-15`), y redirige a `/forbidden`.
  - Secreto de firma con valor de respaldo en el código: retirado en el paso 2.9 (falla cerrado). La rotación es NP-02.
- **`middleware.ts.bk`**: copia comentada del mismo middleware (`:52`, `:110`). Es basura, pero **está incluida en `tsconfig.json` → `include`** de forma explícita. Hay que borrarla y sacarla del `include`.
- **`tsconfig.json`:** `baseUrl: "."` y `paths: { "@/*": ["./*"] }` (alias a la raíz), `strict: true`, `moduleResolution: bundler`.
  - Efecto colateral: `@/store` **resuelve a `store.ts` de la raíz** (archivo marcado "TODO: Remove", reexporta `store/index.ts`) antes que a la carpeta `store/`. Lo importan 9 archivos (p. ej. `app/dashboard/admin/menu/page.tsx:7`, `components/Navbar.tsx:6`).
- `next.config.js`: `images.remotePatterns` (unsplash, pravatar, googleusercontent, un host de Supabase) y cabeceras de seguridad. No hay CSP.
- `vercel.json`: un cron diario a `/api/cron/backups`.
- Variables de entorno: **no hay archivos `.env*` en el checkout**. El código lee estas variables (solo nombres): `NEXT_PUBLIC_API_URL` (35 usos), `NODE_ENV`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET`, `DATABASE_URL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_DRIVE_FOLDER_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

### 2. Estructura de carpetas

| Carpeta | Contenido (2º nivel) | Propósito / observación |
|---|---|---|
| `app/` | `(auth)`, `(public)`, `api`, `dashboard`, `menu`, `forbidden`, `maintenance`, `offline`, `unauthorized`, `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `manifest.ts`, 5 `*.module.css` | Rutas del App Router. Los CSS modules de las páginas de error viven **sueltos en `app/`** en lugar de junto a su página. |
| `components/` | `admin/`, `landing/`, `layout/`, `providers/`, `pwa/`, `reservations/`, `ui/` + 13 componentes sueltos | Componentes compartidos sin criterio claro: mezcla primitivas (`Button`, `Checkbox`), layout (`Navbar`) y lógica (`handlerEmailActions`). |
| `features/` | `dashboard/{admin,cajero,cliente,cocina,mesero}`, `reservations/services`, `shared/{data,services}` | Organización por dominio: componentes, mocks (`data/`) y servicios. Es la mitad "moderna" de la arquitectura. |
| `hooks/` | 12 hooks | Hooks globales. 3 no se usan (ver §4). |
| `lib/` | `api.ts`, `db.ts`, `schema.ts`, `public.schema.ts` (1218 l.), `session.ts`, `utils.ts` (`cn`) | Cliente API, Drizzle/PG y sesión: lógica de **servidor** dentro del front. |
| `providers/` | `AuthProvider.tsx` | **Duplica** `components/providers/`. |
| `store/` | `index.ts`, `slices/authSlice.ts` | Redux Toolkit (solo auth). |
| `styles/` | `globals.css` (826 l.), `loading.css` (105 l.) | `loading.css` **no se importa en ningún sitio**. |
| `types/` | `auth.ts`, `ButtonProps.tsx`, `index.ts`, `navigation.ts`, `ui.ts` | Hay **dos `ButtonProps`** (`types/ButtonProps.tsx` y `types/index.ts`). `navigation.ts` y `ui.ts` no se importan. |
| `utils/` | `supabase/{client,server,middleware}.ts`, `validators.tsx` | Los tres clientes de Supabase tienen **0 importaciones** (código muerto). |
| `config/` | `navigation/{admin,cajero,cocina}.nav.ts`, `restaurant.config.ts`, `roles.config.ts` | `config/navigation/*` tiene 0 importaciones: `AdminSidebar` escribe las rutas a mano. |
| `scripts/` | `setup-windows.ps1` | Instalador en PowerShell. Descarga de una rama `claude/...` de GitHub. |
| `public/` | `icons/{apple-touch-icon.png, icon-192.png, icon-512.png, icon.svg}`, `sw.js` | Assets PWA mínimos. No hay imágenes de marca. |
| `drizzle/` | `0002_sturdy_lord_tyger.sql`, `meta/` | Migraciones Drizzle (faltan 0000/0001). Es backend. |
| `docs/` | `diagnostico-frontend.md` | Documento de diagnóstico previo. |

**Archivos sueltos en la raíz que sobran:**

| Archivo | Qué es | Acción |
|---|---|---|
| `check_backups.ts` (9 l.) | Script que consulta la tabla `backups` con Drizzle y hace `console.log` | Mover a `scripts/` o borrar |
| `delete_cron_date.cjs` (11 l.) | Script que borra una clave de `system_settings` vía `pg` | Borrar |
| `setup_settings.ts` / `.js` / `.cjs` | **Tres versiones** del mismo script (crear la tabla `system_settings`) | Dejar una en `scripts/` o pasarla a migración Drizzle |
| `store.ts` | Reexporta `store/index` ("TODO: Remove", `store.ts:6`), pero sigue en uso vía `@/store` | Cambiar los 9 imports a `@/store/index` y borrarlo |
| `middleware.ts.bk` | Copia comentada de `proxy.ts` | Borrar y quitarla de `tsconfig.include` |
| `workplan.md` (24 KB) | Plan de desarrollo frontend | Mover a `docs/` |
| `requisitos funcionales.md` (131 KB, con espacio en el nombre) | Requisitos funcionales | Mover a `docs/` y renombrar |
| `tailwind.config.js` | **Todo comentado** (v3), no hace nada en v4 | Borrar |
| `skills-lock.json` | Lock de skills del agente | Fuera del repo o en `.gitignore` |

---

### 3. Rutas

Hay layouts en `app/layout.tsx` (raíz, server), `app/(auth)/layout.tsx` (**`'use client'` innecesario**: solo envuelve en `<main>`) y `app/dashboard/layout.tsx` (server: `getSession()` + fetch del perfil + `AdminSidebar`). **`(public)` y `menu/` no tienen layout propio.** Navbar y Footer se inyectan desde la raíz con `ClientLayoutWrapper` (client, `dynamic(..., { ssr:false })`), así que **Navbar y Footer no se renderizan en el servidor** (malo para SEO y LCP).

`loading.tsx`, `error.tsx` y `not-found.tsx` **solo existen en la raíz `app/`**. Ningún segmento tiene los suyos.

| URL | Archivo | Acceso | Layout(s) | Tipo | Líneas |
|---|---|---|---|---|---|
| `/` | `app/page.tsx` | Público | root | client | 173 |
| `/login` | `app/(auth)/login/page.tsx` | Público | root > (auth) | client | 225 |
| `/register` | `app/(auth)/register/page.tsx` | Público | root > (auth) | client | 404 |
| `/reset` | `app/(auth)/reset/page.tsx` | Público | root > (auth) | client | 52 |
| `/frm_reset` | `app/(auth)/frm_reset/page.tsx` | Público | root > (auth) | client | 58 |
| `/profile` | `app/(auth)/profile/page.tsx` | Privado (cliente), pero el **proxy no lo protege** (\*) | root > (auth) | client | 466 |
| `/about` | `app/(public)/about/page.tsx` | Público\* | root | client | 274 |
| `/ayuda` | `app/(public)/ayuda/page.tsx` | Público\* | root | client | 58 |
| `/condiciones` | `app/(public)/condiciones/page.tsx` | Público\* | root | client | 51 |
| `/corporativo` | `app/(public)/corporativo/page.tsx` | Público\* | root | client | 50 |
| `/devoluciones` | `app/(public)/devoluciones/page.tsx` | Público\* | root | client | 50 |
| `/privacidad` | `app/(public)/privacidad/page.tsx` | Público\* | root | client | 54 |
| `/promociones` | `app/(public)/promociones/page.tsx` | Público\* | root | client | 80 |
| `/reservations` | `app/(public)/reservations/page.tsx` | Público\* | root | client | 43 |
| `/seguridad` | `app/(public)/seguridad/page.tsx` | Público\* | root | client | 49 |
| `/menu` | `app/menu/page.tsx` | Público\* | root | client | 297 |
| `/menu/categoria/[slug]` | `app/menu/categoria/[slug]/page.tsx` | Público\* | root | client | 216 |
| `/menu/producto/[id]` | `app/menu/producto/[id]/page.tsx` | Público\* | root | client | 568 |
| `/menu/pedido` | `app/menu/pedido/page.tsx` | Cliente | root | client | 513 |
| `/menu/pedido/checkout` | `app/menu/pedido/checkout/page.tsx` | Cliente | root | client | 797 |
| `/menu/pedido/checkout/exito` | `app/menu/pedido/checkout/exito/page.tsx` | Cliente | root | client | 96 |
| `/forbidden` | `app/forbidden/page.tsx` | Sistema | root | **server** | 48 |
| `/unauthorized` | `app/unauthorized/page.tsx` | Sistema | root | **server** | 54 |
| `/maintenance` | `app/maintenance/page.tsx` | Sistema | root | client | 46 |
| `/offline` | `app/offline/page.tsx` | Sistema (PWA) | root | **server** | 66 |
| `/dashboard` | `app/dashboard/page.tsx` | Privado (redirige por rol) | root > dashboard | **server** | 22 |
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | Admin | root > dashboard | client | 155 |
| `/dashboard/admin/about` | `…/admin/about/page.tsx` | Admin | root > dashboard | client | 181 |
| `/dashboard/admin/db-performance` | `…/admin/db-performance/page.tsx` | Admin | root > dashboard | client | **1507** |
| `/dashboard/admin/finance` | `…/admin/finance/page.tsx` | Admin | root > dashboard | client | 454 |
| `/dashboard/admin/finance/invoices` | `…/admin/finance/invoices/page.tsx` | Admin | root > dashboard | client | 226 |
| `/dashboard/admin/inventory` | `…/admin/inventory/page.tsx` | Admin | root > dashboard | client | 653 |
| `/dashboard/admin/inventory/suppliers` | `…/admin/inventory/suppliers/page.tsx` | Admin | root > dashboard | client | 487 |
| `/dashboard/admin/menu` | `…/admin/menu/page.tsx` | Admin | root > dashboard | client | 742 |
| `/dashboard/admin/payroll` | `…/admin/payroll/page.tsx` | Admin | root > dashboard | client | 317 |
| `/dashboard/admin/predictive` | `…/admin/predictive/page.tsx` | Admin | root > dashboard | client | 428 |
| *(no es ruta)* | `…/admin/predictive/page copy.tsx` | **Copia muerta** | — | client | **1719** |
| `/dashboard/admin/promociones` | `…/admin/promociones/page.tsx` | Admin | root > dashboard | client | 326 |
| `/dashboard/admin/reports` | `…/admin/reports/page.tsx` | Admin | root > dashboard | client | 615 |
| `/dashboard/admin/reservations` | `…/admin/reservations/page.tsx` | Admin | root > dashboard | client | 365 |
| `/dashboard/admin/settings` | `…/admin/settings/page.tsx` | Admin | root > dashboard | client | 156 |
| `/dashboard/admin/users` | `…/admin/users/page.tsx` | Admin | root > dashboard | client | 446 |
| `/dashboard/cajero` | `app/dashboard/cajero/page.tsx` | Cajero (rol 2) | root > dashboard | client | 221 |
| `/dashboard/mesero` | `app/dashboard/mesero/page.tsx` | Mesero (rol 3) | root > dashboard | client | 239 |
| `/dashboard/cocina` | `app/dashboard/cocina/page.tsx` | Cocina (rol 4) | root > dashboard | client | 103 |
| `/dashboard/cliente` | **NO EXISTE** | — | — | — | — |

\* En `proxy.ts:74-76` **toda ruta que no empiece por `/dashboard` pasa sin comprobar sesión**, así que `/profile`, `/menu/pedido` y `/menu/pedido/checkout` quedan **sin protección en el proxy**: el control queda en manos de cada página client. Las rutas `/api/*` se tratan en la §14 (resuelto en el paso 2.10 del PLAN).

**Hallazgos de rutas:**
- **46 de 50** páginas/layouts son client components. Solo `forbidden`, `unauthorized`, `offline`, `dashboard/page` y los layouts raíz y dashboard son server. Las páginas legales y de info (`ayuda`, `condiciones`…) **no necesitan `'use client'`**.
- `app/dashboard/page.tsx:20` redirige por defecto a `/dashboard/cliente`, que **no existe** (404). `features/dashboard/cliente/*` existe completo (7 componentes y un mock) pero sin página: componentes huérfanos.
- `app/dashboard/layout.tsx:48` monta **`AdminSidebar` para todos los roles** (cajero, mesero y cocina ven el menú de admin).
- `app/dashboard/ActiveSidebar.tsx` (sin uso) es un componente suelto dentro de `app/`.
- `app/loading.tsx` usa las clases `.container`, `.loader`, `.pan`… definidas en `styles/loading.css`, **que no se importa**. El loader global sale **sin estilo** (y `.container` además choca con la utilidad `container` de Tailwind).
- **Landing (`/`):** solo renderiza `<Hero>`. `CategoriesSection`, `PromosSection`, `MenuSection`, `AboutSection` y `ReservationSection` están **comentados** (`app/page.tsx:146-167`), pero **se siguen haciendo 6 fetch** (`app/page.tsx:77-87`) cuyos datos no se usan. Los handlers son `console.log` (`app/page.tsx:113,118`).

**Route handlers en `app/api` (backend dentro del front):**

| Ruta | Métodos |
|---|---|
| `/api/admin/users` | GET, POST |
| `/api/admin/users/[id]` | PUT, DELETE |
| `/api/auth/login` | POST (proxy al backend) |
| `/api/auth/logout` | POST |
| `/api/auth/me` | GET |
| `/api/auth/register` | POST |
| `/api/backups` | GET, POST, DELETE |
| `/api/cron/backups` | GET (cron de Vercel) |
| `/api/inventory/mermas` | GET, POST |
| `/api/inventory/orders` | GET, POST, PUT, DELETE |
| `/api/inventory/products` | GET, POST, PUT, DELETE |
| `/api/inventory/products/adjust` | POST |
| `/api/inventory/suppliers` | GET, POST, PUT, DELETE |
| `/api/menu/categories` | GET (+ `_meta.ts`) |
| `/api/mesas` | GET |
| `/api/public/combos` | GET |
| `/api/public/cupones` | GET |
| `/api/settings` | GET, POST |

En total, **18 handlers**. `lib/db` (Drizzle/PG directo) se importa en 14 archivos, casi todos route handlers. Es decir, el front tiene acceso directo a la base de datos **además** de un backend externo (`NEXT_PUBLIC_API_URL`): conviven dos fuentes de verdad.

---

### 4. Componentes

Columnas: líneas · **imp.** = archivos que lo importan (verificado por ruta) · notas. **0 imp.** = sin uso.

#### `components/` (raíz)
| Componente | Líneas | Imp. | Notas |
|---|---|---|---|
| `BackButton.tsx` | 42 | 5 | OK |
| `Button.tsx` | 25 | 2 (login, register) | **DUPLICADO** de `components/ui/Button.tsx`. En realidad es un "link-button" que hace `router.push` (no admite onClick). |
| `Checkbox.tsx` | 34 | 1 | Solapa con `features/.../Toggle.tsx` |
| `ClientLayoutWrapper.tsx` | 37 | 1 (root layout) | Monta Navbar y Footer con `ssr:false` |
| `ConditionalNavbar.tsx` | 232 | 1 | Hace fetch a `/api/auth/me` en **cada cambio de ruta** y **duplica** la inicialización del tema (`:18-33`). Tiene 7 `<svg>` a mano. `cartCount` está fijo a 3 (`:14`). |
| `FloatingInput.tsx` | 42 | 2 | OK |
| `IdleLogout.tsx` | 39 | **0** | Sin uso |
| `Navbar.tsx` | 268 | 1 | Lee Redux, `SettingsService` (localStorage) y `useTheme` |
| `PasswordRequirements.tsx` | 141 | 1 | |
| `PasswordToggleButton.tsx` | 22 | 2 | |
| `PhoneInput.tsx` | 59 | 1 | |
| `SmartImage.tsx` | 24 | 4 | |
| `ThemeToggle.tsx` | 51 | **0** | Sin uso. Su lógica está copiada en `ConditionalNavbar`. |
| `dropdown.tsx` | 97 | 1 | Nombre en minúscula, inconsistente |
| `handlerEmailActions.tsx` | 61 | **0** | Sin uso, 52 líneas comentadas |

#### `components/admin/`
| Componente | Líneas | Imp. | Notas |
|---|---|---|---|
| `AdminSidebar.tsx` | 326 | 2 | Usa `router.push` en `<button>` en lugar de `<Link>` (`:183-297`), con rutas escritas a mano (ignora `config/navigation`) y estilos inline. **GIGANTE**. |
| `ExportModal.tsx` | 468 | 1 | **GIGANTE**, 25 estilos inline |
| `Importpreviewmodal.tsx` | 969 | 1 | **GIGANTE**: 3 fetch, 54 estilos inline, nombre sin PascalCase |

#### `components/landing/`
| Componente | Líneas | Imp. | Notas |
|---|---|---|---|
| `Hero.tsx` | 139 | 1 | `dangerouslySetInnerHTML` con el título (`:96`) |
| `Footer.tsx` | 195 | 1 | Único footer. Hace fetch con `useFetch`. |
| `InfoPageLayout.tsx` | 47 | 6 | Layout de páginas legales. Debería ser un `layout.tsx` de `(public)`. |
| `PromosSection.tsx` | 156 | 1 (`/promociones`) | |
| `AboutSection.tsx` | 176 | **0** | Comentado en la landing. **DUPLICA el nombre** de `features/.../about/AboutSection.tsx`. `dangerouslySetInnerHTML` (`:65`). |
| `CategoriesSection.tsx` | 108 | **0** | Comentado en la landing |
| `MenuSection.tsx` | 140 | **0** | Comentado. Único consumidor de `.menu-card` |
| `ReservationSection.tsx` | 78 | **0** | Comentado |
| `MolinoAnimado.jsx` | 115 | 1 (about) | JSX sin tipar, SVG animado |
| `Plato.jsx` | 186 | 1 (Hero) | JSX sin tipar, SVG |

#### Otras carpetas de `components/`
| Componente | Líneas | Imp. | Notas |
|---|---|---|---|
| `layout/Sidebar.tsx` | 262 | **0** | **DUPLICADO** de `AdminSidebar`. Sin uso. Es el único que usa `restaurant.config`. |
| `ui/Button.tsx` (+ `ui/index.ts`) | 115 | **0** | El Button "bueno" (variants, sizes, loading, forwardRef) **no lo usa nadie** |
| `providers/AppProviders.tsx` | 44 | 1 | Redux, ThemeProvider (vacío), DesignSystem y AuthInitializer |
| `providers/ThemeProvider.tsx` | 8 | 1 | **No hace nada** ("No usamos next-themes", `:6`) |
| `providers/DesignSystemProvider.tsx` | 58 | 1 | Inyecta en runtime `--color-brand`, `--font-display`, `--font-body` y `--radius-standard` desde **localStorage** |
| `pwa/ConnectionStatus` · `InstallPrompt` · `ServiceWorkerRegister` | 54 · 132 · 40 | 1 c/u | Root layout |
| `pwa/OnlineOnly.tsx` | 50 | 7 | |
| `pwa/DistanceToRestaurant.tsx` | 135 | 2 | |
| `pwa/VoiceSearch.tsx` | 137 | 1 | |
| `reservations/ReservationSidebar.tsx` | 376 | 1 | **GIGANTE**, fetch + UI |
| `reservations/TableMap.tsx` | 124 | 1 | |
| `providers/AuthProvider.tsx` (raíz `providers/`) | 68 | 1 | **Carpeta duplicada** con `components/providers/`. Hace fetch, y además existe `authSlice` en Redux: dos fuentes de auth. |

#### `features/dashboard/admin/components/` (64 archivos)
- **Con uso (1-6 imp.):** `KpiCard` (2), `SectionCard` (6), `SettingRow` (5), `Toggle` (3), `RecentOrdersTable` (250 l., fetch), `HourBarsChart` (fetch), `StockAlerts`, `TableStatusGrid`, `InvoiceDrawer`, `InvoiceModal` (284), `ItemModal` (274), `MovementModal`, `TipModal`, `CloseSessionModal`, `PayrollModal`, `PromoModal` (287), `AboutPreviewModal`, `about/*` (6), `charts/{BarChart,DonutChart,Sparkline}`, `settings/*` (7).
- **SIN USO (0 imp.):** `AdjustModal`, `CategorySection` (y con él `MenuCard` y `TagBadge`, que solo usa `CategorySection`), `DashboardTopBar`, `MermaModal`, `OrderModal` (admin), `PaymentSplit`, `ProductModal`, `QuickActions`, `RoleBadge`, `SupplierCard`, `SupplierModal`, `inventory/{InventoryStats,InventoryTable,MermaList}`, `reservations/{ReservationCalendar,ReservationList,ReservationModal}` y **los 8 de `users/*`** (`AccessDrawer`, `AccessMatrix`, `AdminReports`, `IncidencePanel`, `ShiftCalendar`, `UserFilters`, `UserModal` 311 l., `UserTable`). En total, **~27 componentes muertos (≈3.900 líneas)**. Las páginas `users`, `inventory`, `reservations` y `suppliers` reimplementan esa UI **inline**.

#### `features/dashboard/{cajero,cocina,mesero,cliente}`
- cajero: `BillingModal`, `PaymentDistribution`, `StatCard`, `TicketRow` (1 imp. c/u, y **todos leen `cajeroMock`**: la página de cajero funciona con datos falsos).
- cocina: `InventoryModal`, `KanbanColumn`, `KitchenHeader`, `KitchenStats`, `OrderCard`, `StockAlertBanner` (1 imp. c/u). `cocinaMock` sin uso.
- mesero: `OrderModal`, `TableCard`, `TableGrid` (en uso).
- **cliente: los 7 componentes tienen 0 imp.** (no existe la página `/dashboard/cliente`).

#### Hooks y lib sin uso
`useAppSelector`, `useMediaQuery`, `useResponsiveNavbar` (y por arrastre `useBreakpoint`); `utils/supabase/{client,server,middleware}`; `config/navigation/*`; `types/ui.ts`, `types/navigation.ts`; mocks `inventoryMock` y `cocinaMock`.

#### Mocks en producción
Estas páginas importan mocks de `features/dashboard/*/data/` y muestran datos falsos: `admin/about`, `admin/finance`, `admin/finance/invoices`, `admin/reports`, `admin/settings` y `cajero`. Además, `features/shared/data/restaurantData.ts` (435 l.) y `dataService.ts` (452 l., basado en **localStorage**) se importan desde **40 y 18 archivos**: son la "base de datos" local del front.

#### DUPLICADOS

| Concepto | Implementaciones | Recomendación |
|---|---|---|
| Button | `components/Button.tsx` (link) · `components/ui/Button.tsx` (sin uso) · clases CSS `.btn-primary` / `.btn-secondary` (`styles/globals.css` `@layer components`) · decenas de `<button className="…">` inline | Un solo `ui/Button` con variantes, más un `ButtonLink` sobre `next/link` |
| ButtonProps | `types/ButtonProps.tsx` · `types/index.ts` | Unificar |
| Sidebar / Nav | `components/admin/AdminSidebar.tsx` · `components/layout/Sidebar.tsx` (muerto) · `app/dashboard/ActiveSidebar.tsx` (muerto) · `features/.../cliente/ClientNav.tsx` + `BottomNav.tsx` (muertos) · `config/navigation/*.nav.ts` (sin uso) | Un `DashboardSidebar` alimentado por `config/navigation` según el rol |
| Navbar | `Navbar.tsx` + `ConditionalNavbar.tsx` (wrapper con fetch y tema) | Un `SiteHeader` server con una isla client para usuario y carrito |
| Header de dashboard | `DashboardTopBar` (muerto) · `KitchenHeader` · cabeceras inline en cada página | Un `PageHeader` común |
| Tarjeta KPI | `admin/KpiCard` · `cajero/StatCard` · `cocina/KitchenStats` · `inventory/InventoryStats` (muerto) · `predictive-stat-card` (CSS) | Un `StatCard` |
| Card contenedora | `SectionCard` · `.chart-card` · `.predictive-card` · `SupplierCard` · `MenuCard` · `.menu-card` / `.promo-card` (CSS) | Un `Card` base |
| Modal / Drawer | ~20 modales independientes (`ItemModal`, `PromoModal`, `InvoiceModal`, `PayrollModal`, `TipModal`, `MovementModal`, `GatewayModal`, `BillingModal`, `InventoryModal`, `OrderModal` ×2…) y drawers (`InvoiceDrawer`, `AccessDrawer`, `CartDrawer`). **No hay un `Modal` base**: cada uno reimplementa overlay, cierre y foco. | `Dialog` y `Sheet` base (Radix ya está instalado) |
| OrderModal | `features/dashboard/admin/components/OrderModal.tsx` (muerto) · `features/dashboard/mesero/components/OrderModal.tsx` | Renombrar o borrar |
| AboutSection | `components/landing/AboutSection.tsx` (muerto) · `features/.../about/AboutSection.tsx` (wrapper de admin) | Renombrar |
| Toggle / Checkbox | `features/.../Toggle.tsx` · `components/Checkbox.tsx` | `ui/Switch` + `ui/Checkbox` |
| Providers | `components/providers/` · `providers/` | Una sola carpeta |
| Auth state | `providers/AuthProvider` · `store/slices/authSlice` (Redux, con `hydrateSession`) · fetch a `/api/auth/me` en `ConditionalNavbar` | Una sola fuente |
| Tema | `ThemeToggle` (muerto) · `ConditionalNavbar:18-33` · `hooks/useTheme` (MutationObserver) · `ThemeProvider` vacío · `next-themes` instalado sin usar | `next-themes` |
| Página predictiva | `predictive/page.tsx` · `predictive/page copy.tsx` (1719 l.) · `predictive/predictivo.css` (huérfano) · ~520 líneas de CSS predictivo en `globals.css:300-826` usadas **solo** por la copia | Borrar la copia, el CSS huérfano y ese bloque de `globals.css` |

#### GENÉRICOS / NO ÓPTIMOS (> 300 líneas o mezclan fetch y UI)
`predictive/page copy.tsx` (1719), `db-performance/page.tsx` (1507, **183 estilos inline**), `components/admin/Importpreviewmodal.tsx` (969), `menu/pedido/checkout/page.tsx` (797), `admin/menu/page.tsx` (742), `admin/inventory/page.tsx` (653), `admin/reports/page.tsx` (615), `menu/producto/[id]/page.tsx` (568), `menu/pedido/page.tsx` (513), `inventory/suppliers/page.tsx` (487), `ExportModal.tsx` (468), `(auth)/profile/page.tsx` (466), `admin/finance/page.tsx` (454), `admin/users/page.tsx` (446), `predictive/page.tsx` (428), `(auth)/register/page.tsx` (404), `ReservationSidebar.tsx` (376), `admin/reservations/page.tsx` (365), `AdminSidebar.tsx` (326), `admin/promociones/page.tsx` (326), `payroll/page.tsx` (317), `UserModal.tsx` (311, muerto). Casi todas son client components que hacen fetch en `useEffect` y renderizan en el mismo archivo.

#### Recomendación: eliminar y reconstruir
- **Eliminar ya (código muerto):** `predictive/page copy.tsx`, `predictive/predictivo.css`, el bloque predictivo de `globals.css` (`:300-826`), `components/layout/Sidebar.tsx`, `app/dashboard/ActiveSidebar.tsx`, `ThemeToggle.tsx` (o reutilizarlo con next-themes), `IdleLogout.tsx` (salvo que se quiera activar), `handlerEmailActions.tsx`, los ~27 componentes muertos de `features/dashboard/admin/components`, `features/dashboard/cliente/*` (o crear la página), `utils/supabase/*`, los hooks sin uso, `inventoryMock` y `cocinaMock`, `tailwind.config.js`, `middleware.ts.bk` y los scripts sueltos de la raíz.
- **Reconstruir como design system (`components/ui/`):** Button/ButtonLink, Card, StatCard, Dialog/Sheet, Input/FloatingInput, Select, Checkbox/Switch, Badge, Table, PageHeader, EmptyState/Skeleton, DashboardSidebar (data-driven) y SiteHeader/SiteFooter (server). Después hay que partir las páginas gigantes en "server page (fetch) + componentes client pequeños".

---

### 5. Cómo se estiliza hoy

| Mecanismo | Dónde | Estado |
|---|---|---|
| **Tailwind v4 CSS-first** | `styles/globals.css:1` `@import "tailwindcss"`. `@theme` en `:52-60` con 7 colores. `postcss.config.mjs` usa `@tailwindcss/postcss`. | Es el mecanismo principal |
| `tailwind.config.js` | Raíz | **Todo comentado** (config v3 con `darkMode: "class"`). No tiene efecto. |
| Tokens CSS | `:root` (`globals.css:4-13`) y `html.dark` (`:16-24`) redefinen `--color-*` | Los tokens se declaran **por duplicado**: en `:root` y en `@theme` |
| `@layer utilities` | `globals.css:62-107`: reescribe a mano `.bg-brand`, `.text-text`, `.border-border`, `.bg-surface/80`… e incluso `.shadow-sm` y `.backdrop-blur-sm` | **Redundante**: `@theme` ya genera esas utilidades. Pisar `shadow-sm` y `backdrop-blur-sm` cambia el comportamiento de Tailwind. |
| `@layer components` | `globals.css:109-~298`: `.auth-*`, `.input-floating`, `.btn-primary/secondary`, `.alert-*`, `.menu-card*`, `.promo-*`, `.skeleton*`, `.separator*`, `.google-btn`, `.link-secondary` | `.google-btn`, `.skeleton*` y `.separator*` no se usan. `.menu-card` solo en un componente muerto. |
| CSS global "predictivo" | `globals.css:300-826` (~520 l.) | Solo lo usa la copia muerta |
| `styles/loading.css` | 105 l. | **No se importa**: el loader global sale sin estilo |
| `app/dashboard/admin/predictive/predictivo.css` | 414 l. | **No se importa** |
| CSS Modules | `app/{error,forbidden,maintenance,not-found,unauthorized}.module.css` (92-125 l. c/u) | Solo en páginas de sistema. `not-found.module.css` duplica el loader `.panWrapper`. |
| Estilos inline `style={{…}}` | **343** ocurrencias en 34 archivos | Concentrados en `db-performance/page.tsx` (183), `Importpreviewmodal.tsx` (54), `page copy.tsx` (27), `ExportModal.tsx` (25) |
| Clases arbitrarias | `text-[10px]` ×208, `text-[11px]` ×171, `text-[13px]` ×120, `text-[9px]` ×43… | **No hay escala tipográfica**: tamaños mágicos por todas partes |
| Helper `cn` | `lib/utils.ts:4` (`twMerge(clsx(...))`) | **Solo se usa en 3 archivos.** El resto concatena template strings. |
| **Tema claro/oscuro** | Toggle manual con `localStorage.theme` y `classList.add("dark")` en `ConditionalNavbar.tsx:18-33` (copia de `ThemeToggle.tsx`). `useTheme` observa la clase con un MutationObserver. `ThemeProvider` vacío (`components/providers/ThemeProvider.tsx:6`). | **`next-themes` está instalado pero no se usa.** No hay script anti-FOUC: con `ssr:false` el tema se aplica después de hidratar (parpadeo). |
| Variante `dark:` | 123 usos en 9 archivos (sobre todo `admin/inventory`, `predictive`, `suppliers`, `users`) | ⚠️ **No hay `@custom-variant dark`** en el CSS. En Tailwind v4 `dark:` responde a `prefers-color-scheme` y **no a la clase `.dark`**, así que esos 123 usos ignoran el toggle y se desincronizan de los tokens `html.dark`. |
| Design system en runtime | `DesignSystemProvider` escribe `--color-brand`, `--color-brand-light`, `--color-brand-sec`, `--font-display`, `--font-body` y `--radius-standard` en `<html>` desde localStorage (`features/shared/services/dataService.ts:190`) | Es solo client, así que hay un flash de valores por defecto. `--radius-standard` y `--color-brand-sec` apenas se consumen. |
| Tokens rotos | `bg-bg` (`app/dashboard/layout.tsx:46`) y `bg-[var(--color-surface-alt)]` (×8): **ni `--color-bg` ni `--color-surface-alt` existen** | Fondo transparente o inválido |

---

### 6. Colores en uso

#### Tokens definidos (`styles/globals.css`)
| Token | Claro (`:root` / `@theme`) | Oscuro (`html.dark`) |
|---|---|---|
| `--color-brand` | `#e85d04` (naranja quemado) | igual (no se redefine) |
| `--color-surface` | `#ffffff` | `#181a1b` |
| `--color-text` | `#1a1208` (marrón casi negro) | `#e8e6e3` |
| `--color-text-sec` | `#6b5e4e` | `#9c9a97` |
| `--color-text-muted` | `#a89880` | `#6c6a67` |
| `--color-border` | `#e8e1d8` (beige) | `#2c2e2f` |
| `--color-secondary` | `#232f38` | `#3a4a5c` |

Valores por defecto de `INITIAL_SETTINGS.appearance` (`features/shared/data/restaurantData.ts:333-337`): `primaryColor #e85d04`, `secondaryColor #1a1208`. `themeColor` del viewport: `#ffffff` / `#181a1b` (`app/layout.tsx:45-46`).

#### Uso de utilidades de token (paleta semántica de facto)
`bg-surface` 655 · `border-border` 631 · `text-text-muted` 551 · `text-text` 413 · `text-text-sec` 277 · `text-brand` 258 · `bg-brand` 210 · `border-brand` 152 · `bg-border` 74. Variantes arbitrarias equivalentes: `text-[var(--color-brand)]` 51, `text-[var(--color-text-sec)]` 43, `border-[var(--color-border)]` 43, `bg-[var(--color-brand)]` 28, `text-[var(--color-text)]` 21, `bg-[var(--color-surface)]` 14. Son **dos sintaxis para lo mismo**.

#### Paleta Tailwind nombrada (fuera de tokens)
Por familia: **red 383**, **emerald 297**, gray 139, amber 133, blue 74, green 44, purple 42, orange 22, yellow 16, sky 14, violet 12, slate 9, zinc 6, indigo 3, rose 1. También `bg-white` ×83 (no responde al modo oscuro).
Top: `text-emerald-600` 87 · `text-red-600` 67 · `text-red-500` 66 · `bg-red-50` 65 · `bg-emerald-50` 57 · `bg-gray-50` 37 · `text-amber-600` 27 · `bg-red-500` 27 · `border-red-200` 26 · `text-red-400` 23 · `border-emerald-100` 22 · `bg-emerald-600` 22 · `bg-gray-100` 21 · `bg-emerald-500` 21 · `bg-amber-50` 20 · `text-blue-600` 19 · `bg-amber-500` 19. Los estados (éxito, error, aviso) usan colores crudos de Tailwind sin tokens semánticos: `red`, `emerald` y `green` se mezclan para el mismo significado.

#### Hex literales
**101 hex distintos** en 51 archivos TS/TSX/JSX, más los CSS. Los más frecuentes: `#64748b` 28 · `#f97316` 22 · `#e2e8f0` 22 · `#1a1208` 22 · `#ffffff` 21 · `#e85d04` 16 · `#1e293b` 15 · `#334155` 12 · `#ef4444` 11 · `#0f172a` 11 · `#7c3aed` 10 · `#22c55e` 10 · `#dc2626` 9 · `#2563eb` 9 · `#475569` 9 · `#f8fafc` 9 · `#059669` 8 · `#e8e1d8` 8 · `#94a3b8` 7 · `#6b5e4e` 7 · `#7f8c8d` 6 · `#a89880` 6 · `#d97706` 5 · `#232f38` 5 · `#c0392b` 4 · `#0a0a0e` 4 · `#f5f3ef` 4 · `#faf9f7` 3.
Hay **dos paletas en conflicto**: (a) la de marca, cálida y terrosa (`#e85d04`, `#1a1208`, `#6b5e4e`, `#a89880`, `#e8e1d8`, `#f5f3ef`), y (b) la **slate fría de Tailwind** (`#64748b`, `#e2e8f0`, `#1e293b`, `#334155`, `#0f172a`, `#f97316` orange-500) escrita a mano en `db-performance`, `Importpreviewmodal`, `ExportModal` y la página predictiva copiada. También aparecen colores "flat UI" (`#7f8c8d`, `#c0392b`).
Arbitrarios de sombra con color de marca: `shadow-[0_4px_12px_rgba(232,93,4,0.3)]` ×11, `shadow-[0_24px_64px_rgba(26,18,8,0.18)]` ×10, y otros.

**Paleta de facto:** naranja quemado `#e85d04` como primario, marrón tinta `#1a1208` como texto y secundario, beiges `#e8e1d8`/`#f5f3ef` en bordes y fondos alternos, y verde esmeralda y rojo de Tailwind para los estados. Es una paleta más de "taquería moderna" que de restaurante español de alta gama con bodega. No hay tokens de estado, ni escala de neutros propia, ni tokens de sombra o radio usados de forma consistente.

---

### 7. Tipografías

- **Carga:** `<link>` a Google Fonts en `app/layout.tsx:58-67` (preconnect + un CSS2 con 5 familias: **DM Sans** (variable opsz/wght, ital), **Fraunces** (variable opsz/wght, ital), **Ibarra Real Nova** (400-700, ital), **Inter** (100-900) y **Roboto** (100-900)). **No se usa `next/font`**: la carga es render-blocking, desde un tercero y sin subsetting. No hay `@font-face` ni `@import` de fuentes.
- **Aplicación:**
  - `body { font-family: 'Ibarra Real Nova', serif }` (`styles/globals.css:30`): fuente base de todo el sitio.
  - Clases `font-display` (135 usos) y `font-body` (19): **en `@theme` no hay `--font-display` ni `--font-body`**, así que Tailwind v4 no genera esas utilidades. Las variables las inyecta en runtime `DesignSystemProvider` (`:31-32`, por defecto Fraunces y DM Sans), pero ninguna clase las consume, salvo 2 usos de `font-[family-name:var(--font-display)]`. **Lo más probable es que esas 154 clases no tengan efecto.** Conviene verificarlo en el CSS compilado.
  - `Inter`: `globals.css:305` (bloque predictivo muerto). `font-mono` (29), `monospace` inline (6) y varios `font-family: monospace` en el CSS predictivo.
  - `Roboto`: solo como fallback en `predictivo.css:9` (huérfano). **Se descarga y no se usa.**
  - El selector de admin (`features/.../settings/AppearanceSection.tsx:14-19`) ofrece Fraunces, DM Sans, Inter y system-ui. No incluye Ibarra Real Nova, que es justo la fuente base real.
- **Conclusión:** se descargan 5 familias variables (mucho peso) y en la práctica casi todo se ve en Ibarra Real Nova. Para el rediseño conviene pasar a `next/font/google` con 2 familias (display + texto) expuestas como `--font-*` dentro de `@theme`.

---

### 8. Iconos

- **lucide-react:** importado en **120 archivos**, con **~105 iconos distintos**. Es la única librería de iconos (no hay react-icons, heroicons, etc.). Tampoco hay emojis usados como iconos en los TSX.
- **SVG inline hechos a mano:** 22 `<svg>` en 13 archivos: `components/ConditionalNavbar.tsx` (7), `app/dashboard/admin/db-performance/page.tsx` (3), `components/landing/AboutSection.tsx` (2), y uno en `AccessMatrix.tsx`, `charts/Sparkline.tsx`, `charts/DonutChart.tsx`, `components/ui/Button.tsx` (spinner), `landing/Plato.jsx`, `landing/MolinoAnimado.jsx` (ilustraciones animadas), `Importpreviewmodal.tsx`, `Navbar.tsx`, `app/menu/page.tsx` y `app/(public)/about/page.tsx`. Los 7 de `ConditionalNavbar` y los de `db-performance` deberían ser iconos lucide. `Plato` y `MolinoAnimado` son ilustraciones de marca (el molino de "El Quijote").
- **`public/`:** solo `public/icons/icon.svg` como SVG, más PNG de PWA (`icon-192`, `icon-512`, `apple-touch-icon`). No hay favicon `.ico` en `public/`: el icono sale de `INITIAL_SETTINGS.restaurantIco` (`app/layout.tsx:29`).
- Gráficos: `recharts` se usa en 3 archivos. Los charts de admin (`BarChart`, `DonutChart`, `Sparkline`) son SVG o divs propios: **dos sistemas de gráficos**.

---

### 9. Relleno, TODO, console y código comentado

| Métrica | Conteo | Principales archivos |
|---|---|---|
| Lorem ipsum | **0** | — |
| Datos ficticios evidentes | varios | `restaurantData.ts:395-407` (`555-0101`, `laura@example.com`…), `suppliersMock.tsx:104`. Además, 6 páginas de admin y la de cajero se alimentan de mocks (§4). |
| Copy de relleno o incoherente | — | `app/page.tsx:131` "Cocina **mexicana** de alta gama", `app/layout.tsx:20-26` keywords "comida mexicana", stats de la landing comentadas (`app/page.tsx:139-141`) |
| TODO / FIXME / HACK | **6** | `features/dashboard/admin/data/mockData.ts:5` ("Eliminar esto y reemplazar por… API real"), `app/api/cron/backups/route.ts:95`, `app/dashboard/admin/predictive/page.tsx:397`, `store.ts:6` |
| `console.*` | **75** (8 `console.log`, el resto `error`/`warn`) | `console.log`: `app/page.tsx:113,118`, `utils/supabase/server.ts` (2), `utils/supabase/middleware.ts` (2), `lib/db.ts`, `app/api/cron/backups/route.ts` |
| Código comentado extenso | — | `app/dashboard/admin/predictive/page.tsx:396+` (bloque JSX que comenta **todo el modelo exponencial**), `handlerEmailActions.tsx` (52 l. `//`), `db-performance/page.tsx` (49), `menu/pedido/page.tsx` (28), `api/cron/backups/route.ts` (23), `(auth)/reset/page.tsx` (20), `dataService.ts` (16), `menu/producto/[id]/page.tsx` (16), `(auth)/frm_reset/page.tsx` (16), landing (`app/page.tsx:146-167`), `globals.css:36-50`, `tailwind.config.js` entero, `middleware.ts.bk` entero |
| Archivos "copia" | 1 | `app/dashboard/admin/predictive/page copy.tsx` (1719 l.) |
| `dangerouslySetInnerHTML` | 3 | `components/landing/Hero.tsx:96` (el título viene de settings o del backend), `components/landing/AboutSection.tsx:65`, `app/offline/page.tsx:60`. Riesgo XSS si el contenido es editable desde el admin. |
| Comentarios con emoji tipo tutorial | varios | `app/layout.tsx:3,71`, `ClientLayoutWrapper.tsx:5,21,28,33` |

---

### 10. Recomendación sobre reestructurar carpetas

**Propuesta (incremental):**
```
app/            solo rutas: (marketing) (auth) (shop: menu, pedido) dashboard/[rol]; layouts y loading/error por grupo
components/ui/  design system (Button, Card, Dialog, Input, Badge, Table, StatCard…)
components/layout/  SiteHeader, SiteFooter, DashboardSidebar, PageHeader
features/<dominio>/{components,hooks,api,types}   menu, pedidos, reservas, inventario, finanzas, usuarios, settings
lib/            api client, cn, session (solo lo compartido)
server/         db, schema, drizzle (o, mejor, mover al backend)
docs/ scripts/  documentación y scripts sueltos
```

**Pros:**
- Elimina las ~5.500 líneas muertas detectadas (copia predictiva, CSS huérfano, ~27 componentes sin uso, cliente, supabase…).
- Una sola fuente por concepto (Button, Modal, Sidebar, providers, auth, tema).
- Permite convertir páginas a server components con layouts por grupo, y separar claramente front y backend: hoy conviven `app/api` + Drizzle con un backend externo.

**Contras:**
- Hay que tocar muchos imports (`@/store` → 9 archivos, `restaurantData` → 40, `dataService` → 18).
- Mientras se migra, conviven ambas estructuras.
- Choca con el trabajo en curso en `feature/rediseno-web` y otras ramas.

**Riesgo: medio.** No hay tests en el repo y los mocks y `localStorage` (`dataService`) sostienen media aplicación, así que mover o borrar sin cobertura puede romper pantallas de forma silenciosa. Para mitigarlo:
1. Primero, **solo borrar código muerto** (riesgo bajo, verificable con `tsc` y `next build`).
2. Luego crear `components/ui` y migrar pantalla a pantalla durante el rediseño.
3. Los cambios de carpetas de dominio y de `app/api` van al final, en PRs pequeños por feature y con `next build` en cada paso.
4. Antes de nada, arreglar los bugs baratos: `@custom-variant dark (&:where(.dark, .dark *));`, importar `loading.css` (o rehacer el loader), declarar `--font-*` en `@theme`, retirar el valor de respaldo del secreto de firma.

---

## Anexo B — Auditoría B: imágenes, formularios y dashboards

Proyecto: `restaurant-management-web` (Next 16, React 19, Tailwind 4), rama `feature/rediseno-web`. Fecha: 2026-10-30.
Alcance: solo lectura. No se ha modificado ningún archivo del repo. Las variables de entorno se citan solo por nombre.

> Nota de contexto: el código describe "Restaurante El Quijote" (Huejutla de Reyes, Hidalgo, MX; "cocina nacional e internacional"). **No existe ningún CRUD ni vista de carta de vinos**: "vino" solo aparece en mocks (`aboutMock.ts:72` "Carta de vinos importados", `reportsMock.tsx:56`). Si la carta de vinos es un requisito, está por construir.

---

### 1. IMÁGENES

#### 1.1 Inventario de puntos de render

Leyenda de origen: **API** = URL que llega del backend (`NEXT_PUBLIC_API_URL`) o de Supabase Storage; **Cld** = Cloudinary; **Mock** = datos de ejemplo en el repo.

| Archivo:línea | Componente | Origen | alt | Dimensiones | priority | Formato / notas |
|---|---|---|---|---|---|---|
| `app/(auth)/login/page.tsx:214` | `CldImage` | `settings.loginBgImageUrl` (localStorage) o public ID `food-3955317_1280` | "Login background" (en inglés y genérico; es decorativa, debería ser `alt=""`) | `fill` + `sizes="100vw"` (está en una columna de ~50 %: sobredescarga) | no | f_auto vía Cld. **El public ID por defecto da 404** en la cuenta Cloudinary usada en el resto del código. Si el admin pega una URL de Unsplash/Pixabay (lo que sugiere el formulario), CldImage falla ("Resource not found"). |
| `app/(auth)/register/page.tsx:393` | `CldImage` | `settings.registerBgImageUrl` o el mismo ID | "Register background" | igual | no | Mismos problemas. `registerBgImageUrl` no se puede editar en el admin (solo existe el campo `loginBgImageUrl`). |
| `app/menu/page.tsx:99` | `CldImage` (hero) | Cld, URL absoluta de un PNG generado con Gemini | "Restaurant background" (inglés, genérico) | `fill`, sin `sizes` (por defecto 100vw, correcto aquí) | **sí** | El original pesa **2,08 MB PNG**. CldImage aplica f_auto/q_auto, así que se entrega optimizado, pero conviene subir un máster en WebP/AVIF o JPG. |
| `app/menu/page.tsx:227` | `SmartImage` (CategoryHeroImage) | API (Supabase) o la primera foto de un platillo | `category.nombre` | `fill`, **sin `sizes`** (contenedor h-80 en un grid: descarga 100vw) | no | |
| `app/menu/categoria/[slug]/page.tsx:106` | `SmartImage` | API | nombre de la categoría | `fill` + `sizes="100vw"` | sí | Correcto. |
| `app/menu/categoria/[slug]/page.tsx:153` | `SmartImage` | API | nombre del producto | `fill` + `sizes` responsivo | no | Correcto. |
| `app/menu/producto/[id]/page.tsx:320` | `SmartImage` | API | `platillo.nombre` | `fill` + `sizes="(max-width:1024px) 100vw, 50vw"` | sí | Correcto. |
| `app/menu/producto/[id]/page.tsx:442` | `SmartImage` | API | nombre del sugerido | `fill` + `sizes="56px"` | no | Correcto. |
| `app/menu/pedido/page.tsx:334`, `:387` | `SmartImage` | API | **"Platillo"** (genérico, debería ser el nombre) | `fill` + `sizes="48px"` | no | |
| `components/landing/AboutSection.tsx:31/39/47` | `next/image` | API `/about` → `galleryImages[0..2]` | "Restaurante" / "Platillo" / "Ambiente" (genéricos) | `fill`, **sin `sizes`** | no | **Riesgo**: si el host no está en `remotePatterns` (p. ej. `res.cloudinary.com` o Pixabay) el optimizador devuelve 400 en producción y lanza una excepción en dev. Con menos de 3 imágenes, `src` es `undefined` y lanza un error. |
| `app/(public)/about/page.tsx:254` | `<img>` | Google (`lh3.googleusercontent.com/gps-cs-s/...`) | "Fachada Adaptada El Quijote" | sin width/height; `object-cover` | n/a | **Devuelve 403** (curl). El `onError` la oculta, así que el bloque queda vacío. |
| `components/Navbar.tsx:262` | `<img>` (logo) | settings (Cld SVG) o el fallback **`/logo.svg`, que NO existe** en `public/` | "Restaurante El Quijote" | solo alto por clase; sin width/height (CLS) | n/a | Es el LCP candidato en algunas vistas y no tiene prioridad. |
| `components/landing/Footer.tsx:170` | `<img>` (logo) | `INITIAL_SETTINGS` (Cld) | **"Logo"** (genérico) | `h-10 w-auto` | n/a | |
| `components/admin/AdminSidebar.tsx:167` | `<img>` (logo) | `INITIAL_SETTINGS` (Cld) | "El Quijote" | caja de 80 px de alto, `object-contain` | n/a | |
| `components/landing/PromosSection.tsx:101` | `<img>` | API (`promo.imageUrl`) | `promo.title` (debería ser `alt=""` porque está al 30 % de opacidad y el título se repite en el texto) | sin dimensiones; absolute + cover | n/a | |
| `components/landing/CategoriesSection.tsx:99` | `<img>` | API (`cat.icon`) | `cat.name` (redundante con el `<h3>`; mejor `alt=""`) | `w-8 h-8 object-contain` | n/a | Si `icon` es un emoji (como en los mocks), sale una imagen rota. |
| `components/pwa/InstallPrompt.tsx:95` | `<img>` | `public/icons/icon-192.png` | `""` (decorativa, correcto) | 44×44 | n/a | OK |
| `app/offline/page.tsx:26` | `<img>` | `public/icons/icon-192.png` | `""` | 96×96 | n/a | OK |
| `app/dashboard/admin/menu/page.tsx:472` | `<img>` | API | `item.name` | caja de 64 px, cover | n/a | Sin lazy-loading en una lista larga. |
| `app/dashboard/admin/promociones/page.tsx:241` | `<img>` | API | `promo.title` | cover | n/a | |
| `features/.../ItemModal.tsx:162`, `PromoModal.tsx:190` | `<img>` (vista previa) | URL de subida a Cld | "Vista previa" | cover | n/a | |
| `features/.../about/GallerySection.tsx:35` | `<img>` | Mock/URL pegada por el admin | `g.caption` (puede estar vacío) | aspect-square + cover | n/a | `onError` sustituye por una foto de Unsplash, lo que **oculta errores** al admin. |
| `features/.../AboutPreviewModal.tsx:102` | `<img>` | igual | `g.caption` | 4/3 + cover | n/a | |
| `features/.../settings/LandscapeSection.tsx:88` | `background-image` inline | URL pegada por el admin | `title="Vista previa"` | 56×56 | n/a | La URL se interpola sin escapar dentro de `url(...)`. |
| `features/dashboard/cliente/components/{CartDrawer:68, HomeTab:102, MenuTab:79}` | `<img>` | Mock de Unsplash (hamburguesas, pizzas, tacos) | nombre | cover | n/a | **Código muerto**: no existe `app/dashboard/cliente`. Además, `/dashboard` redirige al rol 5 a `/dashboard/cliente`, que da 404. |
| `components/landing/MenuSection.tsx:83` | (sin imagen) | — | — | — | — | Las tarjetas de la carta en la home muestran un **emoji 🍽️ sobre un degradado naranja**, nada acorde con un restaurante de alta gama. |
| `app/forbidden.module.css:35` | `background-image` (gradiente) | CSS | — | — | — | Decorativo, OK. |

Uso global: **cero** `loading="lazy"` en las `<img>` (hay 1 atributo `loading=` en todo el código), **cero** `decoding`. `priority` solo en 3 páginas del menú.

`SmartImage` (`components/SmartImage.tsx:17`) decide así: `!src.startsWith("http") || src.includes("res.cloudinary.com")` → CldImage. **Problema**: una ruta local (`/images/...`, `/logo.svg`) se trata como *public ID* de Cloudinary y falla. Ejemplo latente: `features/shared/data/restaurantData.ts:231` → `"/images/menu/guacamole.jpg"`, que además no existe en `public/`.

#### 1.2 Archivos en `public/`

| Archivo | Tamaño | Formato | Nota |
|---|---|---|---|
| `public/icons/apple-touch-icon.png` | 2,4 KB | PNG 180×180 | OK |
| `public/icons/icon-192.png` | 2,5 KB | PNG 192×192 | OK |
| `public/icons/icon-512.png` | 7,1 KB | PNG 512×512 | Se usa también como `maskable` sin margen de seguridad propio (el molino puede recortarse). |
| `public/icons/icon.svg` | 1,1 KB | SVG (molino blanco sobre `#e85d04`) | No está referenciado en `manifest.ts` ni en `layout.tsx`. |
| `public/sw.js` | 12 KB | JS | Service worker |

- No hay ningún archivo de más de 200 KB ni PNG/JPG grandes que convertir: `public/` solo tiene iconos.
- **No hay logo en `public/`**. Referencias rotas: `/logo.svg` (`components/Navbar.tsx:259`) y `/images/menu/guacamole.jpg` (mock).
- **Logos reales (Cloudinary, `INITIAL_SETTINGS` en `features/shared/data/restaurantData.ts:315-323`)**:
  - `restaurantLogo_light` → `logo_dark_fvfcdk.svg`: SVG trazado con potrace, 600×600, **relleno `#ffffff` (blanco)**, para el tema oscuro.
  - `restaurantLogo_dark` → `logo_light_xy8ce1.svg`: el mismo trazado con **relleno `#000000`**, para el tema claro. Los nombres están cruzados: se entiende, pero confunde.
  - Las URLs llevan `f_auto`, así que **Cloudinary entrega los SVG rasterizados como PNG** (`Content-Type: image/png`, 7,9 KB). Se pierde la nitidez vectorial. Hay que quitar `f_auto` o `q_auto` en los SVG.
  - `restaurantLogo` → `logo_text_white_ktnpgg.png`: **404**. Se usa en `app/layout.tsx` como `icons.shortcut`.
  - `restaurantIco` → `.ico` con f_auto, que se entrega como PNG (200).
  - Es un logo monocromo cuadrado sin variante horizontal: en el navbar (`h-8…lg:h-20`) y en la sidebar (80 px de alto) ocupa mucho alto para poca legibilidad.

#### 1.3 Cloudinary: configuración

- **Cloud name**: el código no lo lee explícitamente. `next-cloudinary` (`CldImage`, `CldUploadButton`) lo toma por convención de la variable **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**, que no aparece en el código ni en el README (no he podido inspeccionar los `.env*`). Además, hay URLs absolutas `https://res.cloudinary.com/<cloud>/image/upload/...` **hardcodeadas** en `restaurantData.ts:317-323` y `app/menu/page.tsx:100`.
- Construcción de URLs: CldImage recibe un public ID o una URL de `res.cloudinary.com` y genera `.../image/upload/c_limit,w_<n>/f_auto/q_auto/<id>` con su propio loader. Por eso **`res.cloudinary.com` no necesita estar en `remotePatterns`** mientras pase por CldImage, pero sí lo necesita si llega a un `next/image` normal (p. ej. `AboutSection`).
- **Subida rota**: `ItemModal.tsx:173` y `PromoModal.tsx:197` usan `uploadPreset="tu_upload_preset"` (placeholder). **La subida de imágenes de platillos y promociones no puede funcionar** tal cual. Tampoco hay `options` de `clientAllowedFormats` ni de `maxFileSize`.
- Dependencias sin uso: `cloudinary-react` y `cloudinary-core` (ningún import). `firebase` y `firebase-admin` aparecen solo en código comentado.

#### 1.4 `next.config.js` → `images.remotePatterns`

Permitidos: `images.unsplash.com`, `i.pravatar.cc`, `lh3.googleusercontent.com`, `mdygrtdebtmuhmirnbxz.supabase.co`.

- Faltan: `res.cloudinary.com` (riesgo en `AboutSection` y en cualquier `next/image` con URL de Cld) y cualquier host que el admin pegue (Pixabay, etc.).
- Sobra: `i.pravatar.cc` (ningún uso en el código).
- No hay `formats: ['image/avif','image/webp']`, así que solo se sirve WebP por defecto.

#### 1.5 Verificación HTTP (curl -sI, 14 URLs)

| URL (abreviada) | Estado |
|---|---|
| Cld `logo_wgyijz.ico` | 200 (image/png) |
| Cld `logo_text_white_ktnpgg.png` | **404** |
| Cld `logo_dark_fvfcdk.svg` / `logo_light_xy8ce1.svg` | 200, pero **image/png** por f_auto |
| Cld `Gemini_Generated_Image_...png` (hero `/menu`) | 200, **2,08 MB** el original |
| Cld `food-3955317_1280` (fallback de login/registro) | **404** |
| Unsplash (7 URLs de mocks/galería/fallback) | 200, 22-89 KB JPEG |
| `lh3.googleusercontent.com/gps-cs-s/...` (fachada en `/about`) | **403** |

#### 1.6 Imágenes que fallan o se ven mal: resumen

1. **Fondo de login/registro**: el public ID por defecto da 404, y una URL externa pasada a CldImage también falla. Además se guarda en localStorage (`SettingsService`), así que solo cambia en el navegador del admin.
2. **Fachada en `/about`**: 403. La imagen se oculta y queda una caja vacía.
3. **Fallback del logo del Navbar** `/logo.svg`: no existe.
4. **Icono `shortcut`** (`logo_text_white`): 404.
5. **SVG del logo servidos como PNG** por `f_auto`.
6. **Galería de la home** (`AboutSection`): `next/image` sin `sizes` y dependiente de `remotePatterns`; se rompe con hosts no listados o con menos de 3 imágenes.
7. **Tarjetas de la carta en la home**: sin foto (emoji).
8. **Subida de imágenes del admin**: el upload preset es un placeholder.
9. Las `<img>` de logos y promos no tienen width/height (CLS) ni lazy-loading.
10. Alt genéricos o en inglés: "Login background", "Register background", "Restaurant background", "Logo", "Platillo". Las imágenes decorativas deberían llevar `alt=""`.

---

### 2. FORMULARIOS Y VALIDACIONES

**No hay librerías de validación** (ni zod, ni yup, ni react-hook-form). Todo es manual con `useState` y regex. Conteo global en `app/`, `components/` y `features/`: `aria-invalid` **0**, `aria-describedby` **0**, `role="alert"` **0**, `aria-live` 1, `autoComplete` **1** (solo `new-password` en el registro), `inputMode` 1, `htmlFor` 2, `maxLength` 10. Además hay **32 `alert()`** y **11 `confirm()`** en el admin. No hay honeypot ni reCAPTCHA (`@types/grecaptcha` está instalado, pero no se usa).

#### 2.1 Tabla de formularios

| Archivo | Propósito | Validación | Campos / reglas | Mensajes de error | a11y / atributos | Bloqueo envío | Otros |
|---|---|---|---|---|---|---|---|
| `app/(auth)/login/page.tsx` | Login | Manual: `emailRegex` + `password.length>=8` (habilita el botón) | email, password | Muestra `data.message` del API tal cual. No se puede saber desde el front si distingue "usuario no existe" de "contraseña incorrecta": **hay que revisarlo en el API**. 429 genérico. Lockout por texto (`useLockout`). | `FloatingInput`: la etiqueta es un `<span>`, no un `<label>`; sin `autocomplete` (`email`, `current-password`) ni `aria-invalid`; las alertas son `div` sin `role="alert"` | Sí (`disabled` con loading/lockout) | **`callbackUrl` sin validar → open redirect** (`router.push(callbackUrl)`). El token se guarda en una cookie no-HttpOnly y en localStorage. "Recuperar contraseña" lleva a una página desactivada. |
| `app/(auth)/register/page.tsx` | Registro | Manual, la más completa: `validateNameBlock`, `isValidEmail`, `phoneRegex`, 5 regex de contraseña + secuencias + datos personales | nombre/apellido (solo letras, máx. 30 por palabra y 50 en total, ≤2 palabras), email (≤100, local ≤64, etiquetas ≤63), teléfono (+52, 10 dígitos), contraseña 8-64 | Por campo, en vivo. Los 4xx no-array muestran `data.message` (**posible enumeración** si el API responde "correo ya registrado"). 5xx genérico. | Solo la contraseña tiene `autoComplete="new-password"` y `maxLength`. El teléfono tiene `type=tel`, `inputMode=numeric`, `pattern`, `maxLength`. Los errores no están vinculados con `aria-describedby`. "Términos" y "Privacidad" son `<span>`, no enlaces. | **No**: `disabled={!isFormValid}` no incluye `loading` → **doble envío posible** | La regla de nombre rechaza nombres con apóstrofo o guion ("O'Neill", "Ana-María"). La barra de fortaleza solo mide las 5 reglas. |
| `app/(auth)/frm_reset/page.tsx`, `app/(auth)/reset/page.tsx` | Recuperar / restablecer contraseña | — | — | **Funcionalidad desactivada, con aviso en inglés** ("Password recovery through email has been disabled…"). Estilo ajeno al sistema de diseño (`bg-gray-50`, `bg-blue-600`). | — | — | Callejón sin salida desde el login. |
| `app/(auth)/profile/page.tsx` | Editar perfil y dirección | Solo `required` HTML (no hay `<form>`: el submit es un `onClick`, así que `required` no actúa) | nombre, apellidos, teléfono, dirección, CP (`maxLength=5`) | Genérico | `<label>` sin `htmlFor`; sin `autocomplete` ni `inputMode` | Sí (`isSubmitting`) | No reutiliza `utils/validators`. Banner de confirmación previo, correcto. |
| `components/landing/ReservationSection.tsx` | Reserva (home) | `required` HTML | nombre, email, fecha, hora (select), personas | **Simulado**: `setTimeout(1000)` y "¡Reservación confirmada! Revisa tu correo", **sin llamar al API**. Engaña al cliente. | Sin labels asociados, sin `min` de fecha | Sí | Hay que eliminarlo o conectarlo a `createReservation`. |
| `components/reservations/ReservationSidebar.tsx` | Reserva real (3 pasos + mapa de mesas) | Manual por paso | nombre, teléfono (solo requerido), email `/\S+@\S+\.\S+/` (no reutiliza `isValidEmail`), fecha `min=today`, futura, comensales ≥1, mesa | En español y por campo | `<label>` sin `htmlFor`; sin `autocomplete` (`name`, `tel`, `email`); sin `maxLength` en peticiones/ocasión | Sí (`submitting`) | Disponibilidad vía `useReservationAvailability`. |
| `app/menu/pedido/checkout/page.tsx` | Checkout Stripe (dirección, CFDI, tarjeta, pago) | Manual por paso: `CP_REGEX=/^\d{5}$/`, `RFC_REGEX=/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i` (l.13-14) | dirección, RFC, razón social, régimen, CP fiscal, tarjeta (`CardElement`) | Mensajes de Stripe y del API | **Inputs solo con placeholder (sin label)**; sin `autocomplete` (`street-address`, `postal-code`…) ni `inputMode` en el CP | Sí (`procesando`) | Usa `CardElement` (legacy) en lugar de `PaymentElement` (no hay Apple/Google Pay ni wallets). La factura se crea desde el cliente después del pago. |
| `app/dashboard/admin/users/page.tsx` | CRUD de usuarios (alta/edición) | `required`, `type=email/tel`, password `minLength=8` | nombre, apellido, email, tel, password, rol | `alert("Error: …")` | labels sin `htmlFor` | **No** | La contraseña de admin es más débil que la política del registro. |
| `features/.../users/UserModal.tsx` | Ficha de empleado | Botón deshabilitado si faltan nombre/apellido/email/documento | fechas, email, número | — | — | — | |
| `features/.../ItemModal.tsx` | CRUD de platillo + imagen | Botón deshabilitado si `!form.name` | precio, calorías, tiempo (`type=number`, sin `min`) | — | — | — | **`uploadPreset="tu_upload_preset"`**; sin límite de tipo/tamaño |
| `features/.../PromoModal.tsx` | CRUD de promoción + imagen | `!form.title`; código `maxLength=4` | % / monto, fechas (sin validar inicio < fin) | — | — | — | Mismo preset placeholder |
| `features/.../ProductModal.tsx`, `SupplierModal.tsx`, `MermaModal.tsx`, `MovementModal.tsx`, `AdjustModal.tsx`, `OrderModal.tsx` | CRUD de inventario, proveedores, mermas y caja | Solo `!form.name` o equivalente | `type=number` sin `min` y sin `step` en dinero | — | — | Parcial | |
| `features/.../InvoiceModal.tsx` | Factura manual | `valid` calculado; RFC `maxLength=13` | — | — | — | Sí | No reutiliza `RFC_REGEX` del checkout |
| `features/.../reservations/ReservationModal.tsx` | Reserva (admin) | `required` | — | — | — | — | |
| `features/.../settings/GatewayModal.tsx` | Claves de pasarela | `type=password` | — | — | — | — | Introduce secretos desde el front (hay que revisar a dónde se envían) |
| `app/dashboard/admin/menu/page.tsx:580` + `components/admin/Importpreviewmodal.tsx` | Importar carta (CSV/JSON/XLSX) | `accept=".csv,.json,.xlsx"` + comprobación de extensión | — | `alert(...)` | — | Sí (`uploading`) | **Sin límite de tamaño, sin comprobar MIME ni firma**. `xlsx@0.18.5` (SheetJS en npm) tiene CVEs conocidos (prototype pollution / ReDoS): conviene migrar a la distribución oficial ≥0.20.x. |
| Búsquedas (`admin/menu`, `inventory`, `UserFilters`) | Filtro local | — | — | — | input sin label | — | Filtrado en cliente: **no necesita debounce**. `VoiceSearch.tsx` existe aparte. |

#### 2.2 Esquemas y regex reutilizables

- `utils/validators.tsx`: `NAME_MAX_LENGTH=50`, `EMAIL_MAX_LENGTH=100`, `EMAIL_LOCAL_MAX_LENGTH=64`, `PASSWORD_MAX_LENGTH=64`, `PHONE_DIGITS=10`, `phoneRegex`, `emailRegex` (TLD de 2 a 24), `isValidEmail()`, `letters`, `haveAnVowel`, `noRepeatMoreThreeTimes` (duplicado como `noRepeatConsonantsMoreThreeTimes`, idéntico), `length`, `lowercase`, `uppercase`, `number`, `specialChar` (`[!@#$%&,.-]`, una lista restringida: rechaza contraseñas válidas con `_`, `*`, `?`).
- `app/(auth)/register/page.tsx`: `cleanName`, `validateNameBlock`, `isPasswordContainingPersonalData`, `hasSequentialPattern` y variantes. **Deberían moverse a `utils/validators`** para reutilizarlos en el alta de usuarios del admin y en el perfil.
- `app/menu/pedido/checkout/page.tsx:13-14`: `RFC_REGEX`, `CP_REGEX`. Conviene moverlos a validators y reutilizarlos en `InvoiceModal` y `profile`.
- `components/reservations/ReservationSidebar.tsx`: regex de email laxa; sustituir por `isValidEmail`.
- Recomendación: un único módulo `lib/validation/` (zod) compartido con el API, y un `<Field>` común con `<label htmlFor>`, `aria-invalid`, `aria-describedby`, `autocomplete` e `inputMode`. Esto sustituiría a `FloatingInput`, que no admite esas props.

---

### 3. DASHBOARDS ADMIN

Fuentes de datos: **API externa** (`NEXT_PUBLIC_API_URL`, vía `fetch` o `lib/api.ts`); **route handlers internos** con Drizzle/Postgres (`/api/inventory/*`, `/api/admin/users`, `/api/backups`); **localStorage** (`features/shared/services/dataService.ts` → `SettingsService`, menú, pedidos y mesas); **mocks** en `features/dashboard/*/data/*`. Recharts solo se usa en 2 sitios (ScatterChart en reportes y LineChart en predictivo). El resto son gráficas propias en SVG/divs (`charts/BarChart`, `DonutChart`, `Sparkline`, `HourBarsChart`).

| Ruta | Primera vista | Datos | Estados | Responsivo | Observaciones |
|---|---|---|---|---|---|
| `/dashboard/admin` | 4 KPI (ventas activas, pedidos pendientes, ocupación, alertas de stock) + tabla de pedidos recientes con filtros + barras por hora; un banner de stock crítico | API: `/dashboard/admin/stats`, `/pedidos/admin/recent`, `/dashboard/admin/ventas-por-hora`. Stock: `${API_URL}/api/inventory/products` (**probable ruta errónea**: el handler interno es `/api/inventory/products` del propio Next, así que el contador de stock quedaría en 0 en silencio) | Carga a pantalla completa con texto; **sin estado de error** en los KPI (si falla, muestra $0) | La tabla de pedidos **no tiene `overflow-x-auto`**; `p-8` en móvil | Saludo **hardcodeado** ("Buenas noches, Admin", `useState({name:"Admin"})`). Grid vacío al final (TableStatusGrid y StockAlerts comentados). Banner `bg-red-50` sin variante oscura. |
| `/dashboard/admin/reports` | 3 pestañas. En "Ventas": 4 KPI + 2 gráficas de barras (semana, mes) con 3 mini-stats cada una + donut de métodos de pago + tabla top productos con sparklines | **Ventas y Personal: 100 % mock** (`reportsMock`) con cifras fijas ("Mejor día Sábado $9,400", `change: 5.2`, `-1.8`, sparklines `[20,25,40,35,50,45]`). Segmentación: API (`lib/api`) con ScatterChart | Carga y error solo en segmentación | Tabla con `min-w-[700px]` y scroll | **Datos falsos presentados como reales**. Bug en `KpiCard`: `color="var(--color-brand)"` → `backgroundColor: "var(--color-brand)15"` (inválido), así que el icono se queda sin fondo. Exportación (CSV/XLSX/PDF) vía `ExportModal` → `${BASE_URL}/export`. |
| `/dashboard/admin/db-performance` | 4 KPI (CPU, conexiones, latencia p95, tamaño) + 8 secciones (CPU, R/W, almacenamiento, conexiones, latencia, wait events, tablas calientes, autovacuum), 2 tablas, donut | API: 8 endpoints `/db-metrics/*` en paralelo, **sondeo cada 10 s** + POST vacuum manual | Carga y error por sección | **No responsivo**: estilos inline `gridTemplateColumns: "repeat(4,1fr)"`, `repeat(5,1fr)`, `1fr 1fr`; paleta `T` en hex fija (no respeta el modo oscuro) | 1.507 líneas en un solo archivo. Pantalla técnica de DBA dentro del admin de un restaurante. |
| `/dashboard/admin/finance` | 4 KPI (ingresos, egresos, balance, propinas pendientes) + pestañas Caja chica / Cierres / Propinas (lista en grid) | **Mock** (`financeMock`), estado en memoria | "No hay…" en las listas | Grid con columnas fijas `[1.5fr_1fr_1fr_80px]` (se aprieta en móvil) | Lo que se guarda se pierde al recargar. |
| `/dashboard/admin/finance/invoices` | Filtros + tabla | **Mock** (`invoicesMock`) | — | `overflow-x-auto` | |
| `/dashboard/admin/payroll` | 4 KPI (nómina semanal, mensual estimada, empleados, promedio) + lista + tabla `min-w-[560px]` | API `/payroll` | Carga y error | Scroll horizontal | |
| `/dashboard/admin/inventory` | 4 KPI (total, crítico, valor, mermas del mes) + pestañas Productos/Mermas + filtros por categoría + tabla | Handlers internos `/api/inventory/*` (Drizzle) vía `useInventory` | Carga, error y vacío | `overflow-x-auto` | Modales de producto, merma y ajuste dentro de la propia página. |
| `/dashboard/admin/inventory/suppliers` | Pestañas + tabla + menú contextual | Handlers internos | Carga, error y vacío | `overflow-x-auto` | |
| `/dashboard/admin/menu` | Buscador, filtros, tarjetas por categoría, importación/exportación CSV/JSON/XLSX | Mezcla: `SettingsService.getMenu()` (localStorage) + `fetch` al API | Errores con `alert()` | Tarjetas | Dos fuentes de verdad para la carta. |
| `/dashboard/admin/reservations` | 4 filtros + tabla (desktop) / **tarjetas (móvil)** + riesgo de no-show | API (`reservations.service`) | Carga, error y vacío | **El único con patrón tabla→cards** | Buena referencia para el resto. |
| `/dashboard/admin/predictive` | 4 KPI + tabla de regresión + LineChart (Recharts) | API (`lib/api`) | Carga, error, "Sin datos" | `overflow-x-auto` | Hay un `page copy.tsx` duplicado en el árbol de rutas. |
| `/dashboard/admin/users` | Tabla de usuarios + formulario modal | API (`lib/api`) `/users` | Carga (pulse); errores con `alert()` | `overflow-x-auto` | `UserTable`, `AccessMatrix`, `ShiftCalendar` e `IncidencePanel` existen en features; habría que comprobar si se usan. |
| `/dashboard/admin/promociones` | Lista de promociones con imagen | API | Carga, error, vacío | — | |
| `/dashboard/admin/settings` | Secciones de apariencia, branding, landscape, pasarelas, backups y offline | **localStorage** + `settingsMock` | — | — | La configuración global (logo, fondo de login) **no se persiste en el servidor**. |
| `/dashboard/admin/about` | Identidad, contacto, horario, galería, features | **Mock** (`aboutMock`) | — | — | La landing lee `/about` del API: lo editado aquí no llega a la web pública. |
| `/dashboard/cajero` | 4 StatCard (ventas del día, por cobrar, tickets cerrados, ticket promedio) + tickets pendientes y cerrados | **Mock** (`cajeroMock`) | — | — | |
| `/dashboard/mesero` | StatCards + grid de mesas | localStorage | pulse | — | |
| `/dashboard/cocina` | KitchenStats + kanban | localStorage | — | — | |
| `/dashboard/cliente` | — | — | — | — | **No existe** (el redirect del rol 5 da 404); los componentes de `features/dashboard/cliente` son código muerto. |

#### 3.1 Juicio de UX

**Qué satura**
- `db-performance`: 4 KPI + 8 bloques técnicos que se refrescan cada 10 s. Es información para un DBA, no para la gerencia de un restaurante. Debería salir de la navegación principal o resumirse en un semáforo de "salud del sistema".
- `reports`: 4 KPI + 6 mini-stats + 2 barras + donut + tabla con sparklines en una sola pestaña, todo con el mismo peso visual (tarjetas iguales, `font-black` y uppercase de 9-12 px por todas partes). No hay una cifra protagonista.
- La sidebar tiene 18 entradas (con grupos anidados) y mezcla operación diaria con sistema (predicción, BD, configuración, acerca de).

**Qué sobra o es redundante**
- Los KPI de ventas se repiten en admin, reportes, finanzas y cajero, y cada uno sale de una fuente distinta (API, mock, mock, mock): **cuatro "ventas de hoy" que no van a coincidir**.
- Mini-stats y sparklines inventados, y deltas % fijos: generan desconfianza en cuanto alguien los contrasta.
- El subtítulo por defecto de `KpiCard`, "vs. período anterior", aparece aunque no haya comparación.
- Código y componentes muertos: `components/layout/Sidebar.tsx`, `DashboardTopBar`, `ActiveSidebar`, `TableStatusGrid` y `StockAlerts` (comentados), `predictive/page copy.tsx`, `features/dashboard/cliente/*`, `config/navigation/*.nav.ts` (no se usan).

**Qué jerarquía falta**
- Una cifra principal por pantalla (p. ej. ventas de hoy contra el mismo día de la semana anterior) por encima de las secundarias.
- Selector de período global (hoy / semana / mes) que gobierne todos los widgets; ahora cada widget tiene su propio criterio.
- Estados de error y de "datos de demostración" visibles: hoy un fallo del API se ve como "$0" y un mock parece un dato real.
- Una paleta y tipografía coherentes: `db-performance` usa hex inline y el resto, tokens.

#### 3.2 KPIs propuestos (3-5 por dashboard)

- **Admin (inicio, operación del día)**: 1) Ventas de hoy contra el mismo día de la semana pasada; 2) Cubiertos / comensales servidos y ocupación de sala en tiempo real; 3) Ticket medio por comensal; 4) Reservas de hoy (confirmadas / pendientes / riesgo de no-show); 5) Alertas críticas (stock crítico + pedidos retrasados), como lista de acción y no como número.
- **Reportes (análisis)**: 1) Ingresos del período con su tendencia; 2) Ticket medio y nº de cubiertos; 3) Mix de ventas por categoría, incluido el **% de vino y bebidas sobre el total**, clave en alta gama; 4) Top 5 y bottom 5 de platos por margen, no solo por unidades; 5) Ratio de clientes recurrentes (segmentación).
- **Finanzas**: 1) Balance de caja del turno; 2) Diferencia de arqueo en el cierre; 3) Propinas pendientes de repartir; 4) Coste de personal en % de ventas.
- **Inventario**: 1) Productos bajo mínimo (con CTA "pedir"); 2) Valor del inventario; 3) Mermas del mes en $ y en % del consumo; 4) Rotación o días de cobertura (y de bodega de vinos si se implementa).
- **Reservas**: 1) Reservas de hoy y de los próximos 7 días; 2) Tasa de no-show; 3) Ocupación prevista por franja; 4) Tamaño medio de grupo.
- **Cajero**: 1) Tickets por cobrar (prioridad); 2) Ventas del turno; 3) Mix de métodos de pago.
- **Sistema/BD**: un único indicador de salud (OK / degradado / caído) + latencia p95 + almacenamiento usado, y el detalle detrás de un "ver más".

#### 3.3 Navegación admin

- `app/dashboard/layout.tsx` monta **`components/admin/AdminSidebar.tsx` para todos los roles** (admin, cajero, mesero, cocina). La sidebar **no filtra por rol**: un mesero ve las entradas de Finanzas, Nómina y Base de datos (aunque el proxy le bloquee el acceso).
- **Móvil**: la sidebar es `fixed`, siempre visible, con un mínimo de 260 px (un `ResizeObserver` escribe `--sidebar-width`), y el contenido aplica `marginLeft: var(--sidebar-width, 260px)`. **No hay hamburguesa, drawer, overlay ni breakpoint**: en un móvil de 390 px quedan unos 130 px para el contenido. Es el problema de layout más grave del panel.
- Las entradas son `<button onClick={router.push}>` y no `<Link>`: sin prefetch, sin abrir en una pestaña nueva, sin `aria-current="page"` y sin semántica de navegación para lectores de pantalla.
- Logo de 80 px de alto en la cabecera de la sidebar: consume altura útil. Sin cabecera o topbar en el contenido (no hay buscador global, notificaciones ni selector de período). `DashboardTopBar` existe, pero no se usa.
- El nombre del usuario se obtiene en el layout con `fetch(${BACKEND_URL}/users/${id})` sin token. Si falla, la sidebar sale con nombre vacío.

---

### Prioridades sugeridas

1. Sidebar responsiva (drawer en <1024 px) filtrada por rol, con `<Link>` y `aria-current`.
2. Arreglar las imágenes rotas: fondo de login (usar `SmartImage` y un fallback que exista), `/logo.svg`, fachada 403, `logo_text_white` 404, `uploadPreset` real y `f_auto` fuera de los SVG.
3. Quitar o etiquetar como "demo" los mocks en reportes, finanzas, cajero y about; corregir la ruta de stock del inicio; añadir estados de error.
4. Formularios: un componente `Field` accesible (`label`, `aria-*`, `autocomplete`), bloquear el doble envío en el registro, validar `callbackUrl`, conectar o eliminar la reserva simulada de la home y reactivar la recuperación de contraseña (en español).
5. `remotePatterns`: añadir `res.cloudinary.com` y `formats: ['image/avif','image/webp']`, y quitar `i.pravatar.cc`.

---

## Anexo C — Auditoría de seguridad front-end

El informe completo (2026-10-30, commit base `922c05d`) se conserva **fuera del repositorio**, porque contiene detalle de vulnerabilidades. Su resumen público está en la §14; las notas abiertas, en `NOTAS-PENDIENTES.md`, y su clasificación, en `PLAN-AMPLIACION.md`.

---

## Anexo D — Verificaciones técnicas: restaurant-management-web

Fecha: 2026-10-30 · Rama: `feature/rediseno-web` (commit base 922c05d) · Ejecutado en Windows 11 + Git Bash.
No se modificó ningún archivo versionado (`git status` limpio salvo `PRODUCT.md`, un archivo sin seguimiento que apareció a las 23:00 y que **no** creó esta verificación). Solo se generaron `node_modules/` y `.next/`, que están en `.gitignore`.

### 1. Entorno

| Elemento | Valor |
|---|---|
| Node.js | v24.22.2 |
| pnpm | el shim global de pnpm está roto ("the global target of the pnpm shim points back at the shim"); se usó `npx -y pnpm@9` → **9.15.9** |
| Lockfile | `lockfileVersion: '9.0'`, `pnpm install --frozen-lockfile` OK (2 min 4 s) |
| Next.js / React / TypeScript | 16.0.7 (Turbopack) / 19.2.1 / 5.9.3 |
| `.env` / `.env.local` / `.env.production` / `.env.example` | **No existe ninguno** |
| Chrome | `C:/Program Files/Google/Chrome/Application/chrome.exe` (Edge no está en la ruta indicada) |
| Lighthouse | 12.8.2 (vía `npx -y lighthouse@12`) |

Variables de entorno que referencia el código (solo nombres): `NEXT_PUBLIC_API_URL` (35 usos, 14 sin valor por defecto), `NODE_ENV`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_DRIVE_FOLDER_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `DATABASE_URL`, además de `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (la exige `next-cloudinary`).

### 2. Lint

- **No hay configuración de ESLint en el repo** (ni `eslint.config.*` ni `.eslintrc*`) y **`eslint` no está en `devDependencies`**.
- `pnpm lint` → **falla**: `"eslint" no se reconoce como un comando interno o externo` (exit 1).
- `npx eslint@9 .` → falla: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` (exit 2).

**Lint complementario (fuera del repo):** se instaló `eslint@9` + `eslint-config-next@16.0.7` (core-web-vitals + typescript, el preset oficial de `create-next-app`) en el scratchpad y se ejecutó con `-c <config del scratchpad>` sobre el repo (ignorando `.next`, `.agent`, `.claude`, `.gemini`, `.dsh`, `.impeccable`).

**259 archivos · 233 errores · 135 advertencias**

| # | Regla | Sev. | Nº |
|---|---|---|---|
| 1 | `@typescript-eslint/no-explicit-any` | error | 153 |
| 2 | `@typescript-eslint/no-unused-vars` | warn | 110 |
| 3 | `react-hooks/set-state-in-effect` | error | 43 |
| 4 | `react/no-unescaped-entities` | error | 18 |
| 5 | `@next/next/no-img-element` | warn | 15 |
| 6 | `@typescript-eslint/no-require-imports` | error | 8 |
| 7 | `react-hooks/exhaustive-deps` | warn | 7 |
| 8 | `react-hooks/immutability` | error | 5 |
| 9 | `prefer-const` | error | 3 |
| 10 | `react-hooks/purity` | error | 2 |
| — | `react-hooks/rules-of-hooks`, `jsx-a11y/alt-text`, `@next/next/no-page-custom-font`, directiva sin uso | 1 c/u | 4 |

Hallazgos relevantes (no estilísticos):
- **`react-hooks/rules-of-hooks`**: `components/landing/Footer.tsx:34`, `useFetch` se llama de forma condicional (es un bug real de React).
- `react-hooks/immutability` (variable usada antes de declararse o reasignada tras el render): `app/dashboard/admin/promociones/page.tsx:36`, `app/dashboard/admin/users/page.tsx:28`, `app/menu/producto/[id]/page.tsx:150`, `app/dashboard/admin/db-performance/page.tsx:368`, `features/dashboard/admin/components/charts/DonutChart.tsx:41`.
- `react-hooks/purity` (`Date.now()` durante el render): `ReservationModal.tsx:19`, `UserModal.tsx:32`.
- `jsx-a11y/alt-text`: `components/SmartImage.tsx:23`.
- Archivos con más avisos: `app/menu/pedido/checkout/page.tsx` (21), `app/page.tsx` (18), `app/menu/pedido/page.tsx` (16), `admin/db-performance/page.tsx` (13), `admin/menu/page.tsx` (13), `menu/producto/[id]/page.tsx` (12), `hooks/useInventory.tsx` (11).
- Hay un archivo residual `app/dashboard/admin/predictive/page copy.tsx` (9 avisos). No genera ruta, pero se compila y se analiza.

### 3. Typecheck

`npx tsc --noEmit -p tsconfig.json` → **0 errores** (exit 0). `strict: true`, `skipLibCheck: true`, `allowJs: true`. El build de Next también pasó la fase "Running TypeScript".

### 4. Pruebas

- No hay script `test` en `package.json`.
- No hay jest, vitest, playwright ni cypress en las dependencias.
- No hay archivos `*.test.*` ni `*.spec.*` versionados.
- **Resultado: no existen pruebas automatizadas.**

### 5. Build

#### 5.1 Build tal cual (sin `.env`)
`pnpm build` → **FALLA** (exit 1) en "Collecting page data":
`Error: DATABASE_URL no está configurada en el .env` (la lanza `lib/db.ts:8` al importarse) → `Failed to collect page data for /api/inventory/orders`.

#### 5.2 Build con valores ficticios (solo en el entorno del proceso, sin crear archivos)
Se exportaron valores *placeholder* inventados para `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `JWT_SECRET`.
- 2.º intento: **falla** al prerenderizar `/register`: `A Cloudinary Cloud name is required ... NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. **Esta variable no aparece en el código del proyecto, pero es obligatoria en tiempo de build.**
- 3.er intento (añadiendo `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` ficticio): **ÉXITO**. Compilado en 119 s, 62 páginas generadas en 6,9 s. `NEXT_PUBLIC_API_URL` se dejó sin definir.
- Advertencias: solo `[baseline-browser-mapping] The data in this module is over two months old` (repetida en cada worker). No hubo advertencias de compilación.
- Next 16 **no muestra la columna "First Load JS"**. Como referencia, `.next/static/chunks` ocupa 3,4 MB en 71 chunks, y Lighthouse mide un peso total de transferencia de 352–405 KiB por página pública.

#### 5.3 Tabla de rutas
`○` estática (prerenderizada) · `ƒ` dinámica (renderizada bajo demanda) · existe `ƒ Proxy (Middleware)` (`proxy.ts`).

| Tipo | Rutas |
|---|---|
| ○ Públicas | `/`, `/about`, `/ayuda`, `/condiciones`, `/corporativo`, `/devoluciones`, `/privacidad`, `/promociones`, `/reservations`, `/seguridad`, `/menu`, `/menu/pedido`, `/menu/pedido/checkout`, `/menu/pedido/checkout/exito`, `/offline`, `/maintenance`, `/forbidden`, `/unauthorized`, `/_not-found`, `/manifest.webmanifest` |
| ○ Auth | `/login`, `/register`, `/reset`, `/frm_reset`, `/profile` |
| ƒ Públicas dinámicas | `/menu/categoria/[slug]`, `/menu/producto/[id]` |
| ƒ Dashboard | `/dashboard`, `/dashboard/admin` (+ `about`, `db-performance`, `finance`, `finance/invoices`, `inventory`, `inventory/suppliers`, `menu`, `payroll`, `predictive`, `promociones`, `reports`, `reservations`, `settings`, `users`), `/dashboard/cajero`, `/dashboard/cocina`, `/dashboard/mesero` |
| ƒ API | `/api/admin/users`, `/api/admin/users/[id]`, `/api/auth/{login,logout,me,register}`, `/api/backups`, `/api/cron/backups`, `/api/inventory/{mermas,orders,products,products/adjust,suppliers}`, `/api/menu/categories`, `/api/mesas`, `/api/public/{combos,cupones}`, `/api/settings` |

### 6. Servidor (`next start -p 3100`) y cabeceras

Servidor arrancado con los mismos valores ficticios y **detenido al terminar** (PID terminado, puerto 3100 libre).

#### Cabeceras de `/` (200)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Powered-By: Next.js
Cache-Control: s-maxage=31536000
x-nextjs-cache: HIT · x-nextjs-prerender: 1 · x-nextjs-stale-time: 300
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
Content-Type: text/html; charset=utf-8 · ETag presente
```
- **Sin `Content-Security-Policy`**, sin `Permissions-Policy` y sin `Cross-Origin-Opener-Policy`.
- **`X-Powered-By: Next.js` está expuesto** (falta `poweredByHeader: false`).
- `/_next/static/*`: `Cache-Control: public, max-age=31536000, immutable` (correcto).
- `/sw.js`: `Cache-Control: no-cache, no-store, must-revalidate` (correcto, según `next.config.js`).
- `/login` y las demás páginas estáticas: `Cache-Control: s-maxage=31536000`.

#### Rutas admin sin sesión
`/dashboard`, `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/menu`, `/dashboard/cajero`, `/dashboard/cocina` y `/dashboard/mesero` devuelven **307** → `/login?callbackUrl=<ruta codificada>`. Llevan las mismas cabeceras de seguridad.

#### Códigos HTTP (curl) del resto de rutas
- **200**: todas las públicas y de auth listadas en 5.3, además de `/menu/categoria/entradas`, `/menu/producto/1`, `/manifest.webmanifest` y `/sw.js`.
- `/no-existe` → 404.
- Las rutas internas de `/api` sin sesión se midieron en esta etapa; su resultado forma parte del informe de seguridad que se conserva fuera del repositorio. Desde el paso 2.10, `proxy.ts` exige token en todo `/api/*` salvo la lista pública documentada.

> Hallazgo de seguridad lateral: se conserva fuera del repositorio. Lo aplicable desde el front se resolvió en el paso 2.10 del PLAN; el resto está pendiente de endurecer en el API (NP-01 y NP-32).

### 7. Lighthouse 12.8.2 (Chrome headless=new)

Páginas elegidas: no existe ruta de vinos o tienda, así que se usaron `/promociones` y el carrito `/menu/pedido` como equivalentes. El detalle de producto se probó con `/menu/producto/1` y la categoría con `/menu/categoria/entradas`.

| Página | Modo | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` inicio | móvil | **47** | 90 | 96 | 100 | 4,3 s | **0,113** | **1 850 ms** |
| `/` inicio | escritorio | 91 | 90 | 96 | 100 | 1,3 s | 0,084 | 80 ms |
| `/menu` carta | móvil | 74 | 92 | 96 | 100 | 4,1 s | 0 | 490 ms |
| `/menu` carta | escritorio | 97 | 92 | 96 | 100 | 1,0 s | 0,006 | 20 ms |
| `/menu/categoria/entradas` | móvil | 64 | 92 | 96 | 100 | 4,5 s | 0 | 590 ms |
| `/menu/categoria/entradas` | escritorio | 98 | 92 | 96 | 100 | 0,9 s | 0,001 | 0 ms |
| `/menu/producto/1` detalle | móvil | 68 | 92 | 96 | 100 | 4,2 s | 0 | 560 ms |
| `/menu/producto/1` detalle | escritorio | 96 | 92 | 96 | 100 | 1,0 s | 0,084 | 20 ms |
| `/menu/pedido` carrito | móvil | 67 | 90 | 96 | 100 | 4,4 s | 0 | 490 ms |
| `/menu/pedido` carrito | escritorio | 92 | 90 | 96 | 100 | 1,0 s | **0,14** | 0 ms |
| `/reservations` reservas | móvil | 65 | 92 | 96 | 100 | 4,4 s | 0 | 550 ms |
| `/reservations` reservas | escritorio | 94 | 92 | 96 | 100 | 0,9 s | **0,116** | 0 ms |
| `/promociones` | móvil | 68 | 90 | 96 | 100 | 3,0 s | **0,122** | 770 ms |
| `/promociones` | escritorio | 96 | 90 | 96 | 100 | 0,9 s | 0,078 | 30 ms |
| `/login` | móvil | 54 | 92 | 96 | 100 | 4,6 s | 0 | **1 510 ms** |
| `/login` | escritorio | 96 | 92 | 96 | 100 | 1,1 s | 0,004 | 60 ms |

Patrones comunes (todas las páginas):
- **Rendimiento móvil**: 47–74. LCP > 4 s en casi todas, TTI 4,4–6,1 s y bootup JS de hasta 4,1 s en el inicio.
- **JavaScript**: "unused-javascript" con ~46 KiB de ahorro estimado, "legacy-javascript" con 13 KiB y recursos que bloquean el render.
- **Accesibilidad**:
  - `color-contrast`: 4–7 nodos por página (badge del hero, `a.btn-primary` hacia `/menu`, enlaces del footer `/condiciones` y `/privacidad`).
  - **`link-name` (2)**: los iconos de Facebook e Instagram del footer no tienen texto accesible.
  - `heading-order` en `/`, `/menu/pedido` y `/promociones`.
  - `label-content-name-mismatch` en el detalle de producto.
- **Imágenes**: `unsized-images` (2), por los `<img>` de logo sin `width`/`height` en Navbar y Footer; esto contribuye al CLS. `image-aspect-ratio` e `image-size-responsive` no dieron fallos.
- **Best Practices 96** en todas, penalizado por `errors-in-console`.
- **Otros**: `bf-cache` falla en categoría y producto. "inspector-issues" vino vacío en todas las páginas.
- El LCP de categoría y producto es el **mensaje de error en rojo** (`<p class="text-red-500">`), porque el backend no estaba disponible (ver limitaciones).

### 8. Errores y advertencias de consola por página (Lighthouse `errors-in-console`)

**Comunes a todas las páginas auditadas:**
- `401 /api/auth/me`: se llama **2–3 veces por carga** sin sesión. Es esperado sin login, pero las llamadas están duplicadas y ensucian la consola.
- **`404 https://res.cloudinary.com/dcb1tspbj/.../logo_text_white_ktnpgg.png`**: es un **recurso roto real** (verificado con curl → 404). Está fijado en `features/shared/data/restaurantData.ts:319`.
- **`404 /logo.svg`**: **imagen rota real**. `components/Navbar.tsx:259` usa `defaultLogo = "/logo.svg"`, pero `public/` solo contiene `icons/` y `sw.js`.
- `404 /footer`: `components/landing/Footer.tsx:34` usa `useFetch("/footer")` con `API_BASE = NEXT_PUBLIC_API_URL || ""`. Sin la variable, la petición va al propio Next.
- `-1` (abortada o cancelada) `.../logo_light_xy8ce1.svg`: el recurso existe (curl 200), así que la cancelación se debe probablemente a un cambio de `src` o de tema durante la carga.

**Específicos por página:**

| Página | Mensajes adicionales |
|---|---|
| `/` | `404 /settings`, `404 /categories`, `404 /promotions` (rutas relativas por falta de `NEXT_PUBLIC_API_URL`) |
| `/menu` | `console.error "Error en Fetch Menu: Error al cargar los datos del servidor"` · `500 /api/menu/categories` (el proxy interno no llega al backend `localhost:10000`) · en escritorio también `Error al registrar el service worker: AbortError` (intermitente) |
| `/menu/categoria/entradas` | `console.error "Error cargando categoría: TypeError: Failed to fetch"` · `ERR_CONNECTION_REFUSED http://localhost:10000/menu/categories/with-products` (*fallback* fijado en el código) |
| `/menu/producto/1` | **`404 /menu/producto/undefined/menu/items/1`**: `app/menu/producto/[id]/page.tsx:63-64` construye `` `${process.env.NEXT_PUBLIC_API_URL}/menu/items/${id}` `` sin *fallback*, y sin la variable se genera la URL relativa `undefined/...`. Además aparece `console.error "Error capturado en el Front: Error: NEXT_HTTP_ERROR_FALLBACK;404"`: el logger de errores registra el `notFound()` de Next como si fuera un error. |
| `/menu/pedido` | solo los comunes (401 ×3) |
| `/reservations` | `ERR_CONNECTION_REFUSED http://localhost:10000/reservations/availability?...` |
| `/promociones` | `404 /api/promociones`: la página hace `fetch(`${API}/promociones`)` y **no existe la ruta `app/api/promociones`**. Sin `NEXT_PUBLIC_API_URL` acaba en una ruta inexistente. |
| `/login` | en escritorio, **404 en `res.cloudinary.com/placeholder/.../food-3955317_1280_zstvf7.jpg`** (×3, w_1920/w_3840): imagen de fondo servida con `next-cloudinary` vía `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, que aquí era ficticio. Con el cloud real debería cargar. |

**Páginas no auditadas con Lighthouse:** se comprobaron solo por código HTTP (todas 200; ver §6). No se capturó su consola.

### 9. Peticiones fallidas e imágenes rotas (resumen)

| Recurso | Estado | ¿Depende del entorno? |
|---|---|---|
| `/logo.svg` (Navbar) | 404 | **No: falta el archivo en `public/`** |
| `res.cloudinary.com/dcb1tspbj/.../logo_text_white_ktnpgg.png` | 404 | **No: el recurso no existe en Cloudinary** |
| `/api/promociones` | 404 | Parcial: no existe la ruta interna; solo funcionaría con `NEXT_PUBLIC_API_URL` apuntando al backend |
| `/menu/producto/undefined/menu/items/1` | 404 | Sí, pero revela que no hay *fallback* (14 usos de `NEXT_PUBLIC_API_URL` sin valor por defecto) |
| `/footer`, `/settings`, `/categories`, `/promotions` | 404 | Sí (backend externo no configurado) |
| `localhost:10000/...` | conexión rechazada | Sí (backend externo no levantado) |
| `/api/menu/categories`, `/api/settings`, etc. | 500 | Sí (BD ficticia), pero exponen el SQL en el cuerpo de la respuesta |
| `/api/auth/me` | 401 | Esperado sin sesión; llamadas duplicadas |
| Imagen de login en `res.cloudinary.com/placeholder/...` | 404 | Sí (cloud name ficticio) |

### 10. Limitaciones

1. **No hay `.env`**: el build "tal cual" falla. Para medir se construyó y arrancó con valores ficticios (solo en el entorno del proceso) para `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET` y `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. `NEXT_PUBLIC_API_URL` se dejó sin definir. Por eso **no hay BD ni backend**: carta, categoría, producto y reservas se auditaron en su **estado de error o vacío**. Las métricas de rendimiento (en especial LCP y CLS) pueden cambiar con datos reales, y varios 404/500 son artefactos del entorno (marcados en §9).
2. **Rutas admin y de rol**: no se auditaron con Lighthouse porque sin sesión redirigen (307) a `/login?callbackUrl=...`. No se generó sesión porque no hay BD ni credenciales.
3. **Rendimiento móvil**: Lighthouse avisó en las ejecuciones móviles de que "the tested device appears to have a slower CPU than Lighthouse expects". Todas las ejecuciones avisaron también de "page loaded too slowly to finish within the time limit" (probablemente por las peticiones al backend que nunca responden), así que los resultados pueden estar incompletos. Es una sola ejecución por combinación (sin mediana) en un servidor local sin CDN ni compresión de borde.
4. **Disco C: lleno** (≈120 MB libres): 3 ejecuciones (`/` móvil y escritorio, `/menu` móvil) fallaron con `ENOSPC`. Se repitieron con éxito tras borrar la instalación temporal de ESLint del scratchpad. Conviene liberar espacio antes de repetir mediciones.
5. **Lint**: los números de §2 provienen de una configuración estándar `eslint-config-next` aplicada desde fuera, no de una configuración del proyecto (que no existe).
6. **Sin "First Load JS"** por ruta: Next 16 ya no lo muestra en el build. Se usó el peso total de Lighthouse como aproximación.
7. **Consola**: solo se capturó en las 8 páginas auditadas (no se usó Playwright, por indicación). Edge no estaba instalado, así que solo se usó Chrome.

Artefactos: informes JSON de Lighthouse y `summary.json` en (artefacto local no versionado). Salida de lint en `.../scratchpad/lint.json`. Logs de build en `.../scratchpad/build.txt`, `build2.txt` y `build3.txt`.
