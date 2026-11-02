# Plan del rediseño — El Quijote

> **Fuentes:** diagnóstico en `docs/rediseno/ESTADO.md` · sistema de diseño en `DESIGN.md` · producto en `PRODUCT.md` · fuera de alcance en `docs/rediseno/NOTAS-PENDIENTES.md` · detalle de los pasos completados en `docs/rediseno/BITACORA.md`.
>
> **Alcance:** solo UI, UX y seguridad aplicable desde la interfaz o la configuración del front. No se cambian la lógica de negocio, las URL de las rutas, el contenido, los contratos con la API ni el backend. Lo que aparezca fuera de alcance se anota en NOTAS-PENDIENTES; no se ejecuta.

---

## ESTADO ACTUAL Y SIGUIENTE PASO

| Campo | Valor |
|---|---|
| Etapa | **Fase 2 en curso** (2026-11-02), sin supervisión por orden del usuario. Fases 0, 1 y 3 cerradas. |
| Rama activa | `feature/rediseno-web-seguridad` (sale de `feature/rediseno-web-componentes`, `2098fa0`, que contiene las fases 1 y 3) |
| Último paso completado | **2.16 · Variables públicas validadas en el build** (2026-11-02). Detalle en [`BITACORA.md`](BITACORA.md). |
| Bloqueo | Ninguno. **2.5 (aplicar la CSP) no se ejecuta**: pendiente de la aprobación del usuario (pago con Stripe sin claves ni backend). |
| Siguiente paso | 2.17 · Límites de error que no filtran trazas. |
| Notas | **Órdenes vigentes del usuario (2026-11-02):** fase 2 del 2.1 al 2.18 en orden y sin añadir nada fuera del PLAN (lo demás va a NOTAS-PENDIENTES); 2.3 solo en modo informe y 2.4 corrige sus violaciones; **no ejecutar 2.5**; en 2.1, si el build o las pruebas fallan tras dos intentos, volver atrás y marcarlo como bloqueado; un paso que falle dos veces se descarta con `git restore` y se marca como bloqueado; sin push, sin `.env`, sin backend, sin dependencias fuera del PLAN, sin Lighthouse ni scripts de rendimiento; al cerrar la fase, no empezar la 4. Decisiones anteriores y lecciones de entorno: [`BITACORA.md`](BITACORA.md). |

> Este bloque se actualiza **en el mismo commit** que cierra cada paso.

---

## Decisiones (resueltas por el usuario el 2026-10-31)

| ID | Decisión | Resolución | Pasos |
|---|---|---|---|
| D-01 | Actualizar Next 16.0.7 (avisos críticos de RCE y bypass del proxy) a la última 16.x parcheada, junto con React y `eslint-config-next` | **Aprobada** | 2.1 |
| D-02 | CSP **con nonce** generado en `proxy.ts`; todas las páginas pasan a renderizarse de forma dinámica. Durante la transición, `style-src-attr 'unsafe-inline'` hasta eliminar los estilos en línea. | **Aprobada** | 2.3–2.5 |
| D-03 | El JWT en `localStorage` y la cookie escrita por JS se mantienen **como excepción hasta que el backend emita una cookie HttpOnly** (NP-04). **Condición:** eliminar todo `dangerouslySetInnerHTML` o sanearlo con una librería justificada (ver paso 2.12). | **Aprobada con condición** | 0.6, 2.12, 2.15 |
| D-04 | Retirar las dependencias sin uso en el front, **una por commit**, con build y pruebas tras cada una. No se tocan `pg`, `drizzle-orm`, `bcrypt`, `firebase-admin` ni `googleapis`, que usan los route handlers (NP-01). | **Aprobada** | 1.10.1–1.10.8 |
| D-05 | Añadir **zod** como única librería de validación del front | **Aprobada** | 3.1 |
| D-06 | Sustitución de `xlsx@0.18.5` | **Pasa a NOTAS-PENDIENTES** (NP-31); no se ejecuta en el rediseño | — |
| D-07 | Logo como SVG local con `currentColor` | **Aprobada** | 1.8 |
| D-08 | Conservar `/about` y `/promociones` funcionando, con migas de pan; la navegación usa anclas | **Aprobada** | 4.21 |
| D-09 | «Acceso del personal» como enlace discreto en el pie hacia `/login` | **Aprobada** | 3.11 |
| D-10 | Catálogo de componentes solo en desarrollo, **verificando que no entra al build de producción** (ver paso 3.0) | **Aprobada con verificación** | 3.0 |
| D-11 | Service worker limitado a estáticos | **Rechazada: sin service worker.** Se elimina `public/sw.js` y su registro, y se desregistran los que ya estén instalados (paso 2.7). | 2.7 |
| D-12 | Ajustes del admin: quitar la sección de colores y fuentes. Los campos de claves de pago solo se retiran si no se usan para nada real. **Comprobado el 2026-10-31:** `GatewayModal` usa inputs no controlados cuyo valor nunca se lee ni se envía, con datos de `settingsMock`, así que **se retiran**. | **Aprobada (verificada)** | 5.14 |
| D-13 | Insignia «Datos de ejemplo» en las cifras que vienen de mocks | **Aprobada** | 5.x |
| D-14 | Referencias de nivel de acabado: The Macallan, TimeSpirit Dining Experience, y Restaurant Fontané. Se usan como **listón de acabado**, guiándose por «Bodega de guarda» (ver DESIGN.md §Overview). | **Resuelta** | 4.x |
| D-15 | **Exigir un token válido en todo `/api/*`**, salvo una lista explícita y documentada de rutas públicas (`config/seguridad/rutas-api-publicas.ts`), y verificar que el login y la parte pública siguen funcionando. La autorización fina (rol y propietario) va a NOTAS-PENDIENTES (NP-32). | **Aprobada** | 2.10 |
| D-16 | MCP de Cloudinary autorizado. **Verificación solo lectura hecha en esta etapa** (ESTADO §8.1); no se volverá a usar en las fases de implementación. | **Hecha** | 0.8 ✔ |

---

## Reglas de ejecución

1. **Ramas.** Cada fase se trabaja en `feature/rediseno-web-<fase>`, creada desde `feature/rediseno-web` actualizada. Al terminar la fase se abre un PR hacia `feature/rediseno-web`; al final, un PR de `feature/rediseno-web` hacia `developer`.

   | Fase | Rama |
   |---|---|
   | 0 Línea base y herramientas | `feature/rediseno-web-base` |
   | 1 Cimientos y tokens | `feature/rediseno-web-cimientos` |
   | 2 Cabeceras y seguridad del front | `feature/rediseno-web-seguridad` |
   | 3 Componentes reutilizables | `feature/rediseno-web-componentes` |
   | 4 Páginas públicas | `feature/rediseno-web-publico` |
   | 5 Administración | `feature/rediseno-web-admin` |
   | 6 Pulido de movimiento | `feature/rediseno-web-pulido` |
   | 7 Auditoría final | `feature/rediseno-web-auditoria` |

2. **Un paso equivale a un commit.** Cada paso termina completo y verificado, en su propio commit, con el formato `tipo(alcance): descripción` en español (`feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `style`, `perf`), y en ese mismo commit actualiza el bloque «ESTADO ACTUAL Y SIGUIENTE PASO», que se mantiene compacto (una línea por campo), y añade arriba en `docs/rediseno/BITACORA.md` la entrada con el detalle del paso. Si un paso no cabe en la sesión, **no se empieza**; si se empieza y no se puede cerrar, se descarta con `git restore` sobre las rutas tocadas y se anota en el bloque de estado.
3. **`git add` solo con rutas concretas.** Nunca `git add .`, `-A` ni carpetas enteras; nunca `.claude`, `.agent`, `.dsh`, `.gemini` ni `.impeccable/config.local.json`. Antes de cada commit, revisar con `git status --short` y `git diff --cached --stat`.
4. **Secretos.** Nunca imprimir valores de variables de entorno ni claves (ni en la terminal, ni en documentos, ni en commits). El `.env.local` de desarrollo lo crea el usuario.
5. **Definición de terminado** (se aplica a todos los pasos, además de su criterio propio):
   - `pnpm typecheck`: 0 errores.
   - `pnpm lint`: 0 errores en los archivos tocados; el total global nunca aumenta.
   - `pnpm build`: termina sin errores.
   - `pnpm test:e2e --project=chromium` en las rutas afectadas: verde, con 0 errores o advertencias de consola nuevos, 0 peticiones fallidas nuevas y 0 imágenes rotas.
   - Revisión visual de las rutas afectadas en 360, 390, 768, 1024 y 1440 px, en tema oscuro y claro, y con texto al 125 %. Las capturas de Playwright van a `test-results/` (ignorado por git).
   - La skill **impeccable** se usa en cada paso de UI, y los hallazgos de su hook de diseño se resuelven o se justifican en el mensaje del commit.
   - Las skills `vercel-react-best-practices` y `web-design-guidelines` se aplican como lista de comprobación en los pasos de componentes y páginas.
   - **Solo al cerrar cada fase** (no en cada paso): `pnpm revisar:invisibles` sin hallazgos. Revisa los archivos versionados y los nuevos no ignorados de `app`, `components`, `lib`, `features`, `hooks`, `config`, `tests` y `styles`, y falla ante controles bidireccionales, caracteres de ancho cero o un BOM fuera del inicio. Si una cadena necesita uno de ellos, se escribe como escape.
6. **Sin regresiones de contenido ni de lógica.** Los textos, los endpoints, los payloads y las URL de ruta no cambian. Si un paso lo necesitara, se detiene y se anota en NOTAS-PENDIENTES.

### ¿Reestructurar carpetas? Decisión y forma de comprobarlo

**Sí, de forma incremental y sin tocar las URL:**

- Se crean `components/ui/` (primitivas), `components/marca/` (identidad), `lib/validacion/`, `lib/seguridad/`, `lib/sesion/` y `styles/` (tokens y componentes).
- Se borra el código muerto en lotes.
- `features/` se mantiene por dominio.
- `app/api` y `lib/db` no se mueven: son backend (NP-01).
- Los grupos de rutas nuevos (`(dev)`, layouts de segmento) no cambian ninguna URL.

**Cómo comprobar que no se rompe nada (en cada paso de borrado o movimiento):**

1. `pnpm build` y comparar la **tabla de rutas** con la línea base guardada en el paso 0.7 (`test-results/linea-base/rutas.txt`). Debe ser idéntica.
2. `pnpm typecheck` y `pnpm lint` (ningún import roto).
3. Prueba de **regresión visual** (`toHaveScreenshot`) de las páginas afectadas contra la línea base del paso 0.7. En los pasos de borrado o movimiento, la diferencia debe ser 0; en los de rediseño, la diferencia es esperada y se revisa a mano.
4. Recorrido E2E completo: 0 errores de consola nuevos y 0 peticiones fallidas nuevas.
5. Búsqueda de referencias huérfanas: `rg "<nombre del archivo borrado>"` sin resultados.

---

## Fase 0 · Línea base y herramientas — `feature/rediseno-web-base`

- [x] **0.1 · Gestor de paquetes y scripts de verificación**
  - **Archivos:** `package.json`.
  - **Hacer:**
    - Fijar `"packageManager": "pnpm@9.15.9"` (corepack).
    - Añadir los scripts `typecheck` (`tsc --noEmit`), `test:e2e` (`playwright test`) y `test:e2e:ui`.
  - **Aceptación:** `pnpm typecheck` da 0 errores; `corepack pnpm -v` funciona.
  - **Commit:** `chore(herramientas): fijar pnpm y añadir scripts de verificación`

- [x] **0.2 · ESLint con el preset de Next**
  - **Archivos:** `package.json` (devDependencies `eslint` y `eslint-config-next` de la misma versión que Next), `eslint.config.mjs`.
  - **Hacer:**
    - Configuración plana `core-web-vitals` + `typescript`.
    - Ignorar `.next`, `node_modules`, `.claude`, `.agent`, `.dsh`, `.gemini` y `.impeccable`.
    - Anotar el recuento base (≈233 errores y 135 avisos) en el bloque de estado.
  - **Aceptación:** `pnpm lint` se ejecuta y el recuento coincide con la línea base ±5 %.
  - **Commit:** `chore(lint): configurar ESLint con el preset de Next`

- [x] **0.3 · Plantilla de variables públicas**
  - **Archivos:** `.env.example`.
  - **Hacer:** listar **solo nombres** con un comentario de su propósito:
    - **Públicas:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
    - **De servidor existentes** (marcadas «pendiente de retirar, NP-01/NP-02/NP-10»): `JWT_SECRET`, `DATABASE_URL`, `GOOGLE_*`.
    - **De pruebas:** `E2E_JWT_SECRET`.
  - **Aceptación:** el archivo no contiene valores; `git check-ignore .env.local` confirma que sigue ignorado.
  - **Commit:** `docs(entorno): añadir .env.example sin valores`

- [x] **0.4 · Playwright como dependencia de desarrollo**
  - **Archivos:** `package.json` (`@playwright/test` y `@axe-core/playwright` en devDependencies), `playwright.config.ts`, `.gitignore` (`test-results/`, `playwright-report/`, `playwright/.auth/`, `tests/e2e/.cache/`).
  - **Justificación:** con una sola herramienta se cubren:
    - los motores **Chromium, Firefox y WebKit** (el de Safari en iOS), con emulación de iPhone y Pixel;
    - anchos de viewport, captura de consola y de peticiones fallidas;
    - inspección de `localStorage`, `sessionStorage`, IndexedDB y Cache Storage desde el navegador real;
    - cabeceras de respuesta, capturas y comparación visual;
    - auditoría de accesibilidad con axe.

    Es solo de desarrollo: no añade peso al bundle ni se despliega.
  - **Hacer:**
    - Proyectos `chromium` (escritorio), `firefox`, `webkit`, `movil-ios` (iPhone 13, WebKit), `movil-android` (Pixel 7, Chromium) y `edge` (`channel: "msedge"`, opcional en local).
    - `webServer` con `pnpm build && pnpm start -p 3100`.
    - Navegadores en `D:` (`PLAYWRIGHT_BROWSERS_PATH=D:\playwright-browsers`, documentado en el README de pruebas).
  - **Aceptación:** `pnpm exec playwright install chromium firefox webkit` termina sin problemas de espacio; una prueba vacía pasa en los cinco proyectos.
  - **Commit:** `test(e2e): instalar Playwright y configurar navegadores y dispositivos`

- [x] **0.5 · Recorrido de páginas**
  - **Archivos:** `tests/e2e/rutas.ts` (lista de rutas públicas y de panel), `tests/e2e/utilidades/vigilantes.ts`, `tests/e2e/recorrido.spec.ts`.
  - **Hacer:** para cada ruta y cada ancho (360, 390, 768, 1024 y 1440):
    - recoger `console` (`error` y `warning`), `pageerror`, `requestfailed` y respuestas ≥ 400;
    - detectar imágenes rotas (`img.complete && naturalWidth === 0`) y desbordamiento horizontal (`scrollWidth > clientWidth`);
    - capturar violaciones de CSP (evento `securitypolicyviolation`);
    - hacer una captura de página completa.

    Una lista de **excepciones temporales** (`tests/e2e/excepciones.ts`) recoge cada error conocido con el ID del paso o de la NP que lo resuelve. La lista solo puede decrecer.
  - **Aceptación:** la prueba pasa con las excepciones actuales documentadas, y cada excepción tiene referencia.
  - **Commit:** `test(e2e): recorrer páginas en cinco anchos vigilando consola, red e imágenes`

- [x] **0.6 · Almacenamiento, caché y cabeceras**
  - **Archivos:** `tests/e2e/almacenamiento.spec.ts`, `tests/e2e/cabeceras.spec.ts`.
  - **Hacer:**
    - Tras recorrer las rutas (y un flujo con sesión simulada), comprobar que:
      - las claves de `localStorage` están dentro de `{ "elquijote:preferencias" }` más las excepciones conocidas (`authToken`, `user` y `num_mesa` → D-03 / NP-04 / NP-12; las claves de `dataService` → NP-12);
      - `sessionStorage` está vacío;
      - `indexedDB.databases()` está vacío;
      - Cache Storage (`caches.keys()`) está vacío y no hay ningún service worker registrado (`navigator.serviceWorker.getRegistrations()`). Hasta el paso 2.7 se marca `test.fail()`.
    - Comprobar que las rutas privadas (`/dashboard/**`, `/profile`, `/menu/pedido/**`, `/login`, `/register`) responden con un `Cache-Control` que incluye `no-store`. Hasta el paso 2.6 este test se marca `test.fail()`.
    - Comprobar que `X-Powered-By` no aparece (`test.fail()` hasta el paso 2.2).
  - **Aceptación:** las pruebas reflejan el estado actual; los `test.fail()` quedan enlazados a su paso.
  - **Commit:** `test(e2e): verificar almacenamiento del navegador, caché y cabeceras`

- [x] **0.7 · Sesión simulada y línea base visual**
  - **Archivos:**
    - `tests/e2e/global-setup.ts`: firma con `jose` un JWT **de pruebas**, con `E2E_JWT_SECRET` de un `.env.test.local` que no se versiona, para cada rol, y lo guarda en `playwright/.auth/` (ignorado, y se borra al terminar).
    - `tests/e2e/fixtures/api/*.json`: respuestas simuladas del API con `page.route`, para ver los paneles sin backend.
    - `tests/e2e/linea-base.spec.ts`.
  - **Hacer:** generar las capturas base de todas las rutas en los cinco anchos y la tabla de rutas del build (`test-results/linea-base/`), fuera del control de versiones.
  - **Aceptación:** existen las capturas base de las rutas públicas y de panel, y `rutas.txt`.
  - **Commit:** `test(e2e): sesión simulada por rol y línea base visual`

- [x] **0.8 · Verificación de imágenes en Cloudinary (solo lectura)** — *hecho el 2026-10-31, en la etapa de planificación*
  - **Hecho:** con el MCP de Cloudinary **solo se consultó**, sin borrar ni modificar nada:
    - inventario de las 73 imágenes y 5 carpetas;
    - existencia de cada `public_id` referenciado;
    - formato, dimensiones y peso;
    - revisión visual de la portada y de una muestra de la carta.

    El resultado está en `ESTADO.md` §8.1. Las fases de implementación **no** vuelven a usar el MCP.
  - **Commit:** incluido en `docs(rediseno): registrar decisiones y verificación de Cloudinary`

- [x] **0.9 · Medición reproducible de Lighthouse**
  - **Archivos:** `scripts/medir-lighthouse.mjs`.
  - **Hacer:** ejecutar Lighthouse con `npx` contra `next start`, en móvil y escritorio, con 3 ejecuciones por página y la mediana, sobre las páginas clave. Guardar los JSON en `test-results/lighthouse/` y mostrar un resumen en tabla.
  - **Aceptación:** reproduce la línea base de ESTADO.md §12 con una diferencia de ±5 puntos.
  - **Commit:** `chore(rendimiento): script reproducible de Lighthouse`

---

## Fase 1 · Cimientos y tokens — `feature/rediseno-web-cimientos`

- [x] **1.1 · Borrar código muerto (lote 1: CSS y archivos de respaldo)**
  - **Archivos:** `app/dashboard/admin/predictive/page copy.tsx`, `app/dashboard/admin/predictive/predictivo.css`, el bloque predictivo de `styles/globals.css` (líneas 300–826), `tailwind.config.js`, `middleware.ts.bk` (y su entrada en `tsconfig.json`).
  - **Aceptación:** tabla de rutas idéntica; diferencia visual 0 en todas las rutas; `rg "page copy|predictivo.css|middleware.ts.bk"` sin resultados.
  - **Commit:** `refactor(limpieza): eliminar copia de predictivo, CSS huérfano y respaldos`

- [x] **1.2 · Borrar código muerto (lote 2: componentes sin uso)**
  - **Archivos:**
    - Los componentes con 0 importaciones de `features/dashboard/admin/components` (lista del anexo A §4).
    - `components/layout/Sidebar.tsx`, `app/dashboard/ActiveSidebar.tsx`, `components/ThemeToggle.tsx`, `components/handlerEmailActions.tsx`.
    - `utils/supabase/*`, los hooks sin uso, `types/ui.ts`, `types/navigation.ts`, `inventoryMock`, `cocinaMock`.

    Se conservan `features/dashboard/cliente/*` (NP-19) e `IdleLogout` (NP-23).
  - **Aceptación:** la misma verificación que en 1.1, y además 0 importaciones rotas.
  - **Commit:** `refactor(limpieza): eliminar componentes, hooks y utilidades sin uso`

- [x] **1.3 · Un solo punto de entrada del store**
  - **Archivos:** los 9 imports de `@/store`, que pasan a `@/store/index`; se borra `store.ts`.
  - **Aceptación:** diferencia visual 0; `rg "from \"@/store\"$"` sin resultados.
  - **Commit:** `refactor(store): importar el store desde su carpeta y borrar el reexport`

- [x] **1.4 · Tokens de diseño y estilos base**
  - **Archivos:** `styles/tokens.css` (copia literal del bloque de DESIGN.md §Tokens), `styles/componentes.css` (clases explícitas), `styles/globals.css`.
  - **Hacer en `globals.css`:**
    - Importar los dos archivos anteriores.
    - Estilos base: `body` con `bg-fondo` y `text-texto-principal`; `:focus-visible` con `--color-foco`; `::selection`; `scroll-margin-top`; `min-height: 100dvh` con respaldo en `vh`; `-webkit-tap-highlight-color` intencionado; `touch-action: manipulation` en los controles; `text-size-adjust: 100%`.
    - **Alias temporales** de los tokens antiguos hacia los nuevos (`--color-brand: var(--color-acento)`, `--color-surface: var(--color-superficie)`, etc.), para que toda la app adopte la paleta sin romperse. Se eliminan en el paso 5.20.
    - Eliminar las utilidades reescritas a mano y añadir `@custom-variant dark` como red de seguridad.
  - **Aceptación:**
    - La app entera se ve con la paleta nueva en oscuro; ninguna pantalla queda ilegible (recorrido sin violaciones `color-contrast` nuevas de axe en las páginas públicas).
    - `rg "#e85d04" styles` sin resultados.
  - **Commit:** `feat(diseno): tokens semánticos, estilos base y alias temporales`

- [x] **1.5 · Fuentes con `next/font`**
  - **Archivos:** `app/fuentes.ts` (Fraunces y DM Sans, según DESIGN.md §Typography), `app/layout.tsx`.
  - **Hacer:**
    - Quitar los `<link>` y el `preconnect` a Google Fonts.
    - Aplicar las variables `--fuente-titulos` y `--fuente-texto` en `<html>`.
    - Hacer que los alias `font-display` y `font-body` apunten a las nuevas utilidades.
  - **Aceptación:**
    - 0 peticiones a `fonts.googleapis.com` y `fonts.gstatic.com` (lo comprueba el recorrido).
    - El cuerpo se renderiza en DM Sans y los títulos en Fraunces.
    - El CLS de la fuente es 0,00 en Lighthouse.
  - **Commit:** `feat(tipografia): autoalojar Fraunces y DM Sans con next/font`

- [x] **1.6 · Preferencias de accesibilidad sin parpadeo**
  - **Archivos:** `lib/preferencias/preferencias.ts` (lectura y escritura validadas de `elquijote:preferencias`, con versión), `components/marca/ScriptPreferencias.tsx` (script en línea mínimo en `<head>`, preparado para recibir el `nonce`), `components/providers/PreferenciasProvider.tsx`, `hooks/useTheme.ts` (pasa a leer del contexto).
  - **Hacer:**
    - Retirar la lógica de tema duplicada de `ConditionalNavbar.tsx` y el `ThemeProvider` vacío.
    - Migrar una sola vez la clave antigua `theme` y luego borrarla.
  - **Aceptación:**
    - Recargar en tema claro, texto grande o movimiento reducido no muestra parpadeo (captura a los 0 ms con Playwright y `page.addInitScript`).
    - `localStorage` solo gana `elquijote:preferencias`.
  - **Commit:** `feat(accesibilidad): preferencias de tema, texto y movimiento sin parpadeo`

- [x] **1.7 · Viewport y metadatos técnicos**
  - **Archivos:** `app/layout.tsx`, `app/manifest.ts`.
  - **Hacer:**
    - `viewport-fit=cover`, sin `maximum-scale` ni `user-scalable=no`.
    - `themeColor` por tema.
    - `color-scheme`.
    - `lang="es"` (ya está).
    - Colores del manifiesto con los tokens.

    Los textos de los metadatos no se cambian (NP-13).
  - **Aceptación:** el auditor de Lighthouse «viewport» pasa; la barra del navegador móvil toma el color del fondo.
  - **Commit:** `feat(meta): viewport con zonas seguras y color de tema por tema`

- [x] **1.8 · Logo y sello locales** — *D-07*
  - **Archivos:** `components/marca/Logo.tsx` (SVG optimizado del molino y el rótulo, `fill="currentColor"`, `role="img"`, `aria-label="El Quijote, restaurante"`), `components/marca/SelloCasa.tsx`, `app/icon.svg`, `app/apple-icon.png`, `app/layout.tsx` (sin icono remoto).
  - **Hacer:** optimizar los trazados del SVG (precisión de 1 decimal).
  - **Aceptación:**
    - Desaparecen los 404 de `logo_text_white_ktnpgg.png` y `/logo.svg`.
    - El logo cambia de color con el tema.
    - El SVG pesa menos de 6 KB.
  - **Commit:** `feat(marca): logo y sello locales con currentColor`

- [x] **1.9 · Imágenes: cargador de Cloudinary y lista de hosts**
  - **Archivos:**
    - `config/seguridad/hosts-permitidos.ts`: fuente única de los hosts de imagen, conexión y marco, que también usará la CSP.
    - `lib/imagen/cargador-cloudinary.ts`: transformación `f_auto,q_auto,c_limit,w_<ancho>` sobre `https://res.cloudinary.com/<nube>/image/upload/`.
    - `components/ui/Imagen.tsx`: `next/image` con `sizes` obligatorio, `alt` obligatorio (vacío solo si se marca como decorativa), respaldo local si falla y validación de la URL (solo `https` y hosts permitidos).
    - `next.config.js`, `components/SmartImage.tsx` (pasa a usar `Imagen`).
  - **Hacer en `next.config.js`:**
    - `images.remotePatterns` con **solo** `https://res.cloudinary.com/dcb1tspbj/image/upload/**` y los hosts que la verificación 0.8 confirme en datos reales.
    - Fuera `i.pravatar.cc`.
    - `dangerouslyAllowSVG: false` explícito.
    - `formats: ["image/avif", "image/webp"]`.
  - **Aceptación:**
    - Ninguna `<img>` sin `width`/`height` o `fill` + `sizes`.
    - Las imágenes de fondo del login y de la fachada muestran su respaldo, nunca una caja vacía.
    - 0 imágenes rotas en el recorrido.
  - **Commit:** `feat(imagenes): cargador de Cloudinary, hosts permitidos y respaldo seguro`

- [x] **1.10 · Retirar dependencias sin uso** — *D-04: una dependencia por commit*

  Cada subpaso:
  1. Comprueba que `rg "<paquete>" app components features hooks lib providers store utils` no devuelve resultados, o sustituye el último import antes de retirarlo.
  2. Ejecuta `pnpm remove <paquete>`.
  3. Pasa `pnpm typecheck`, `pnpm build` y `pnpm test:e2e --project=chromium`.
  4. Registra en el bloque de estado los avisos de `pnpm audit` antes y después.

  - [x] **1.10.1** `cloudinary-react` (antes, sustituir sus imports por `Imagen`) · Commit: `chore(dependencias): retirar cloudinary-react`
  - [x] **1.10.2** `cloudinary-core` · Commit: `chore(dependencias): retirar cloudinary-core`
  - [x] **1.10.3** `firebase` · Commit: `chore(dependencias): retirar firebase`
  - [x] **1.10.4** `@supabase/ssr` · Commit: `chore(dependencias): retirar @supabase/ssr`
  - [x] **1.10.5** `@supabase/supabase-js` · Commit: `chore(dependencias): retirar @supabase/supabase-js`
  - [x] **1.10.6** `@types/grecaptcha` · Commit: `chore(dependencias): retirar @types/grecaptcha`
  - [x] **1.10.7** `next-themes` (después del paso 1.6) · Commit: `chore(dependencias): retirar next-themes`
  - [x] **1.10.8** `autoprefixer` · Commit: `chore(dependencias): retirar autoprefixer`

---

## Fase 2 · Cabeceras y medidas de seguridad del front — `feature/rediseno-web-seguridad`

- [x] **2.1 · Actualizar Next** — *D-01* · *Hecho (2026-11-02): Next 16.4.3, React 19.2.9; 0 avisos de next. Críticos restantes por firebase-admin: NP-38.*
  - **Archivos:** `package.json`, `pnpm-lock.yaml` (`next`, `react`, `react-dom`, `eslint-config-next`).
  - **Aceptación:** `pnpm audit` sin avisos críticos de `next`; el recorrido, las pruebas y la tabla de rutas sin cambios.
  - **Commit:** `chore(dependencias): actualizar Next a la versión parcheada`

- [x] **2.2 · Cabeceras base y opciones de producción** · *Hecho (2026-11-02): config/seguridad/cabeceras.ts; sin X-Powered-By ni .map; Permissions-Policy, COOP, CORP y Origin-Agent-Cluster.*
  - **Archivos:** `next.config.js`.
  - **Hacer:**
    - `poweredByHeader: false` y `productionBrowserSourceMaps: false` (explícito).
    - Cabeceras para todas las rutas:
      - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (se mantiene)
      - `X-Content-Type-Options: nosniff`
      - `X-Frame-Options: DENY` (redundante con `frame-ancestors`, para navegadores antiguos)
      - `Referrer-Policy: strict-origin-when-cross-origin`
      - `Permissions-Policy: camera=(), microphone=(self), geolocation=(self), payment=(self "https://js.stripe.com"), usb=(), browsing-topics=()`
      - `Cross-Origin-Opener-Policy: same-origin-allow-popups` (para los popups 3DS de Stripe)
      - `Cross-Origin-Resource-Policy: same-site`
      - `Origin-Agent-Cluster: ?1`

    **No** se activa `Cross-Origin-Embedder-Policy`, porque rompería las imágenes de Cloudinary y Stripe.
  - **Aceptación:**
    - `cabeceras.spec.ts` verifica cada valor y la ausencia de `X-Powered-By`.
    - 0 archivos `.map` en `.next/static`.
    - La geolocalización (`DistanceToRestaurant`) y la búsqueda por voz (`VoiceSearch`) siguen funcionando.
  - **Commit:** `feat(seguridad): cabeceras base, sin X-Powered-By ni source maps`

- [x] **2.3 · CSP en modo informe, con nonce** — *D-02* · *Hecho (2026-11-02): CSP en modo informe con nonce (config/seguridad/csp.ts, proxy.ts, layout); páginas dinámicas; lista de violaciones en la BITÁCORA.*
  - **Archivos:** `proxy.ts` (genera el nonce por petición y fija `Content-Security-Policy-Report-Only` y `x-nonce`), `app/layout.tsx` (lee el nonce con `headers()` y lo pasa a `ScriptPreferencias`), `config/seguridad/csp.ts` (construye la política a partir de `hosts-permitidos.ts`).
  - **Política:**
    ```
    default-src 'self';
    script-src 'self' 'nonce-{n}' 'strict-dynamic' https://js.stripe.com;
    style-src 'self' 'nonce-{n}'; style-src-attr 'unsafe-inline';
    img-src 'self' data: blob: https://res.cloudinary.com [+ hosts de 0.8];
    font-src 'self';
    connect-src 'self' {NEXT_PUBLIC_API_URL} https://api.stripe.com https://api.cloudinary.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    worker-src 'none';
    manifest-src 'self';
    object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
    upgrade-insecure-requests
    ```
    Sin `unsafe-eval`; en desarrollo se añade solo porque Next lo exige.
  - **Aceptación:** el recorrido completo (incluidos el checkout con Stripe en modo de prueba y los paneles) registra la lista de violaciones; cada una se corrige en 2.4 o se justifica.
  - **Commit:** `feat(seguridad): CSP con nonce en modo informe`

- [x] **2.4 · Eliminar los scripts y estilos en línea que bloquearía la CSP** · *Hecho (2026-11-02): sin scripts ni <style> en línea; 0 violaciones en los cinco proyectos salvo /sw.js (2.7) y Unsplash del editor «Acerca de» (NP-36).*
  - **Archivos:** `app/offline/page.tsx` (sin `dangerouslySetInnerHTML`; la lógica pasa a un componente cliente) y los que señale el paso 2.3.
  - **Aceptación:** 0 violaciones de CSP en modo informe en el recorrido completo, con los cinco proyectos de Playwright.
  - **Commit:** `fix(seguridad): eliminar scripts en línea incompatibles con la CSP`

- [ ] **2.5 · Aplicar la CSP** · **PENDIENTE DE APROBACIÓN DEL USUARIO** (2026-11-02): no se ejecuta porque el pago con Stripe no se puede verificar sin claves ni backend. Qué falta, en la BITÁCORA («2.5 · pendiente»).
  - **Archivos:** `proxy.ts` (la cabecera pasa a `Content-Security-Policy`).
  - **Aceptación:** recorrido completo con 0 violaciones y 0 errores de consola nuevos; el checkout de Stripe completa un pago de prueba; el auditor «csp-xss» de Lighthouse sin avisos de severidad alta.
  - **Commit:** `feat(seguridad): aplicar la CSP estricta`

- [x] **2.6 · Política de caché** · *Hecho (2026-11-02): no-store en rutas privadas (también la redirección del proxy) y en 88 fetch del front; sin revalidate; force-dynamic en segmentos privados.*
  - **Archivos:** `next.config.js` (cabecera `Cache-Control: private, no-store, max-age=0` para `/dashboard/:path*`, `/profile`, `/menu/pedido/:path*`, `/login`, `/register`, `/reset`, `/frm_reset`), todos los `fetch` de datos (`cache: "no-store"`; se elimina `revalidate: 60` en `app/api/menu/categories/route.ts`), `export const dynamic = "force-dynamic"` en los segmentos privados.
  - **Hacer:**
    - Los estáticos versionados (`/_next/static/*`) conservan su caché inmutable estándar: no contienen datos y quitarla degradaría el rendimiento.
    - No se usa React Query ni SWR. Si en algún momento se necesitara caché de datos, se cifra con Web Crypto (AES-GCM, clave no extraíble en memoria, caducidad corta, borrado al cerrar sesión) y se justifica por escrito en DESIGN.md. Hoy **no** hace falta.
  - **Aceptación:** `cabeceras.spec.ts` sin `test.fail()` en `no-store`; `rg "revalidate" app lib features` solo muestra `0` o nada.
  - **Commit:** `feat(seguridad): no-store en datos y páginas privadas`

- [x] **2.7 · Sin service worker** — *D-11 rechazada: no habrá service worker* · *Hecho (2026-11-02): sin sw.js ni su registro; RetirarServiceWorker limpia instalaciones y cachés previas; prueba con un SW antiguo simulado.*
  - **Archivos:** se borran `public/sw.js` y `components/pwa/ServiceWorkerRegister.tsx` (y su uso en `app/layout.tsx`); en `next.config.js` se quita la regla de cabeceras de `/sw.js`.
  - **Hacer:**
    - Nuevo `components/pwa/RetirarServiceWorker.tsx`, una isla de cliente que no es un service worker. En cada carga desregistra las instalaciones existentes (`navigator.serviceWorker.getRegistrations()` → `unregister()`) y borra las cachés de la aplicación (`caches.keys()` → `caches.delete`). Se mantiene un tiempo para limpiar los navegadores que ya tenían el SW; su retirada queda en NP-34.
    - Se conserva la ruta `/offline` (no se cambian rutas), aunque ya no se sirve de forma automática.
    - `InstallPrompt` deja de mostrarse si el navegador no emite `beforeinstallprompt`, sin errores.
  - **Aceptación:**
    - `almacenamiento.spec.ts` confirma 0 registros de service worker y Cache Storage vacío, sin `test.fail()`.
    - Una prueba que registra a mano el SW antiguo y recarga la página comprueba que queda desregistrado y sin cachés.
    - 0 peticiones a `/sw.js`.
  - **Commit:** `feat(seguridad): eliminar el service worker y limpiar instalaciones previas`

- [x] **2.8 · Logger del cliente sin datos sensibles** · *Hecho (2026-11-02): lib/registro/registrar-error.ts (mensaje y digest; ignora notFound y redirect); sin console.log en el front; removeConsole en producción (no verificado con Turbopack). Backend: NP-40.*
  - **Archivos:** `lib/registro/registrar-error.ts`: registra solo el mensaje y el `digest`, ignora `notFound()` y `redirect()` de Next y nunca registra cuerpos de respuesta, tokens ni datos personales. Además, `next.config.js` (`compiler.removeConsole` en producción, excepto `error`).
  - **Aceptación:** `rg "console\.log" app components features hooks lib` sin resultados; la página de un producto inexistente no registra el `notFound()` como error.
  - **Commit:** `fix(registro): logger sin datos sensibles y sin console.log`

- [x] **2.9 · Secreto JWT: fallar cerrado** · *Hecho (2026-11-02): sin secretos de respaldo (lib/seguridad/secreto-jwt.ts); sin JWT_SECRET, las rutas protegidas redirigen a /login. Rotar el secreto que estaba en el código: NP-02.*
  - **Archivos:** `proxy.ts`, `lib/session.ts`.
  - **Hacer:** eliminar los valores de respaldo. Si falta `JWT_SECRET`, el proxy trata cualquier ruta protegida como no autenticada y el servidor registra un error de configuración, sin el valor. La rotación del secreto es NP-02.
  - **Aceptación:** `rg "fallback_|JWT_SECRET \|\|" proxy.ts lib` sin resultados; sin la variable, `/dashboard` redirige a `/login`.
  - **Commit:** `fix(seguridad): eliminar secretos de respaldo y fallar cerrado`

- [x] **2.10 · Protección de rutas en el proxy (guía de autenticación de Next)** — *D-15* · *Hecho (2026-11-02): token en todo /api salvo la lista documentada (401 JSON sin caché), rol admin en /api/admin y /api/backups (403), sesión en /profile y /menu/pedido; matriz rol × ruta 6×12.*
  - **Archivos:** `proxy.ts`, `config/seguridad/rutas-api-publicas.ts` (nuevo), `config/roles.config.ts`.
  - **Hacer:**
    - Comprobaciones **optimistas** en el proxy: leer la cookie `session` y verificar la firma y la caducidad con `jose`, sin consultar la BD.
    - **Páginas:** `/profile` y `/menu/pedido/**` exigen sesión; si no la hay, redirigen a `/login` con un `callbackUrl` relativo y validado.
    - **Todo `/api/*` exige un token válido**, salvo esta lista explícita, documentada con su motivo en `rutas-api-publicas.ts` y verificada en el inventario del 2026-10-31:

      | Ruta | Métodos | Motivo |
      |---|---|---|
      | `/api/auth/login` | POST | Iniciar sesión (aún no hay token) |
      | `/api/auth/register` | POST | Registro de clientes |
      | `/api/auth/logout` | POST | Cerrar sesión debe funcionar aunque el token haya caducado |
      | `/api/auth/me` | GET | Lo llama la parte pública para saber si hay sesión; ya responde 401 sin token |
      | `/api/menu/categories` | GET | Carta pública (`/menu`) |
      | `/api/cron/backups` | GET | **Excepción temporal:** el cron de Vercel no envía un token de usuario; bloquearla cortaría los respaldos. Su protección con `CRON_SECRET` es NP-10. |

      `/api/public/combos`, `/api/public/cupones` y `/api/mesas` **no se llaman desde el front**, así que pasan a exigir token.
    - Sin token o con un token inválido, la respuesta es `401` en JSON genérico (`{"error":"No autorizado"}`), con `Cache-Control: no-store`. Además, `/api/admin/**` y `/api/backups/**` exigen rol admin (`403`). La autorización por rol y por propietario del resto de endpoints es NP-32.
    - El `matcher` excluye `_next/static`, `_next/image`, `icons` e `icon.svg`.
  - **Aceptación:**
    - La prueba E2E de matriz rol × ruta (anónimo, cliente, cajero, mesero, cocina, admin) devuelve los códigos esperados.
    - Una prueba recorre cada ruta de `app/api` sin token y comprueba 401, excepto las de la lista.
    - **El login, el registro, la carta pública, la landing y el detalle de producto funcionan sin sesión, y con sesión de cliente funcionan el pedido y el perfil.**
  - **Commit:** `feat(seguridad): exigir token en /api salvo rutas públicas documentadas`

- [x] **2.11 · Capa de acceso a datos de sesión (DAL)** · *Hecho (2026-11-02): lib/sesion/dal.ts (server-only, cache, DTO { id, nombre, apellidos, rol }); layout y /dashboard lo usan; la barra lateral solo recibe nombre y apellido.*
  - **Archivos:** `lib/sesion/dal.ts` (`import "server-only"`; `verificarSesion = cache(async () => …)`, que devuelve un DTO mínimo `{ id, nombre, rol }`), `app/dashboard/layout.tsx` y los segmentos de servidor que muestran datos privados.
  - **Hacer:** según la guía de Next, la comprobación segura se hace cerca de los datos y no solo en el layout (los layouts no se vuelven a ejecutar al navegar). No se pasan objetos de usuario completos a componentes cliente.
  - **Aceptación:** el usuario del layout procede del DTO; `rg "server-only" lib/sesion` encuentra el import; ningún componente cliente recibe campos que no use.
  - **Commit:** `feat(seguridad): DAL de sesión con server-only y DTO mínimo`

- [x] **2.12 · Eliminar todo `dangerouslySetInnerHTML`** — *condición de D-03* · *Hecho (2026-11-02): lib/texto/texto-enriquecido.tsx con html-react-parser y lista blanca; Hero y AboutSection sin innerHTML; resaltado igual. AboutSection no se monta (comentada en la portada).*
  - **Archivos:** `lib/texto/texto-enriquecido.tsx`, `components/landing/Hero.tsx`, `components/landing/AboutSection.tsx`, `app/offline/page.tsx` (ya resuelto en 2.4), `package.json` (`html-react-parser`).
  - **Hacer:**
    - Los textos que llegan del API con marcado (`heroTitle`, `about.description`) se convierten en **elementos de React**, nunca en `innerHTML`, con la librería **`html-react-parser`**.
    - **Por qué esta librería:**
      - Parsea con `htmlparser2` en el servidor y con `DOMParser` en el cliente, sin `innerHTML`.
      - Su opción `replace` permite aplicar una **lista blanca**: `<br>`, `<em>`, `<strong>` y `<span>` (que pasa a `<em class="resaltado">`). Cualquier otra etiqueta se reduce a su texto, y **se descartan todos los atributos** (`on*`, `style`, `href`, `src`).
      - El texto resultante lo escapa React, así que no hay HTML ejecutable.
      - Es pequeña (≈7 KB gzip), está mantenida y es muy usada.
    - Se descarta DOMPurify porque exigiría seguir usando `dangerouslySetInnerHTML` (y `jsdom` en el servidor). Escribir un parser propio sería frágil.
  - **Aceptación:**
    - `rg dangerouslySetInnerHTML app components features` sin resultados.
    - Pruebas con cargas maliciosas en el título y la descripción simulados (`<img src=x onerror=alert(1)>`, `<script>`, `<a href="javascript:…">`, `<span onclick>`, `<svg onload>`): se muestran como texto o se descartan, sin ejecutar nada (0 diálogos y 0 errores de consola).
    - El resaltado actual del título se ve igual.
  - **Commit:** `fix(seguridad): convertir texto enriquecido a React con lista blanca`

- [x] **2.13 · URLs seguras** · *Hecho (2026-11-02): lib/seguridad/urls.ts; callbackUrl, enlaces externos y parámetros validados; autoExecute pide confirmación y qty entre 1 y 20.*
  - **Archivos:**
    - `lib/seguridad/urls.ts` con tres funciones:
      - `esRutaInternaSegura(ruta)`: empieza por `/`, no por `//` ni por `/\`, y sin esquema;
      - `urlExternaPermitida(url)`: solo `https:` y hosts de la lista;
      - `rutaConParametros(ruta, params)`, basada en `URLSearchParams`.
    - `app/(auth)/login/page.tsx` y `register/page.tsx` (`callbackUrl`, `action`, `cantidad`), `components/landing/AboutSection.tsx` (redes y mapa), `app/menu/pedido/checkout/exito/page.tsx` (`encodeURIComponent(ordenId)` y `window.open(url, "_blank", "noopener,noreferrer")`).
    - `app/menu/producto/[id]/page.tsx`: `autoExecute` **pide confirmación** con `Dialogo` antes de crear el pedido, y `qty` se limita a un entero entre 1 y 20. La llamada al API es la misma.
  - **Aceptación:**
    - `/login?callbackUrl=https://ejemplo.org` y `//ejemplo.org` acaban en `/`.
    - Un `href` con `javascript:` desde los datos no se pinta como enlace.
    - Abrir un enlace con `autoExecute` no crea ningún pedido sin el clic de confirmación.
  - **Commit:** `fix(seguridad): validar redirecciones, enlaces y parámetros`

- [x] **2.14 · Cierre de sesión único y limpieza de estado** · *Hecho (2026-11-02): lib/sesion/cerrar-sesion.ts y sesionCerrada (reinicia el store); sustituye las 5 implementaciones (también la del mesero); MenuCuenta y BarraSuperiorPanel ya ofrecen «Cerrar sesión».*
  - **Archivos:** `lib/sesion/cerrar-sesion.ts` y `store/slices/authSlice.ts` (acción `sesionCerrada`, que reinicia todo el estado del store). Sustituye las implementaciones de `ConditionalNavbar`, `Navbar`, `AdminSidebar` y `admin/reservations`. También se conecta a `MenuCuenta` de la cabecera nueva (3.11), que lo recibe como `alCerrarSesion` y hasta entonces no ofrece «Cerrar sesión».
  - **Hacer:**
    1. `POST /api/auth/logout`.
    2. Borrar `authToken`, `user` y `num_mesa`.
    3. Reiniciar Redux.
    4. Ejecutar `caches.delete` sobre cualquier caché que quede, como defensa: ya no hay service worker (D-11).
    5. `router.replace("/login")`.
  - **Aceptación:** tras cerrar sesión desde cada rol, `almacenamiento.spec.ts` confirma que no queda nada de la sesión y que el store está en su estado inicial; volver atrás no muestra datos privados.
  - **Commit:** `fix(sesion): cierre de sesión único que limpia todo el estado`

- [x] **2.15 · Datos personales fuera de `localStorage`** · *Hecho (2026-11-02): sin localStorage.user; usuario en el store; /api/auth/me una vez por carga (pedirSesion); el aviso de instalación ya no se guarda.*
  - **Archivos:** `app/(auth)/login/page.tsx`, `app/dashboard/{mesero,cocina,cajero}/page.tsx` y `providers/AuthProvider.tsx`. El usuario sale del store, hidratado con **una sola** llamada deduplicada a `/api/auth/me`, en lugar de 2 o 3 por carga; el aviso de instalación de la PWA ya no se persiste.
  - **Aceptación:**
    - `localStorage.user` ya no existe.
    - `/api/auth/me` se llama como máximo una vez por carga.
    - Las excepciones restantes (`authToken`, `num_mesa`, `dataService`) siguen enlazadas a D-03, NP-04 y NP-12.
  - **Commit:** `fix(privacidad): datos del usuario solo en memoria`

- [x] **2.16 · Validación de variables públicas en el build** · *Hecho (2026-11-02): lib/config/entorno-publico.ts desde next.config.ts (solo en el build); sin localhost:10000 en .next/static; falta la clave de Stripe en el entorno local (decisión del usuario).*
  - **Archivos:** `lib/config/entorno-publico.ts` (importado por `next.config.js`).
  - **Hacer:**
    - Exigir `NEXT_PUBLIC_API_URL` (`https:` en producción), `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (prefijo `pk_`).
    - Rechazar cualquier `NEXT_PUBLIC_*` cuyo nombre sugiera un secreto (`SECRET`, `PRIVATE`, `SERVICE_ROLE`, `PASSWORD`).
    - Eliminar el respaldo `localhost:10000` del bundle.

    No se corrigen URLs de endpoints (NP-17).
  - **Aceptación:**
    - El build sin las variables falla con un mensaje claro, sin imprimir valores.
    - `rg "localhost:10000" .next/static` sin resultados.
  - **Commit:** `feat(seguridad): validar variables públicas en el build`

- [ ] **2.17 · Límites de error que no filtran trazas**
  - **Archivos:** `app/global-error.tsx`, `app/error.tsx`, `error.tsx` y `not-found.tsx` en `app/(auth)`, `app/(public)`, `app/menu` y `app/dashboard`.
  - **Hacer:** mensaje genérico, botón Reintentar, enlace de salida, y solo el `digest` visible para soporte.
  - **Aceptación:** forzar un error en una página simulada muestra el límite sin pila ni mensaje interno; las pruebas comprueban que `pre` y `stack` no aparecen.
  - **Commit:** `feat(errores): límites de error por segmento sin trazas`

- [ ] **2.18 · Revisión del bundle**
  - **Archivos:** `scripts/revisar-bundle.mjs`.
  - **Hacer:** buscar en `.next/static` patrones de secretos (`sk_live_`, `sk_test_`, `-----BEGIN`, `service_role`, `postgres://`, `eyJhbGci`) y archivos `.map`. Informa solo del archivo y del número de coincidencias, nunca del valor. También elimina del bundle el marcador `sk_live_••••` de `settingsMock.tsx` (texto neutro).
  - **Aceptación:** el script devuelve 0 coincidencias y 0 `.map`.
  - **Commit:** `chore(seguridad): revisión automática del bundle`

- ~~**2.19 · Importación de hojas de cálculo segura**~~: *D-06 pasa a NOTAS-PENDIENTES (NP-31)*. El paso 5.9 sí valida tamaño, tipo y firma del archivo antes de entregarlo a `xlsx`.

---

## Fase 3 · Componentes reutilizables con todos sus estados — `feature/rediseno-web-componentes`

Cada paso crea el componente en `components/ui/` o `components/marca/` y lo muestra en el catálogo con **todos** sus estados, en los dos temas y con texto al 125 %. Una prueba de Playwright con axe (0 violaciones) y una captura por estado lo verifican. Los componentes todavía **no** se sustituyen en las páginas: eso se hace en las fases 4 y 5.

- [x] **3.0 · Catálogo de desarrollo** — *D-10, con verificación de que no entra al build de producción* · *Adelantado a la fase 1 por orden del usuario (2026-11-01). En `next.config.js` se usa la fase `PHASE_DEVELOPMENT_SERVER` en lugar de `NODE_ENV`, que es más fiable al cargar la configuración.*
  - **Archivos:** `app/(dev)/catalogo/page.dev.tsx`, `next.config.js`, `tests/e2e/catalogo.spec.ts`, `scripts/revisar-bundle.mjs`.
  - **Hacer:**
    - La página usa la extensión `.dev.tsx`. `next.config.js` solo la incluye en `pageExtensions` cuando `NODE_ENV === "development"`, así que en `next build` **la ruta no existe** y su código no se compila.
    - Como segunda barrera, la página llama a `notFound()` si `process.env.NODE_ENV === "production"`.
  - **Aceptación:**
    - La tabla de rutas de `pnpm build` no incluye `/catalogo`.
    - `scripts/revisar-bundle.mjs` comprueba que no hay `catalogo` ni nombres de demo del catálogo en `.next/server/app` ni en `.next/static`.
    - `/catalogo` da 404 en `next start` y funciona en `next dev`.
  - **Commit:** `test(ui): catálogo de componentes solo en desarrollo`

- [x] **3.1 · Validación con zod** — *D-05* · *Hecho (2026-11-01). Las reglas sin zod quedan en `lib/validacion/reglas.ts`, que `utils/validators.tsx` reexporta; las pruebas unitarias van en `tests/unidad/` con `pnpm test:unidad`.*
  - **Archivos:** `lib/validacion/{campos,formularios,archivos,saneamiento}.ts`.
  - **Hacer:**
    - **Esquemas** de correo, teléfono (+52, 10 dígitos), nombre, contraseña, RFC, CP, reserva, perfil, checkout y CRUD del admin, con **las mismas reglas que hoy**, alineadas con el API en HU-01. No se relajan sin acuerdo con el API (NP-06).
    - **Saneamiento:** `trim`, normalización NFC, eliminación de caracteres de control y límites de longitud.
    - **Archivos:** comprobación de tipo MIME, tamaño (imágenes ≤ 5 MB, hojas ≤ 2 MB) y **firma de bytes** (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF…WEBP`, AVIF `ftypavif`, XLSX `PK 03 04`).
    - **Mensajes** en español, genéricos en la autenticación («Correo o contraseña incorrectos»).
  - **Aceptación:** pruebas unitarias con Playwright (`test` sin navegador) de casos válidos e inválidos por esquema; un archivo `.exe` renombrado a `.png` se rechaza.
  - **Commit:** `feat(validacion): esquemas zod, saneamiento y verificación de archivos`

- [x] **3.2 · `Boton` y `BotonEnlace`** *(adelantado a la fase 1 por orden del usuario; retira el `components/ui/Button.tsx` huérfano y `types/ui.ts`)*: variantes, tamaños y los estados de DESIGN.md (incluido cargando con bloqueo de doble clic).
  - **Commit:** `feat(ui): Boton y BotonEnlace con todos sus estados`

- [x] **3.3 · Campos de formulario** · *Hecho (2026-11-01); pendiente de la revisión del usuario en el catálogo. Añade `MensajeError`, `AnuncioFormulario`, `revelable` en contraseñas y `leerFormulario`.*
  - **Componentes:** `Campo`, `AreaTexto`, `Selector`, `Casilla`, `Interruptor`, `CampoTrampa` (honeypot oculto a la vista y a lectores, con `tabIndex={-1}` y `autocomplete="off"`) y el hook `useEnvioFormulario`. El hook bloquea el envío doble, enfoca el primer error, anuncia los errores en la región `aria-live` y aplica un tiempo mínimo de rellenado contra bots.
  - **Aceptación:** `aria-invalid`, `aria-describedby`, `autocomplete` e `inputmode` presentes en el catálogo; navegación completa con teclado.
  - **Commit:** `feat(ui): campos accesibles, campo trampa y envío protegido`

- [x] **3.4 · `Tarjeta`, `Insignia`, `Aviso` y `Notificacion`** — *`Tarjeta` e `Insignia` adelantadas a la fase 1 por orden del usuario (commit `feat(ui): tarjeta e insignia con todos sus estados`); quedan `Aviso` y `Notificacion`.* · *Hecho (2026-11-01): Aviso, Notificacion (ProveedorNotificaciones y useNotificaciones) y VistaNotificacion.*
  - **Commit:** `feat(ui): tarjeta, insignia, aviso y notificaciones`

- [x] **3.5 · `Dialogo`, `PanelLateral` y `DialogoConfirmacion`** (Radix): sustituyen a `alert()` y `confirm()`. · *Hecho (2026-11-01). Incluye `useConfirmacion()`, que sustituye a `confirm()` como promesa, y el token `--velo-dialogo`.*
  - **Commit:** `feat(ui): diálogos y panel lateral accesibles`

- [x] **3.6 · `Tabla` responsiva, `Paginacion` y `Pestanas`**: la tabla pasa a tarjetas por debajo de 768 px; la URL refleja la pestaña y la página. · *Hecho (2026-11-01): Tabla (con RegionDesplazable), Paginacion y Pestanas, propias, sin dependencias.*
  - **Commit:** `feat(ui): tabla responsiva, paginación y pestañas`

- [x] **3.7 · `EstadoVacio`, `Esqueleto` y `EstadoError`** (con Reintentar). · *Hecho (2026-11-01): EstadoVacio, EstadoError, Esqueleto, EsqueletoLineas y ZonaCargando; Tabla usa Esqueleto.*
  - **Commit:** `feat(ui): estados vacío, de carga y de error`

- [x] **3.8 · `Indicador` y gráficas base** · *Hecho (2026-11-01): Indicador y GraficaBarras, GraficaLinea y GraficaDonut en SVG propio, con vista de tabla.*
  - **Componentes:** `Indicador` con los estados normal, cargando, error, sin comparación y datos de ejemplo. Gráficas SVG propias (barras, línea y donut) según la guía de visualización: paleta `--color-grafica-*`, tooltip, leyenda a partir de 2 series y vista de tabla. Recharts queda solo para las gráficas de dispersión y predicción, cargado con `next/dynamic`.
  - **Commit:** `feat(ui): indicador y gráficas con la paleta validada`

- [x] **3.9 · `EtiquetaSeccion`, `Contraetiqueta`, `SelloCasa` y `.filete-doble`** · *Hecho (2026-11-01): componentes EtiquetaSeccion y Contraetiqueta; contraetiqueta con filetes alineados y a dos columnas; Tabla la usa.*
  - **Commit:** `feat(marca): etiqueta de sección, contraetiqueta y sello`

- [x] **3.10 · `MigasDePan` y `BotonVolver`** · *Hecho (2026-11-01): mapa en config/navegacion-publica.ts, MigasDePan y BotonVolver (enlace al origen; historial si se viene del sitio).*
  - **Hacer:** mapa estático `ruta → sección de origen` en `config/navegacion-publica.ts`. El botón usa el historial si el referente es del mismo origen y, si no, vuelve al ancla de la sección.
  - **Commit:** `feat(navegacion): migas de pan y regreso a la sección de origen`

- [x] **3.11 · `CabeceraSitio` y `PieSitio`** — *D-09* · *Hecho (2026-11-01): CabeceraSitio (servidor, con islas) y PieSitio (servidor); cierre de sesión pendiente del 2.14 y variante sobre la portada en el 4.3.*
  - **Hacer:** componentes de servidor con islas de cliente para la cuenta, el menú móvil y la sección activa. En el pie, el enlace discreto «Acceso del personal». Los 7 SVG a mano de `ConditionalNavbar` se sustituyen por iconos Lucide.
  - **Commit:** `feat(marca): cabecera y pie del sitio`

- [x] **3.12 · `PanelAccesibilidad`**: tema, tamaño de texto y movimiento. *Adelantado en 1.6 en versión funcional (`components/accesibilidad/PanelAccesibilidad.tsx`, Popover de Radix, en `Navbar` y `AdminSidebar`); aquí queda el acabado: animación de apertura, acceso desde el pie y pruebas con lector de pantalla.* · *Hecho (2026-11-01): animación (.menu-flotante), acceso desde el pie y el menú móvil (conTexto), título y capa coherentes. Lectores de pantalla reales: no verificado (fase 7).*
  - **Commit:** `feat(accesibilidad): panel de opciones de accesibilidad`

- [x] **3.13 · `NavegacionPanel`, `BarraSuperiorPanel` y `EncabezadoPagina`**: entradas por rol desde `config/navigation/*`, `<Link>` con `aria-current` y drawer por debajo de 1024 px. · *Hecho (2026-11-01): navegación por rol (navegacionDeRol), barra superior con drawer y encabezado de página. Mesero sin navegación: NP-37.*
  - **Commit:** `feat(paneles): navegación por rol y encabezado de página`

- [x] **3.14 · `Buscador`**: `useDeferredValue` para los filtros locales y debounce de 300 ms con `AbortController` para las búsquedas que llamen al API. · *Hecho (2026-11-01): Buscador y hooks/useBusqueda.ts (useDeferredValue en local; 300 ms y AbortController en remoto).*
  - **Commit:** `feat(ui): buscador con debounce y cancelación`

---

## Fase 4 · Páginas públicas, una por una — `feature/rediseno-web-publico`

Cada paso conserva textos, endpoints y URL; sustituye los componentes antiguos por los del sistema y elimina los SVG a mano y los estilos en línea de esa página. **Criterio común:**

- recorrido sin excepciones nuevas;
- axe con 0 violaciones;
- objetivos táctiles de 44 px;
- teclado completo;
- capturas revisadas en los 5 anchos, en los dos temas y con texto al 125 %.

- [ ] **4.1 · Layout público.** Sustituir `ClientLayoutWrapper` (`ssr:false`) por `CabeceraSitio` y `PieSitio` renderizados en el servidor; añadir el enlace «Saltar al contenido» y el `<main id="contenido">`.
  - **Aceptación:** la navegación y el pie aparecen en el HTML del servidor.
  - **Commit:** `feat(publico): cabecera y pie renderizados en el servidor`

- [ ] **4.2 · Estructura de la landing.** Componente de servidor con las peticiones existentes en paralelo (`Promise.all`, `no-store`), anclas y resaltado de la sección activa. Retira los `console.log` y los handlers vacíos.
  - **Commit:** `feat(landing): estructura de una sola página con anclas`

- [ ] **4.3 · Portada (`#inicio`).** **Cabecera transparente sobre la portada** (aplazada del 3.11): texto claro en los dos temas y un velo superior propio (tokens nuevos en DESIGN.md), comprobado con axe sobre la imagen real. Fotografía a sangre con `priority` (en Next 16, `preload`; ver BITÁCORA 1.9), velo y titular de portada. **LCP:** la medición del cierre de la fase 1 lo subió de 4339 a 5194 ms (FCP y TBT bajaron): la imagen de portada debe precargarse, pedirse con el ancho ajustado a su hueco (`sizes` real) y no debe haber precargas innecesarias que compitan con ella. La imagen actual (`Gemini_Generated_Image_2mv3…`, 1584×672) muestra en la esquina inferior derecha la **marca de agua de Gemini**: se recorta **en la entrega** con una transformación (`c_crop,w_0.9,h_0.9,g_north_west`) sin modificar el recurso. Como mide 1584 px, se sirve con `sizes="100vw"` y un ancho máximo de 1584 para no ampliarla. Su sustitución es NP-33.
  - **Aceptación:** axe verifica el contraste sobre la imagen real; LCP en móvil < 2,5 s.
  - **Commit:** `feat(landing): portada`

- [ ] **4.4 · La casa (`#la-casa`).** Galería con `Imagen` y `sizes`; la fachada con respaldo.
  - **Commit:** `feat(landing): sección la casa`

- [ ] **4.5 · La carta (`#carta`).** Platos con `Contraetiqueta` y foto (sin emoji), y enlace a `/menu`.
  - **Commit:** `feat(landing): sección la carta`

- [ ] **4.6 · Promociones (`#promociones`).**
  - **Commit:** `feat(landing): sección promociones`

- [ ] **4.7 · Reservar (`#reservar`).** Banda con el sello y un `BotonEnlace` a `/reservations`. **Se retira el formulario simulado** de `ReservationSection`, que confirmaba sin llamar al API.
  - **Commit:** `feat(landing): sección reservar enlazada al flujo real`

- [ ] **4.8 · Pedir (`#pedir`).** Pedir en mesa o a domicilio, con enlaces a las páginas existentes.
  - **Commit:** `feat(landing): sección pedir`

- [ ] **4.9 · Visítanos (`#visitanos`).** Dirección, horario, mapa enlazado y redes con nombre accesible.
  - **Commit:** `feat(landing): sección visítanos`

- [ ] **4.10 · `/menu`**
  - **Commit:** `feat(carta): página de la carta`

- [ ] **4.11 · `/menu/categoria/[slug]`**
  - **Commit:** `feat(carta): página de categoría`

- [ ] **4.12 · `/menu/producto/[id]`.** Contraetiqueta del plato y confirmación de `autoExecute` (paso 2.13).
  - **Commit:** `feat(carta): detalle de plato`

- [ ] **4.13 · `/menu/pedido`**
  - **Commit:** `feat(pedido): carrito y pedido en mesa`

- [ ] **4.14 · `/menu/pedido/checkout`.** Etiquetas, `autocomplete` (`street-address`, `postal-code`), `inputmode` y la apariencia de Stripe Elements con los tokens del sistema.
  - **Commit:** `feat(pedido): checkout accesible`

- [ ] **4.15 · `/menu/pedido/checkout/exito`**
  - **Commit:** `feat(pedido): confirmación de pago`

- [ ] **4.16 · `/reservations`.** `ReservationSidebar` y `TableMap` con los campos y la validación del sistema. `useEnvioFormulario` con el campo trampa y el tiempo mínimo por defecto (1 s). El teléfono se queda como hoy; su validación es del servidor (NP-06).
  - **Commit:** `feat(reservas): página de reserva`

- [ ] **4.17 · `/login`.** Errores genéricos, `autocomplete` (`email`, `current-password`) y bloqueo del envío doble. `useEnvioFormulario` con `tiempoMinimoMs={0}`: con autorrelleno, una persona envía en menos de un segundo.
  - **Commit:** `feat(auth): inicio de sesión`

- [ ] **4.18 · `/register`.** Campo trampa (defensa principal), tiempo mínimo por defecto (1 s), bloqueo del envío doble y errores accesibles. En `next dev` a 1440 px, el fondo decorativo es el LCP y `next/image` avisa de que falta `loading="eager"` (BITÁCORA 3.1): decidir su carga (prioridad o tamaño) como en el 4.3.
  - **Commit:** `feat(auth): registro`

- [ ] **4.19 · `/reset` y `/frm_reset`.** Aviso traducido al español con una salida (contacto). La funcionalidad sigue en NP-16.
  - **Commit:** `feat(auth): páginas de recuperación con aviso en español`

- [ ] **4.20 · `/profile`**
  - **Commit:** `feat(cuenta): perfil del cliente`

- [ ] **4.21 · `/about` y `/promociones`** — *D-08*. Se conservan, con migas de pan.
  - **Commit:** `feat(publico): páginas informativas con migas de pan`

- [ ] **4.22 · Páginas legales.** Pasan a componentes de servidor con un layout de grupo, sin cambiar sus URL.
  - **Commit:** `feat(publico): páginas legales en servidor`

- [ ] **4.23 · Páginas de sistema:** `not-found`, `error`, `loading` (cargador con estilo), `forbidden`, `unauthorized`, `maintenance` y `offline`.
  - **Commit:** `feat(sistema): páginas de sistema con el nuevo diseño`

---

## Fase 5 · Administración, una por una — `feature/rediseno-web-admin`

**Criterio común:**

- primera fila con como mucho 4 indicadores, el primero como protagonista;
- estados de carga, vacío y error en cada bloque;
- insignia «Datos de ejemplo» donde haya mocks (*D-13*);
- tablas que pasan a tarjetas por debajo de 768 px;
- ningún `alert()` ni `confirm()`;
- ningún hex, `text-[Npx]` ni estilo en línea en la pantalla.

Las pruebas usan la API simulada del paso 0.7. Los endpoints no cambian.

- [ ] **5.1 · Layout de paneles.** `NavegacionPanel` por rol, drawer y barra superior con el cierre de sesión único. Se retira el margen calculado de `AdminSidebar`.
  - **Aceptación:** en 360 px el contenido ocupa todo el ancho; un mesero no ve las entradas de admin.
  - **Commit:** `feat(paneles): layout responsivo con navegación por rol`

- [ ] **5.2 · Inicio admin.** Ventas de hoy frente al mismo día de la semana anterior, cubiertos y ocupación, ticket medio, reservas de hoy y alertas accionables. El saludo usa el nombre del DTO; la ruta errónea del stock se muestra como error (NP-17).
  - **Commit:** `feat(admin): inicio con indicadores clave`

- [ ] **5.3 · Reportes**
  - **Commit:** `feat(admin): reportes con una cifra protagonista`

- [ ] **5.4 · Finanzas**
  - **Commit:** `feat(admin): finanzas`

- [ ] **5.5 · Facturas**
  - **Commit:** `feat(admin): facturas`

- [ ] **5.6 · Nómina**
  - **Commit:** `feat(admin): nómina`

- [ ] **5.7 · Inventario**
  - **Commit:** `feat(admin): inventario`

- [ ] **5.8 · Proveedores**
  - **Commit:** `feat(admin): proveedores`

- [ ] **5.9 · Carta (admin).** `ItemModal` valida tipo, tamaño y firma de la imagen antes de abrir la subida. La importación valida el archivo (paso 3.1: ≤ 2 MB, extensión, MIME y firma `PK 03 04` para XLSX) **antes** de pasarlo a `xlsx` (la actualización de la librería es NP-31).
  - **Commit:** `feat(admin): gestión de la carta con validación de archivos`

- [ ] **5.10 · Promociones (admin).** Validación de imagen y de que la fecha de inicio sea anterior a la de fin.
  - **Commit:** `feat(admin): promociones`

- [ ] **5.11 · Reservas (admin).** Toma como base su patrón de tabla a tarjetas.
  - **Commit:** `feat(admin): reservas`

- [ ] **5.12 · Predicción.** Recharts se carga con `next/dynamic`.
  - **Commit:** `feat(admin): predicción de demanda`

- [ ] **5.13 · Usuarios**
  - **Commit:** `feat(admin): usuarios`

- [ ] **5.14 · Ajustes** — *D-12*
  - **Hacer:** quitar la sección «Apariencia» (colores y fuentes) y `DesignSystemProvider`. En `GatewayModal`, retirar los campos «API Key» y «Secret Key»; según la verificación del 2026-10-31 son inputs no controlados que nunca se leen ni se envían. Se mantienen el estado (activo o inactivo) y el entorno, con una nota que remite la gestión de claves al backend (NP-09).
  - **Commit:** `feat(admin): ajustes sin apariencia ni claves secretas`

- [ ] **5.15 · Acerca de (admin)**
  - **Commit:** `feat(admin): acerca de`

- [ ] **5.16 · Rendimiento de BD.** Semáforo de salud con el detalle desplegable; responsivo y con tokens (NP-24).
  - **Commit:** `feat(admin): salud del sistema`

- [ ] **5.17 · Caja.** Pensada primero para tablet: cifras grandes y objetivos de 48 px.
  - **Commit:** `feat(caja): panel de caja`

- [ ] **5.18 · Mesero** (móvil)
  - **Commit:** `feat(mesero): panel de mesero`

- [ ] **5.19 · Cocina** (tablet o monitor, lectura a distancia)
  - **Commit:** `feat(cocina): panel de comandas`

- [ ] **5.20 · Retirar los alias y las clases heredadas**
  - **Inventario de lo temporal creado en 1.4** (todo en `styles/globals.css`). **Retirada prevista: paso 5.20, al cerrar la fase 5 (`feature/rediseno-web-admin`).** El PLAN no tiene calendario: la fecha se fija al abrir la fase 5. Nada de esto se usa en código nuevo.

    | Alias | Apunta a | Usos al crearlo |
    |---|---|---|
    | `--color-brand` (`bg-brand`, `text-brand`…) | `--color-acento` | 162 `bg-brand`, 188 `text-brand` |
    | `--color-brand-dark` | `--color-acento-intenso` | `.menu-card-add` |
    | `--color-surface` (`bg-surface`…) | `--color-superficie` | 525 `bg-surface` |
    | `--color-text` (`text-text`) | `--color-texto-principal` | 958 |
    | `--color-text-sec` (`text-text-sec`) | `--color-texto-secundario` | 225 |
    | `--color-text-muted` (`text-text-muted`) | `--color-texto-tenue` | 394 |
    | `--color-border` (`border-border`…) | `--color-borde-sutil` | 489 |
    | `--color-secondary` (`bg-secondary`…) | `--color-superficie-cafe` | 5 (`Footer`, `ConnectionStatus`, `Checkbox`, `producto/[id]`, `reports`) |
    | `@custom-variant dark` (red de seguridad) | activo mientras `data-tema` no sea `claro` | 123 clases `dark:` |
    | Clases heredadas recoloreadas: `.auth-*`, `.input-floating`, `.input-label`, `.btn-primary`, `.btn-secondary`, `.separator*`, `.alert-*`, `.link-secondary`, `.google-btn`, `.menu-card*`, `.promo-*`, `.skeleton*` | tokens semánticos | se sustituyen por los componentes de la fase 3 |
  - **Hacer:** eliminar los alias del paso 1.4, `.btn-*`, `.menu-card` y `.auth-*`, y los componentes sustituidos (`Navbar`, `ConditionalNavbar`, `components/Button.tsx`, `KpiCard`, `StatCard`, etc.).
  - **Aceptación:** sin texto blanco sobre acento (`rg -e "bg-(brand|acento)[^\"'`]*text-white" -e "text-white[^\"'`]*bg-(brand|acento)" app components features` vacío; criterio de DESIGN.md § Colors); `rg -e "#[0-9a-fA-F]{6}" app components features --glob "!**/tokens.css"` y `rg "text-\[\d+px\]"` sin resultados.
  - **Commit:** `refactor(diseno): eliminar alias de tokens y componentes heredados`

---

## Fase 6 · Pulido de movimiento — `feature/rediseno-web-pulido`

Fase hecha con la skill **emil-design-eng**, solo para el pulido final.

- [ ] **6.1 · Aparición de secciones** de la landing (opacidad y desplazamiento de 12 px, una sola vez, con `IntersectionObserver`).
  - **Commit:** `feat(movimiento): aparición sobria de secciones`

- [ ] **6.2 · Microinteracciones** de botones, enlaces, campos, diálogos, panel lateral y pestañas, con los tokens de duración y curva.
  - **Commit:** `feat(movimiento): microinteracciones de controles`

- [ ] **6.3 · Revisión de pulido** con emil-design-eng en todas las pantallas. Cada corrección va en su propio commit.

- [ ] **6.4 · Movimiento reducido.** Con `prefers-reduced-motion` y con la opción del panel no queda ningún desplazamiento.
  - **Aceptación:** una prueba de Playwright con `reducedMotion: "reduce"` lo verifica.
  - **Commit:** `test(movimiento): verificar movimiento reducido`

---

## Fase 7 · Auditoría final — `feature/rediseno-web-auditoria`

- [ ] **7.1 · Seguridad**
  - **Hacer:** cabeceras en `next start` y en la vista previa de Vercel; 0 violaciones de CSP; revisión del bundle limpia; 0 `.map`; sin `X-Powered-By`; prueba de almacenamiento y caché; matriz de rutas por rol; `pnpm audit --audit-level=high` sin avisos en dependencias del front (las de los route handlers se remiten a NP-01).
  - **Commit:** `docs(estado): auditoría final de seguridad`

- [ ] **7.2 · Accesibilidad**
  - **Hacer:** axe con 0 violaciones en todas las rutas y estados; recorrido con teclado; lector de pantalla (NVDA y VoiceOver) en las páginas clave; zoom al 200 %; texto al 125 %; objetivos de 44 px medidos por script.
  - **Commit:** `docs(estado): auditoría final de accesibilidad`

- [ ] **7.3 · Rendimiento**
  - **Hacer:** Lighthouse (mediana de 3 ejecuciones) **≥ 90 en las cuatro categorías, en móvil y en escritorio**, en `/`, `/menu`, `/menu/producto/[id]`, `/menu/pedido`, `/reservations`, `/login` y el inicio admin.
  - **Commit:** `docs(estado): auditoría final de rendimiento`

- [ ] **7.4 · Compatibilidad**
  - **Hacer:** proyectos de Playwright `chromium`, `firefox`, `webkit`, `movil-ios`, `movil-android` y `edge`, más una prueba manual en Safari de iOS y Chrome de Android reales (zonas seguras, `100dvh`, teclado virtual sobre los formularios).
  - **Commit:** `docs(estado): matriz de compatibilidad`

- [ ] **7.5 · Limpieza final**
  - **Aceptación:** 0 `console.log`, 0 bloques de código comentado, 0 TODO sin referencia a una NP, 0 textos de relleno, 0 `<svg>` a mano fuera de `components/marca` y 0 colores literales.
  - **Commit:** `chore(limpieza): barrido final`

- [ ] **7.6 · Documentación**
  - **Hacer:** actualizar ESTADO.md con la sección «Después», regenerar `.impeccable/design.json` desde DESIGN.md y abrir el PR de `feature/rediseno-web` hacia `developer`.
  - **Commit:** `docs(rediseno): cierre del rediseño`
