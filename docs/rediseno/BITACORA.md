# Bitácora del rediseño — El Quijote

> Detalle de cada paso completado: qué se hizo, decisiones conservadoras, verificación y lo que quedó sin verificar. El bloque «ESTADO ACTUAL Y SIGUIENTE PASO» de `PLAN.md` solo resume y remite aquí. Las entradas van de la más reciente a la más antigua; cada paso nuevo añade la suya arriba **en el mismo commit** que lo cierra.

---

## Fase 2 · Cabeceras y medidas de seguridad del front

### 2.7 · Sin service worker (2026-11-02) — D-11 rechazada

**Cambios:**
- **Borrados** (estaban versionados): `public/sw.js` y `components/pwa/ServiceWorkerRegister.tsx`. En `app/layout.tsx`, su uso pasa a `RetirarServiceWorker`.
- **`components/pwa/RetirarServiceWorker.tsx`** (nuevo): isla de cliente que no es un service worker. En cada carga desregistra las instalaciones que queden y borra las cachés de la aplicación, sin errores si el navegador no tiene esas APIs. Su retirada sigue en NP-34.
- **`next.config.ts`:** sin la regla de cabeceras de `/sw.js`.
- **`/offline`:** la ruta se conserva, aunque ya no se sirve de forma automática.
- **`InstallPrompt`:** no se toca, porque ya devolvía `null` si el navegador no emite `beforeinstallprompt`.
- **Pruebas:**
  - `csp.spec.ts` y `excepciones.ts` dejan de tolerar la violación de `worker-src` por `/sw.js`. Solo queda justificada la de Unsplash (NP-36).
  - `almacenamiento.spec.ts`:
    - la prueba de Cache Storage y service worker pasa **sin `test.fail()`** y, además, comprueba que ninguna página pide `/sw.js`;
    - una prueba nueva instala un service worker «antiguo» en `/sw.js` (servido por la propia prueba, porque el archivo ya no existe) y una caché `quijote-v1`, recarga y comprueba que no queda ni el registro ni la caché.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.
- Build: correcto.
- Chromium contra `next start`:
  - almacenamiento, CSP y cabeceras: 27/27; las rutas públicas sin ninguna violación de CSP, y las de panel solo con las 6 justificadas de Unsplash;
  - recorrido y línea base: 137/137.
- Sin procesos abiertos.

**No verificado:**
- La limpieza en navegadores reales que tuvieran instalado el SW de producción anterior; se simula con uno equivalente.
- La prueba del SW antiguo solo corre en Chromium, a propósito: la limpieza usa APIs estándar.

### 2.6 · Política de caché (2026-11-02)

**Cambios:**
- **`config/seguridad/cabeceras.ts`:** `RUTAS_SIN_CACHE` y `Cache-Control: private, no-store, max-age=0`, que `next.config.ts` aplica a `/dashboard/:path*`, `/profile`, `/menu/pedido/:path*`, `/login`, `/register`, `/reset` y `/frm_reset`. También se aplica a la redirección del proxy de `/dashboard` sin sesión. `/_next/static` conserva su caché inmutable.
- **`cache: "no-store"` en 88 llamadas a `fetch` de 31 archivos** del front: páginas, componentes, hooks, `lib/api.ts` (el envoltorio `apiFetch`) y `hooks/useFetch.ts`.
  - Se hizo con un script que separa los argumentos analizando paréntesis y cadenas, con tres casos: sin opciones, objeto literal y variable. Se revisó a mano una muestra de cada caso y los envoltorios compartidos.
- **`revalidate` retirado:** el de 60 s de `app/api/menu/categories/route.ts`, que pide el PLAN, y el `revalidate: 0` del layout de paneles, que con `no-store` sobra. `rg revalidate app lib features components hooks` no encuentra nada.
- **`export const dynamic = "force-dynamic"`:**
  - en `app/dashboard/layout.tsx`;
  - en dos layouts nuevos mínimos, que solo devuelven a sus hijos: `app/(auth)/profile/layout.tsx` y `app/menu/pedido/layout.tsx`. Sus páginas son de cliente y no pueden declarar la configuración del segmento. No cambia ninguna URL.
- No se usa React Query ni SWR, y no hace falta caché cifrada.

**Alcance:**
- `app/api/auth/{login,logout,register}`, `app/api/cron/backups` y `lib/db.ts` también tienen `fetch`, pero el PLAN los trata como backend (NP-01). Solo se toca la ruta que nombra el propio 2.6.
- En el servidor de Next 16, `fetch` ya no guarda en caché por defecto, así que su comportamiento no cambia.

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo tocado cambia su cuenta y los dos layouts nuevos están limpios.
- Build: correcto.
- `cabeceras.spec.ts`:
  - sin `test.fail()`;
  - `no-store` y `private` en 10 rutas, incluida la redirección de `/dashboard`;
  - `immutable` en un estático versionado.
- Chromium contra `next start`, batería completa en dos tandas (por el límite de tiempo de cada llamada): 42 + 137 = **179/179**.
- Sin procesos abiertos.

**No verificado:**
- Que el API del backend responda con sus propias cabeceras de caché.
- Las cachés de proxies intermedios en producción.

### 2.5 · Aplicar la CSP — **pendiente de aprobación del usuario** (2026-11-02)

No se ejecuta, por orden del usuario: el pago con Stripe no se puede verificar sin claves de prueba ni backend.

**Cómo se aplicaría:**
- En `proxy.ts`, la cabecera pasa de `CABECERA_CSP_INFORME` a `CABECERA_CSP`, con `construirCsp({ aplicada: true })`, que añade `upgrade-insecure-requests`.
- `csp.spec.ts` pasaría a exigir la cabecera aplicada.
- Las pruebas no cambian: con la política en modo informe ya fallan ante cualquier violación sin justificar.

**Violaciones que siguen abiertas** (en modo informe, cinco proyectos):
1. `worker-src` por el registro de `/sw.js` en todas las rutas. **La retira el 2.7**: tras él no debería quedar ninguna.
2. `img-src https://images.unsplash.com/` en `/dashboard/admin/about`: fotos de muestra de `aboutMock.ts` y la imagen de respaldo de `GallerySection.tsx`. **Decisión del usuario (NP-36):** sustituirlas por fotos de la casa en Cloudinary, o añadir `images.unsplash.com` a `hosts-permitidos.ts`. Con la CSP aplicada y sin decidirlo, esas imágenes no se cargarían.

**Lo que falta por comprobar antes de aplicarla:**
- El checkout completo con Stripe en modo de prueba (Stripe.js, el iframe de pago, 3-D Secure en ventana emergente y la vuelta a `/menu/pedido/checkout/exito`). Necesita claves de prueba y el backend.
- La subida de imágenes desde el admin con el widget de Cloudinary (`upload-widget.cloudinary.com` en `frame-src` y `api.cloudinary.com` en `connect-src`). Necesita credenciales.
- El mapa de `/about` (`google.com/maps/embed` en `frame-src`) con la red real.
- Las fotos que envía el API desde Supabase Storage (NP-36).
- El auditor «csp-xss» de Lighthouse sin avisos de severidad alta. Lo lanza el usuario: el agente no ejecuta Lighthouse.
- El recorrido completo en los cinco proyectos con la cabecera aplicada: 0 violaciones y 0 errores de consola nuevos.

### 2.4 · Eliminar los scripts y estilos en línea que bloquearía la CSP (2026-11-02)

Se retomó tras la interrupción por falta de memoria, a petición del usuario. Esta vez las tandas se lanzaron en primer plano y de una en una.

**Corrección de la lista del 2.3:** la tabla del 2.3 salió de un resumen recortado del log y estaba **incompleta**. Faltaban `/` (2), `/about` (1 más, la de `MolinoAnimado`), `/dashboard/admin/db-performance` (2) y las fotos de Unsplash de `/dashboard/admin/about`. Abajo va la lista completa y cómo queda cada una.

**Cambios:**
- **`/offline`:** el script en línea con `dangerouslySetInnerHTML` pasa a `app/offline/RecargarAlConectar.tsx`, un componente cliente que hace lo mismo (recargar al volver la conexión).
- **`<style>` en línea fuera:**
  - `about/page.tsx` (carrusel de reseñas);
  - `admin/settings/page.tsx` y `admin/db-performance/page.tsx` (`@keyframes spin`);
  - `ExportModal.tsx` e `Importpreviewmodal.tsx` (`spin`, solo visible en sus modales);
  - `PaymentDistribution.tsx` (`<style jsx>`, que styled-jsx inyectaba al ejecutarse).
- **Ilustraciones SVG** de la portada (`Plato.jsx`) y de `/about` (`MolinoAnimado.jsx`): llevaban un `<style>` dentro del SVG. Sus reglas pasan a `styles/globals.css`, acotadas con `.plato-boceto` y `.molino-animado`. El relleno, que antes se interpolaba desde la prop `fillColor`, llega como variable CSS en el atributo `style` del SVG, que la CSP permite (`style-src-attr`). Se comprobó que ningún otro elemento usaba esas clases, que antes eran globales.
- **`styles/globals.css`** recibe las animaciones heredadas (`marquee`, `.animate-marquee-elegant` y `slideRight`) y las clases de las dos ilustraciones, con la retirada prevista al rehacer esas pantallas (fases 4 y 5). `spin` no hace falta: Tailwind ya define `@keyframes spin` igual.
- **`csp.spec.ts`:**
  - ahora falla con cualquier violación no justificada;
  - comprueba que el carrusel de `/about` sigue con su animación y que no queda `<style>` sin nonce.
- **`excepciones.ts`:** se retiran las dos excepciones de lo que iba en línea.

**Lista completa de violaciones** (Chromium, 42 rutas) y estado:

| Directiva | Qué | Dónde | Estado |
|---|---|---|---|
| `script-src-elem` | script en línea | `/offline` | **Corregida** |
| `style-src-elem` | `<style>` en el SVG de `Plato` | `/` (2) | **Corregida** |
| `style-src-elem` | carrusel y `<style>` en el SVG de `MolinoAnimado` | `/about` (4) | **Corregida** |
| `style-src-elem` | `@keyframes spin` | `/dashboard/admin/settings` (2), `/dashboard/admin/db-performance` (2) | **Corregida** |
| `style-src-elem` | `<style jsx>` | `/dashboard/cajero` | **Corregida** |
| `worker-src` | registro de `/sw.js` | las 42 rutas | **Justificada:** la retira el 2.7 |
| `img-src` | fotos de muestra de `images.unsplash.com` (`aboutMock.ts` y el respaldo de `GallerySection.tsx`) | `/dashboard/admin/about` | **Justificada:** decisión del usuario antes del 2.5 (NP-36). Sustituirlas cambia el contenido; permitir el origen amplía la CSP. |

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo tocado sube su cuenta (las pantallas heredadas conservan sus errores previos) y el componente nuevo está limpio.
- Build: correcto.
- `csp.spec.ts` en los **cinco proyectos** (Chromium, Firefox, WebKit, iOS y Android): 4/4 en cada uno, sin violaciones salvo las dos justificadas.
- Chromium, recorrido, línea base y marca: **139/139**.
- Ilustraciones (prueba temporal, ya borrada): trazo de 2,5 px y relleno aplicados en la portada y en `/about`; captura del plato revisada.
- Sin procesos abiertos.

**No verificado:**
- Los modales de exportar e importar, con su icono girando: se abren con datos del admin que el recorrido no simula. La regla `spin` es la misma de Tailwind.
- El checkout con Stripe (sin claves ni backend).

### Interrupción: falta de memoria durante la verificación del 2.4 (2026-11-02)

**Qué pasó.** Con el código del 2.4 terminado, se lanzó en segundo plano el build y `csp.spec.ts` en los cinco proyectos. Claude Code paró la tarea porque el equipo se quedó sin memoria. No quedó salida: se cortó durante el build, antes de las pruebas. No quedaron procesos abiertos (0 de `node` y de navegadores; el 3100, libre).

**Por qué se detiene la fase.** El aviso del sistema indica no relanzar la tarea sin que lo pida el usuario. El 2.4 y todos los pasos siguientes necesitan build y pruebas para verificarse, así que el bloqueo afecta a todos. Según la orden del usuario, en ese caso se detiene.

**Estado para retomar:**
- **Commits de la fase:** 2.1 (`7577c79`), 2.2 (`eaccb56`) y 2.3 (`4a89df9`), verificados.
- **2.4, hecho y sin verificar, sin commit en el árbol de trabajo:**
  - `app/offline/page.tsx` usa el nuevo `app/offline/RecargarAlConectar.tsx` en lugar del script en línea;
  - sin `<style>` en línea en `about/page.tsx`, `admin/settings/page.tsx`, `admin/db-performance/page.tsx`, `ExportModal.tsx`, `Importpreviewmodal.tsx` y `PaymentDistribution.tsx` (`<style jsx>`);
  - `marquee`, `.animate-marquee-elegant` y `slideRight` pasan a `styles/globals.css` (`spin` ya lo define Tailwind igual);
  - `csp.spec.ts` falla con violaciones no justificadas (solo se tolera la de `/sw.js` hasta el 2.7) y comprueba la animación de `/about`;
  - `excepciones.ts` ya no tiene las dos excepciones de lo que iba en línea.
  - Comprobado antes de la interrupción: typecheck 0 errores y lint sin problemas nuevos en ningún archivo tocado.
- **Para retomar:**
  - `build`, `csp.spec.ts` en los cinco proyectos y el recorrido y la línea base en Chromium;
  - si pasan, commit del 2.4 con su entrada;
  - después, 2.6 (el 2.5 queda pendiente de aprobación).
  - Conviene cerrar otras aplicaciones antes: el equipo tiene 5,8 GB de RAM.
- **2.5:** no se ejecuta por orden del usuario, y queda pendiente de su aprobación. La lista de violaciones está en la entrada del 2.3.
### 2.3 · CSP en modo informe, con nonce (2026-11-02) — D-02

**Cambios:**
- `config/seguridad/csp.ts` (nuevo): `crearNonce` (128 bits con Web Crypto, base64) y `construirCsp`, a partir de `hosts-permitidos.ts`.
  - Es la política del PLAN, con dos decisiones conservadoras:
    - `frame-src` incluye también `HOSTS_MARCO` (mapa de Google en `/about` y widget de subida de Cloudinary), que la fase 1 dejó listos para esta CSP;
    - `upgrade-insecure-requests` solo se añade cuando la CSP se aplique (2.5): en modo informe el navegador lo ignora y avisa en la consola.
  - En desarrollo se añade `'unsafe-eval'`, y nada más.
- `proxy.ts`:
  - genera el nonce en cada petición y pone `Content-Security-Policy-Report-Only` en todas las respuestas;
  - pasa `x-nonce` y la política en la petición, que es de donde Next lee el nonce para sus scripts;
  - el control de acceso pasa a una función `decidir`, sin cambiar su lógica: cada «seguir» continúa con esas cabeceras.
- `app/layout.tsx`: lee el nonce con `headers()` y se lo da a `ScriptPreferencias`.

**Consecuencia:** leer las cabeceras en el layout hace **dinámicas** todas las páginas. Un nonce por petición no cabe en una página prerenderizada; lo exige Next y es lo que prevé el PLAN.
- La tabla de rutas mantiene las 66 rutas, pero las páginas pasan de ○ a ƒ.
- Por eso Next ya responde `Cache-Control: no-store` en las páginas. Las pruebas de `no-store` de `/profile`, `/menu/pedido`, `/login` y `/register` pasan antes del 2.6; el `test.fail()` queda solo en `/dashboard`, cuya redirección del proxy aún no lo lleva.

**Ajustes de las pruebas:**
- **`csp.spec.ts`** (nueva):
  - comprueba que el nonce cambia en cada petición, que la política tiene sus directivas clave sin `unsafe-eval` y que no hay cabecera `Content-Security-Policy` aplicada;
  - comprueba que todo `<script>` del HTML del servidor lleva el nonce; los que Next añade después los cubre `'strict-dynamic'`;
  - registra las violaciones de las 42 rutas (públicas sin sesión y de panel con la sesión simulada de su rol) en `test-results/csp/`.
- **`vigilantes.ts`:** una petición abortada del router de Next (cabecera `rsc`, buscada en toda la cadena de redirecciones) ya no cuenta como fallo de red. Son precargas y navegaciones superadas que el propio router cancela; con páginas dinámicas aparecían unas 700 en el recorrido. Cualquier otra petición abortada sigue fallando.
- **`excepciones.ts`:** tipo nuevo `csp` y 3 excepciones **temporales** con el paso que las retira (ver la lista). La lista crece de forma temporal; el 2.4 retira dos y el 2.7 la tercera.

**Lista de violaciones** (Chromium contra `next start`, 42 rutas):

| Directiva | Qué | Dónde | Se corrige en |
|---|---|---|---|
| `worker-src` | registro de `/sw.js` (`ServiceWorkerRegister`) | las 42 rutas | 2.7 (sin service worker) |
| `script-src-elem` | script en línea con `dangerouslySetInnerHTML` | `/offline` | 2.4 |
| `style-src-elem` | `<style>` en línea (animación del carrusel de reseñas) | `/about` (2) | 2.4 |
| `style-src-elem` | `<style>` en línea (`@keyframes spin`) | `/dashboard/admin/settings` (2) | 2.4 |
| `style-src-elem` | `<style jsx>` que styled-jsx inyecta en tiempo de ejecución | `/dashboard/cajero` | 2.4 |

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.
- Build: correcto.
- Chromium contra `next start`, batería completa: 170 pasan.
  - Los 3 fallos de esa tanda eran de las pruebas: la regla de la prueba del nonce y peticiones RSC abortadas en `/forbidden`.
  - Corregidos, `csp.spec.ts`, el recorrido, la línea base y las cabeceras pasan, y `/forbidden`, `/unauthorized` y `/maintenance` pasan 45/45 con tres repeticiones.
- Sin procesos abiertos.

**Incidencia:** la herramienta de escritura convirtió un `\b` de una expresión regular en un carácter de retroceso (0x08). Se detectó porque la prueba no encontraba `<script>`, y se corrigió creándolo con `chr(92)`. Una revisión de los 23 archivos tocados desde el cierre de la fase 3 no encontró otros caracteres de control. `pnpm revisar:invisibles` no mira esos caracteres: idea anotada en **NP-39**, fuera del PLAN.

**No verificado:**
- El checkout con Stripe en modo de prueba (sin claves ni backend).
- Las violaciones en Firefox, WebKit y los dos móviles (se comprueban en el 2.4, que exige los cinco proyectos).

### 2.2 · Cabeceras base y opciones de producción (2026-11-02)

**Cambios:**
- `next.config.ts` (el PLAN dice `next.config.js`, que pasó a `.ts` en el 1.9): `poweredByHeader: false` y `productionBrowserSourceMaps: false` explícito.
- Las cabeceras de todas las rutas salen de **`config/seguridad/cabeceras.ts`** (nuevo), con los valores exactos del PLAN:
  - HSTS, `nosniff`, `X-Frame-Options: DENY` y `Referrer-Policy: strict-origin-when-cross-origin` (antes `origin-when-cross-origin`);
  - `Permissions-Policy` con micrófono y geolocalización para el propio sitio y el pago para Stripe;
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Cross-Origin-Resource-Policy: same-site` y `Origin-Agent-Cluster: ?1`.
- Sin `Cross-Origin-Embedder-Policy`, como dice el PLAN. La regla de `/sw.js` sigue hasta el 2.7.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.
- Build: correcto en 62 s. **0 archivos `.map`** en `.next/static`.
- `cabeceras.spec.ts`:
  - la prueba de `X-Powered-By` pasa sin `test.fail()`;
  - las 8 cabeceras con su valor exacto, y la ausencia de COEP, en `/`, `/menu`, `/login`, `/dashboard` (incluida su redirección del proxy) y `/icon.svg`;
  - en Chromium, `document.featurePolicy` permite la geolocalización y el micrófono al sitio y bloquea la cámara.
- Chromium contra `next start`, batería completa: **170/170**, las 164 anteriores más las 6 nuevas.
- Sin procesos abiertos.

**No verificado:** la geolocalización real (`DistanceToRestaurant`) y la búsqueda por voz (`VoiceSearch`) con un dispositivo. Se comprueba que la política las permite, no que funcionen con permisos reales. Firefox y WebKit, en el cierre.

**Fuera del PLAN:** Next 16.4 crea un `AGENTS.md` en la raíz cada vez que arranca `next dev`. No se versiona ni se borra: se excluye solo en local (`.git/info/exclude`) para mantener limpio el árbol. Si se quiere versionar, lo decide el usuario.

### 2.1 · Actualizar Next (2026-11-02) — D-01

El usuario pidió ejecutar la fase 2 sin supervisión, del 2.1 al 2.18, sin aplicar la CSP (2.5) y cerrando la fase al final. Rama `feature/rediseno-web-seguridad`, creada desde `feature/rediseno-web-componentes` (`2098fa0`), que ya contiene las fases 1 y 3.

**Versiones** (`package.json` y `pnpm-lock.yaml`):
- `next` de 16.0.7 a **16.4.3**, y `eslint-config-next` de 16.0.7 a 16.4.3.
- `react` y `react-dom` de 19.2.1 a **19.2.9**, el último parche de la 19.2, sin cambiar de versión menor.

**Por qué 16.4.3:** el último aviso de `next` exige 16.4.1 o posterior. La 16.4.4 se publicó hoy (2026-11-02) y no tiene ningún margen de uso; la 16.4.3 es del 2026-10-23. React no tenía avisos.

**Resultado de `pnpm audit`:**
- **Antes:** 136 avisos (7 críticos, 66 altos, 53 moderados y 10 bajos), 43 de ellos de `next`.
- **Después:** 85 (3 críticos, 45 altos, 31 moderados y 6 bajos), ninguno de `next`.
- Los 3 críticos que quedan llegan por `firebase-admin`, dependencia del servidor: **NP-38**, fuera del alcance.

**Verificación:**
- Typecheck: 0 errores.
- Build: correcto en 120 s, sin avisos. Tabla de rutas idéntica (66 rutas, mismo tipo cada una), comparada con el build del cierre de la fase 3.
- Chromium contra `next start`, batería completa: 164/164 (103 omitidas: el catálogo, solo en `next dev`).
- `next dev`: `catalogo.spec.ts` y `dialogos.spec.ts`, 26/26.
- Lint global: de 309 a 310 problemas. El nuevo es un aviso de una regla que trae `eslint-config-next` 16.4 (`@next/next/no-location-assign-relative-destination`) sobre código que ya existía: `window.location.href` en `app/dashboard/mesero/page.tsx`. No se toca, porque esa pantalla se rehace en la fase 5; queda anotado aquí.
- Sin procesos abiertos.

**No verificado:** Firefox y WebKit con la nueva versión (en el cierre de la fase).

---

## Fase 3 · Componentes reutilizables

### Cierre de la fase 3 (2026-11-02)

Los 15 pasos de la fase están hechos, con 3.4 y 3.6–3.14 pendientes de la revisión del usuario en el catálogo. Por orden del usuario no se lanza Lighthouse: la medición móvil la hace él con el editor cerrado.

| Comprobación | Resultado |
|---|---|
| Typecheck | 0 errores |
| Lint | Archivos nuevos limpios. De los 7 archivos que existían y se modificaron, ninguno sube su cuenta (`TrackingTab` sigue con sus 2 errores previos), comparado archivo a archivo con `d6407c9`. Total global: 309 problemas (205 errores y 104 avisos), todos previos. |
| Build de producción | Correcto en 79 s. Las 66 rutas no cambian, porque la fase no toca `app/` fuera de `app/(dev)/`. `/catalogo` no está en la tabla y da 404 en `next start`. |
| `revisar-bundle` | 890 archivos sin rastro del catálogo |
| Producción (`next start`), batería completa | Chromium 164/164, Firefox 162/162, WebKit 163/163: las mismas cifras que en el cierre de la fase 1. Las omitidas (103–105) son las pruebas del catálogo, que solo existe en `next dev`. |
| Catálogo (`next dev`), 13 archivos de pruebas | Chromium 103/103, Firefox 103/103, WebKit 103/103 (tras el ajuste de abajo) |
| `pnpm test:unidad` | 27/27 |
| `pnpm revisar:invisibles` | 0 hallazgos en 323 archivos |
| `pnpm audit` | 7 críticas / 66 altas / 53 moderadas / 10 bajas, igual que al cerrar la fase 1: zod y Radix no añaden avisos |

**WebKit en el catálogo: 2 fallos de la prueba, no de los componentes.** Están corregidos en `dialogos.spec.ts`, que ahora pasa 13/13 en los tres motores.
- **`overscroll-behavior`:** el WebKit de Playwright no lo admite (`getComputedStyle(...).overscrollBehaviorY` es `undefined`; Safari lo admite desde la 16). Ahora la prueba solo lo exige donde `CSS.supports` lo admite.
- **Foco al cerrar `useConfirmacion`:**
  - **Por qué falló:** Safari, y con él WebKit, no enfoca un botón al pulsarlo con el ratón, así que al abrir no hay un foco que recordar y, al cerrar, el foco queda en el documento.
  - **Con el teclado (Tab y Enter):** el botón sí tiene el foco y vuelve a él. La prueba ahora abre y responde con el teclado, que es el caso que exige WCAG.
  - **Con el ratón en Safari:** que el foco no vuelva es el comportamiento normal de esa plataforma. Queda anotado; no se fuerza.

**Pendientes «no verificado» de la fase, revisados:**
- **Firefox y WebKit de 3.3, 3.5 y 3.4–3.14:** hecho; ver la tabla.
- **Lectores de pantalla reales (3.5, 3.12):** siguen sin verificar; quedan para la fase 7.
- **Montaje en páginas reales** (cabecera fija, navegación entre páginas públicas, layout de paneles): llega en las fases 4 y 5.
- **Textura de respaldo de las gráficas** con colores forzados: no implementada; fase 7 si la auditoría la pide.

**Pendientes que pasan a otras fases:**
- **2.14:** «Cerrar sesión» en `MenuCuenta` y `BarraSuperiorPanel`.
- **4.3:** cabecera transparente sobre la portada.
- **NP-37:** navegación del mesero.

**PR.** El agente no hace push. El texto del PR está en `D:\dev-cache\rediseno\pr-fase-3.md`. La rama sale de `feature/rediseno-web-cimientos`: conviene fusionar antes el PR de la fase 1.

---
### 3.14 · `Buscador` (2026-11-01)

**Archivos**, sin dependencias nuevas:
- `components/ui/Buscador.tsx`: formulario `role="search"` con etiqueta, campo `type="search"` (sin la «x» nativa de WebKit, que se sustituye por un botón con nombre), lupa o giro según `ocupado`, «Borrar búsqueda», Esc para borrar, ayuda opcional y anuncio `aria-live`.
- `hooks/useBusqueda.ts`:
  - `coincide`: sin tildes ni mayúsculas, con `normalizarParaComparar` del 3.1; todas las palabras, en cualquier orden.
  - `useFiltroLocal`: `useDeferredValue`, con `pendiente` mientras el filtrado va detrás de lo escrito.
  - `useBusquedaRemota`: espera de 300 ms, mínimo de 2 caracteres y `AbortController` que cancela la anterior. El estado (`inactiva`, `esperando`, `buscando`, `lista`, `error`) se deriva de la consulta actual, así que un resultado viejo nunca se muestra como el de la consulta nueva. Devuelve `anteriores` para no parpadear.
- `components/ui/Campo.tsx` exporta `CLASE_CONTROL`, para que el buscador tenga el mismo aspecto que los campos.
- Catálogo: sección «Buscador» (`DemosBuscador.tsx`). Tiene un filtro sobre 120 platillos y una búsqueda contra un API simulado, con latencia variable, contador de peticiones y cancelaciones, y fallo con la palabra «error».
- DESIGN.md documenta el componente y los hooks.

**Verificación:**
- `pnpm test:unidad`: 27/27, con `busqueda.spec.ts` (nueva): tildes, mayúsculas, orden de palabras y consulta vacía.
- `buscador.spec.ts` (nueva, Chromium contra `next dev`):
  - filtro local con «cafe» → 10, anunciado; Enter no envía; Esc y «Borrar búsqueda» vacían y el foco vuelve al campo; sin resultados, anuncio y estado vacío;
  - remota: una letra no busca; teclear seguido lanza una sola petición; una consulta nueva cancela la que estaba en curso (`Peticiones: 3 · canceladas: 1`); los resultados son los de la última consulta;
  - fallo anunciado y con estado de error;
  - axe y sin desborde a 360 px con texto al 125 % en los dos temas.
- `campos.spec.ts` (por el cambio en `Campo.tsx`) y `catalogo.spec.ts`: verdes.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox y WebKit, que se hacen ahora en el cierre de la fase.

### 3.13 · `NavegacionPanel`, `BarraSuperiorPanel` y `EncabezadoPagina` (2026-11-01)

**Componentes** (`components/paneles/`), sin dependencias nuevas:
- `NavegacionPanel.tsx`: `<nav>` con nombre, grupos con rótulo y `<Link>` con `aria-current="page"`.
  - La entrada activa se calcula con `claveActiva`: la de ruta más concreta que contiene la actual y cuya consulta coincide. En la caja, `/dashboard/cajero?filter=pending` marca «Tickets Pendientes» y no «Caja Principal».
  - La consulta se lee con `useSearchParams` dentro de un `Suspense` propio, con la activa solo por ruta como respaldo, porque el build de Next lo exige. `rutaActual` la fija para el catálogo y las pruebas.
  - Las entradas con hijos se despliegan; la que contiene la activa empieza abierta.
- `BarraSuperiorPanel.tsx`: drawer por debajo de 1024 px (`PanelLateral` desde el inicio, que se cierra al elegir), nombre del panel, accesibilidad y cuenta. El cierre de sesión llega por `alCerrarSesion` (2.14), como en la cabecera pública.
- `EncabezadoPagina.tsx`: antetítulo, `h1`, descripción y acciones.
- `config/navigation/por-rol.ts`: `navegacionDeRol(rol)` para admin, caja y cocina. El mesero no tiene navegación configurada: lista vacía y **NP-37**, porque sus entradas son una decisión de producto.
- Catálogo: sección «Navegación de los paneles» (`DemosPaneles.tsx`), con un panel de administración completo y la navegación de caja.
- DESIGN.md documenta los tres componentes.

**Ajustes tras las capturas:**
- A 1280 px con texto al 125 %, las acciones del encabezado se partían en dos filas: ahora no encogen.
- En móvil, el nombre del panel quedaba en «A…» junto al logo: la barra del panel no lleva logo.
- El desborde a 360 px era del rótulo de la demo, con rutas largas sin espacios, no de un componente. Se localizó ocultando bloques de la sección hasta dar con el responsable.

**Verificación** (Chromium contra `next dev`):
- `paneles.spec.ts` (nueva):
  - a 1280 px: una sola activa («Proveedores»), con relleno café y filete de acento; su grupo abierto y los demás cerrados (se abren con el botón); listas con nombre; sin drawer;
  - la consulta decide la activa en la caja;
  - a 390 px: navegación en el drawer con la activa; Esc devuelve el foco; elegir un enlace lo cierra;
  - cuenta con nombre y rol, sin «Cerrar sesión» hasta el 2.14; `h1` y la acción primaria al final;
  - axe y sin desborde a 360 y 1280 px con texto al 125 % en los dos temas; la barra superior cabe.
- `catalogo.spec.ts` con la sección nueva: verde.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox, WebKit y el layout real de los paneles (5.1).

### 3.12 · `PanelAccesibilidad`: acabado (2026-11-01)

La versión funcional era del 1.6. El usuario pidió seguir el PLAN tras el 3.11: 3.12, 3.13, 3.14 y el cierre de la fase 3.

**Cambios** en `components/accesibilidad/PanelAccesibilidad.tsx`:
- **Animación de apertura:** clase nueva `.menu-flotante`. Opacidad y escala de 0,98 a 1 desde el disparador (`--radix-popover-content-transform-origin`), como los diálogos; con movimiento reducido dura 0,01 ms. El menú de cuenta de la cabecera usa la misma clase.
- **Acceso desde el pie:** `conTexto` pinta el botón con su texto visible («Opciones de accesibilidad»). Va en la última fila de `PieSitio` y en el menú móvil de la cabecera, donde antes había una etiqueta oculta a lectores al lado de un botón solo icono.
- **Coherencia con el sistema:**
  - el título pasa de Fraunces a DM Sans 600, como el de los diálogos (decisión del usuario sobre los títulos de diálogo);
  - `z-[110]`: con `z-50` quedaba por debajo de la cabecera fija nueva (`z-100`);
  - `al-pasar:` en lugar de `hover:`, para que el catálogo pueda fijar el estado;
  - foco visible propio en el disparador y en «Cerrar».

**Verificación** (Chromium contra `next dev`):
- `panel-accesibilidad.spec.ts` (nueva):
  - con el teclado: Enter abre; aparece con `dialogo-entra` y `z-index` 110; el foco entra en la opción marcada y el grupo «Tema» tiene nombre; la flecha pasa a «Claro», se aplica al momento y se guarda; Esc cierra y el foco vuelve al botón;
  - desde el pie: texto visible, el mismo nombre accesible y el mismo panel («Muy grande» se aplica);
  - con movimiento reducido, la aparición dura 0,01 ms;
  - axe con el panel abierto a 360 px con texto al 125 % en los dos temas, y el panel cabe en la pantalla.
- La prueba del pie falló dos veces por tiempo. La primera, porque escribí archivos del 3.13 durante la tanda y el panel se volvió a montar; la segunda, porque con el panel abierto abajo el indicador de `next dev` tapa parte de él al ratón. Ahora usa el teclado (Espacio y Enter), que es lo que comprueba.
- `preferencias.spec.ts`, que ya usaba el panel, `sitio.spec.ts` y `catalogo.spec.ts`: verdes.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** lectores de pantalla reales (NVDA, VoiceOver), que pedía el PLAN. Las pruebas comprueban roles, nombres, grupos y foco, que es lo que esos lectores usan, pero no sustituyen la prueba con el lector. Queda para la fase 7, con Firefox y WebKit al cerrar esta fase.

### 3.11 · `CabeceraSitio` y `PieSitio` (2026-11-01) — D-09

**Componentes**, sin dependencias nuevas:
- `components/marca/cabecera/CabeceraSitio.tsx`: de servidor. `islas.tsx` reúne las islas de cliente:
  - `MarcoCabecera`: sombra al desplazar, con `useSyncExternalStore` sobre `scroll`; además registra cada ruta para `BotonVolver`.
  - `NavegacionSecciones`: sección activa.
  - `MenuCuenta`: Popover de Radix, ya instalado.
  - `MenuMovil`: `PanelLateral` del 3.5.
- `enlaces.ts` lista las secciones a partir de `SECCIONES_LANDING` (3.10).
- `components/marca/PieSitio.tsx`: de servidor, sin JavaScript, con los datos de `config/restaurant.config.ts`.
- `styles/componentes.css`: `.cabecera-sitio`.
- Catálogo: sección «Cabecera y pie» (`DemosSitio.tsx`). Dentro del catálogo la cabecera va sin fijar (`fija={false}`), porque arriba ya está la barra actual del sitio.
- DESIGN.md documenta los dos componentes.
- Los 7 SVG a mano de `ConditionalNavbar` no pasan a la cabecera nueva: todos sus iconos son de Lucide. `ConditionalNavbar` sigue en uso hasta que la fase 4 monte la cabecera.

**Decisiones conservadoras:**
- **Cerrar sesión:** no se implementa aquí. Es el paso 2.14 (cierre único que limpia todo el estado), y otra implementación más sería la quinta. `MenuCuenta` lo recibe como `alCerrarSesion` y, mientras no exista, no lo ofrece. Anotado en el 2.14.
- **Sesión:** la cabecera recibe `usuario` como dato; en la fase 4 llegará de la capa de datos de sesión (2.11). No se copia la consulta a `/api/auth/me` de `ConditionalNavbar`.
- **Variante transparente sobre la portada:** se aplaza al 4.3. Sobre la foto, en el tema claro, el texto principal es oscuro y la parte alta del velo es muy suave. Hace falta texto claro en los dos temas y un velo propio (tokens nuevos), y comprobarlo con axe sobre la imagen real, como exige DESIGN.md. Anotado en el 4.3.
- **Carrito:** la barra actual muestra un contador fijo (3) que no está conectado a nada. DESIGN.md no lo pide en la cabecera, así que no se incluye. Si hiciera falta, se decide en la fase 4 (13: `/menu/pedido`).
- **Pie:** conserva los textos y enlaces actuales (PLAN, regla 6), también el aviso de derechos y el horario tal como está configurado. `DistanceToRestaurant` (distancia al restaurante con la ubicación) no se incluye: lo decide la fase 4.
- **Acceso del personal:** apunta a `/login`, la entrada común de todos los roles.
- **Móvil con texto al 125 %:** a 360 px, logo, accesibilidad, «Reservar» y menú sumaban unos 387 px y el botón de menú quedaba fuera; el marco del catálogo lo recortaba sin desbordar la página. Por debajo de 640 px, las opciones de accesibilidad pasan al menú (como la cuenta) y el logo baja a 2rem. La prueba comprueba ahora que la cabecera misma cabe y que el botón de menú se ve entero.

**Verificación** (Chromium contra `next dev`):
- `sitio.spec.ts` (nueva):
  - a 1280 px: logo enlazado al inicio, cinco secciones con su `href`, accesibilidad, «Reservar» a `/reservations`, sin botón de menú; ningún SVG a mano salvo el logo; todo lo interactivo con 44 px de alto o más;
  - cuenta con sesión: menú con nombre, correo y «Tu cuenta», sin «Cerrar sesión» hasta el 2.14; Esc lo cierra y el foco vuelve al botón. Sin sesión: «Iniciar sesión»;
  - a 390 px: secciones ocultas, «Reservar» visible, menú en panel lateral con las cinco secciones y la cuenta; Esc lo cierra y el foco vuelve; la cabecera cabe;
  - pie: dirección, teléfono con `tel:`, redes con nombre accesible y `rel`, y «Acceso del personal» en el color tenue a 14 px como último enlace;
  - axe y sin desborde a 360 y 1280 px con texto al 125 % en los dos temas.
  - La primera pasada falló en la prueba, no en el componente: dentro de `<main>` un `<footer>` no es el punto de referencia `contentinfo`; ahora se localiza por etiqueta.
- `catalogo.spec.ts` con la sección nueva: contraste AA de todas las muestras en los dos temas, axe y capturas.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox, WebKit, lectores de pantalla reales y la cabecera fija con la página real (llega en la fase 4).

### 3.10 · `MigasDePan` y `BotonVolver` (2026-11-01)

**Archivos:**
- `config/navegacion-publica.ts`: mapa estático de las 20 páginas de acción públicas.
  - Cada ruta tiene patrón (con `[parametro]`), título, migas intermedias y origen, y cada origen el texto de su «Volver».
  - Exporta `SECCIONES_LANDING` (las anclas de la landing) y `rutaPublica(ruta)`, que tolera la barra final, la consulta y el ancla.
  - Los títulos de las páginas del pie son los de cada página («Condiciones de uso», «Devoluciones y reemplazos», «Alertas de seguridad»).
- `lib/navegacion/historial.ts`: ¿se llegó desde el propio sitio? Cuenta las navegaciones internas, porque Next no cambia `document.referrer`, o mira si el `referrer` es del mismo origen. En memoria, sin guardar nada en el navegador.
- `components/ui/MigasDePan.tsx` (de servidor) y `components/ui/BotonVolver.tsx` (cliente, con `useRegistroRuta`, que usará también la cabecera del 3.11).
- Catálogo: sección «Migas de pan y Volver» (`DemosNavegacion.tsx`). DESIGN.md documenta los dos componentes.

**Decisiones conservadoras:**
- **«Volver» es un enlace al origen:** funciona sin JavaScript, se puede abrir en otra pestaña (con un modificador no se intercepta) y solo usa el historial si se viene del sitio.
- **Texto del botón:** nombra el destino. Para las secciones de la landing va entre comillas («Volver a «Reservar»») para que no se lea como «reservar otra vez».
- **Páginas del pie:** vuelven al inicio, porque no hay una sección de origen.
- **Texto largo:** «Volver» pasa de línea en lugar de desbordar. La primera pasada desbordaba a 360 px con texto al 125 %: el botón no parte el texto por defecto y su destino puede ser largo.
- **Registro de navegación:** hasta que la cabecera del 3.11 lo monte en todas las páginas, solo cuenta desde la primera página con «Volver». Mientras tanto, lo peor que pasa es que lleve a la sección de origen en lugar de usar el historial.

**Verificación:**
- `pnpm test:unidad`: 25/25. `navegacion.spec.ts` (nueva, sin navegador) comprueba:
  - rutas fijas y con parámetros, barra final, consulta y ancla;
  - que no confunde rutas parecidas ni inventa las que no están;
  - que cada ruta tiene título, un origen interno con texto de «Volver» y padres internos;
  - que no hay patrones repetidos.
- `tests/e2e/navegacion.spec.ts` (nueva, Chromium contra `next dev`):
  - migas con nombre y lista, la actual como texto con `aria-current`, separadores ocultos y enlaces de 44 px;
  - sin historial del sitio, «Volver» es un enlace al origen y lleva a él;
  - llegando desde otra página del sitio, vuelve por el historial;
  - axe y sin desborde a 360 px con texto al 125 % en los dos temas.
- `catalogo.spec.ts` con la sección nueva: verde.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox y WebKit; el comportamiento con la navegación real entre páginas públicas, que llega en la fase 4 al montar los componentes.

### 3.9 · `EtiquetaSeccion`, `Contraetiqueta`, `SelloCasa` y `.filete-doble` (2026-11-01)

`SelloCasa` y las clases `.etiqueta-seccion`, `.filete-doble` y `.contraetiqueta` venían de la fase 1; este paso crea los componentes que faltaban y corrige la contraetiqueta.

**Componentes** (`components/marca/`, de servidor):
- `EtiquetaSeccion.tsx`: lote («Nº 03», oculto a lectores), rótulo, filete doble, título con `id` para el `aria-labelledby` de la sección, y entradilla. Alineada al inicio o centrada; nivel de título configurable.
- `Contraetiqueta.tsx`: pares rótulo/valor con `tipo` `cifra` (por defecto) o `texto`, a una o dos columnas, y `sinFileteFinal`.
- Catálogo: sección «Piezas de marca» (`DemosMarca.tsx`): etiqueta sobre el fondo y centrada en una banda café con el sello y el botón de reservar, contraetiquetas a una y dos columnas y el filete doble.
- DESIGN.md documenta los dos componentes.

**Contraetiqueta corregida** (lo anotado en el 3.5, «Visto de paso»):
- **Causa:** `dt` tenía `align-self: center` y `dd` no. Con un valor de dos líneas, el rótulo quedaba más bajo y sus filetes, en escalón.
- **Solución:** los dos ocupan la fila entera (`stretch`) y centran su contenido con flex, así que los filetes coinciden.
- **Otros cambios:** dos columnas desde 768 px (`data-columnas="2"`); valor de texto en peso normal (`data-tipo="texto"`); sin filete final si se pide.
- **Tabla:** usaba `!important` para que sus tarjetas mostraran el texto en peso normal; ahora usa `Contraetiqueta`. Con ella, el texto de las tarjetas va al tamaño de las cifras, no en `--texto-pequeno`, para que la contraetiqueta sea igual en toda la aplicación.

**Verificación** (Chromium contra `next dev`):
- `marca-componentes.spec.ts` (nueva):
  - orden de la etiqueta (lote oculto, rótulo, filete, título, entradilla); lote en itálica y título sin mayúsculas;
  - filete doble de 48 × 5 px con dos líneas de 1 px;
  - filetes de rótulo y valor a la misma altura a 390 y 1024 px;
  - dos columnas a 1024 px y una a 390;
  - sello decorativo y con el color del texto;
  - axe y sin desborde a 360 px con texto al 125 % en los dos temas.
- `tabla.spec.ts` (con las tarjetas ya sobre `Contraetiqueta`) y `catalogo.spec.ts` con la sección nueva: verde, con el contraste AA de todas las muestras en los dos temas.
- Captura revisada (oscuro, 360 px, 125 %).
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox y WebKit.

### 3.8 · `Indicador` y gráficas base (2026-11-01)

**Guía aplicada:** la skill de visualización de datos.
- **Paleta:** se volvió a validar con su script.
  - Oscuro, sobre `#1C1712`: todo PASS; la peor pareja vecina para daltonismo da ΔE 10,2.
  - Claro, sobre `#FBF8F2`: todo PASS salvo el aviso de contraste de `--color-grafica-4` (2,81:1), que ya recogía DESIGN.md. Por eso la vista de tabla es obligatoria en todas las gráficas.

**Componentes**, sin dependencias nuevas:
- `components/ui/Indicador.tsx`:
  - Estados normal, cargando, error (nunca un cero), sin comparación y datos de ejemplo.
  - El color de la comparación dice si es buena o mala noticia (`mejorSiSube`). El signo, el icono y un texto para lectores («mejora» o «empeora») dicen lo mismo.
- `components/ui/graficas/`:
  - `comun.tsx`: marco con título, «Ver tabla» y estados; leyenda; tooltip; zona interactiva con un solo tabulador, flechas, Inicio y Fin, y anuncio para lectores; escala con números redondos; ancho medido.
  - `formato.ts`: formatos es-MX. Incluye `formatoPorcentaje` con espacio duro («8 %»): `Intl` en es-MX da «8%», contra la regla tipográfica de DESIGN.md.
  - `GraficaBarras`, `GraficaLinea` y `GraficaDonut`, en SVG propio.
- Catálogo: sección «Indicadores y gráficas» (`DemosGraficas.tsx`).
- DESIGN.md documenta los componentes y la paleta en uso.

**Decisiones:**
- **Cifra del indicador** en Fraunces y con cifras tabulares, como dice DESIGN.md (`--texto-cifra-destacada`). La guía de visualización pide la sans y cifras proporcionales; manda el sistema del proyecto, y queda anotado en DESIGN.md.
- **Donut:** la guía lo desaconseja para comparar. Se incluye porque lo pide el PLAN, solo para ver un reparto de un vistazo, con leyenda que da valor y porcentaje, y tabla. De la 5.ª parte en adelante va en «Otros» (`--color-borde-control`), como dice DESIGN.md.
- **Rótulos:** solo se rotula un valor por gráfica (el más alto en barras, el último en una línea de una serie). Con varias líneas, leyenda y tooltip, sin rótulos al final que puedan chocar.
- **Recharts** queda para dispersión y predicción: este paso no lo carga.

**Desborde corregido:**
- **Síntoma:** a 360 px con texto al 125 %, la sección desbordaba 20 px.
- **Causa:** el SVG de barras y líneas tenía el ancho medido, y después, con `viewBox`, su proporción le daba a la rejilla ese mismo ancho mínimo, así que el contenedor no podía encogerse.
- **Solución:** el SVG va en posición absoluta dentro de la zona, que ya tiene su alto.
- **Segunda causa:** el estado de error dentro del marco sumaba el relleno del marco, el de `EstadoError` y el botón «Reintentar», que reserva el ancho de «Reintentando…» para no saltar: 347 px de mínimo. Con `sinMarco`, `EstadoError` y `EstadoVacio` ya no ponen relleno lateral, porque lo pone su contenedor (cambio sobre el 3.7).
- Se localizó con pruebas de diagnóstico temporales, ya borradas, que miden el ancho mínimo de cada elemento.

**Verificación** (Chromium contra `next dev`):
- `graficas.spec.ts` (nueva):
  - comparación con texto para lectores y color según sea buena o mala noticia; sin comparación no hay icono; datos de ejemplo; cargando;
  - error sin «$ 0» y reintento que trae el dato;
  - barras de 24 px como mucho y sin leyenda con una serie; tooltip con el puntero y con el teclado, y anuncio de cada valor;
  - leyenda en orden y colores de la paleta;
  - vista de tabla con los mismos datos y vuelta a la gráfica;
  - donut con «Otros» y porcentajes;
  - axe y sin desborde a 360 px con texto al 125 % en los dos temas.
- `catalogo.spec.ts`, con la sección nueva: contraste AA de todas las muestras en los dos temas, axe y capturas.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio. El lint obligó a calcular los ángulos del donut sin reasignar variables durante el render.

**No verificado:** Firefox, WebKit, lectores de pantalla reales y el modo de colores forzados (la textura de respaldo de la guía no se ha implementado; queda para la fase 7 si la auditoría la pide).

### 3.7 · `EstadoVacio`, `Esqueleto` y `EstadoError` (2026-11-01)

**Componentes** (`components/ui/`), sin dependencias nuevas:
- `EstadoVacio.tsx` (de servidor): icono de Lucide a 2,5rem con trazo de 1 px en `--texto-tenue`, sin círculo porque la única forma circular grande es el sello. Título, descripción y acción, con marco o `sinMarco`.
- `EstadoError.tsx`: `CircleAlert` y título en `--color-error`. Título y descripción van en `role="alert"`, sin el botón. «Reintentar» carga mientras dura la promesa. Admite una segunda acción.
- `Esqueleto.tsx`: `Esqueleto` (con `sobre="superficie"` en café, la excepción de las tarjetas), `EsqueletoLineas` y `ZonaCargando` (`aria-busy` y «Cargando…» para lectores).
- `styles/componentes.css`: `.esqueleto` y `@keyframes esqueleto-pulso`. Sin pulso con movimiento reducido, salvo que se elija «completo» en el panel: la utilidad `motion-reduce:` de Tailwind no respetaba esa elección.
- `Tabla` usa ya `Esqueleto` en su estado de carga. El catálogo muestra la tabla vacía con `EstadoVacio` y una tabla con error con `EstadoError`.
- Catálogo: sección «Estados vacío, de carga y de error» (`DemosEstados.tsx`). El reintento falla la primera vez y carga la segunda.
- DESIGN.md documenta los tres componentes y las clases nuevas (`.pila-notificaciones`, `.notificacion` y `.esqueleto`) en la lista de clases explícitas.

**Desborde corregido:** a 360 px con texto al 125 %, la acción «Llamar al restaurante» no cabía, y la columna única de la rejilla tomaba su ancho mínimo, así que toda la sección desbordaba 23 px. Los botones del sistema no parten el texto (`whitespace-nowrap`). En `EstadoVacio` y `EstadoError` las acciones pueden pasar a dos líneas (WCAG 1.4.10) y el relleno lateral baja a 1rem en móvil. Se localizó con una prueba de diagnóstico temporal, ya borrada. **Para el 3.2 o la fase 6:** decidir si `Boton` debe poder partir su texto en general cuando no cabe.

**Verificación** (Chromium contra `next dev`):
- `estados.spec.ts` (nueva):
  - el error se anuncia sin leer el botón, y el reintento carga, vuelve a fallar y después muestra el dato;
  - `ZonaCargando` con `aria-busy`, su texto para lectores y el esqueleto oculto;
  - el esqueleto pulsa, y no pulsa con movimiento reducido en el panel;
  - sobre una superficie, el esqueleto es de otro color;
  - axe a 360 px con texto al 125 % en los dos temas, sin desborde.
- `tabla.spec.ts` y `catalogo.spec.ts`, con la sección nueva: contraste AA de todas las muestras (incluido el icono tenue del vacío, ≥ 3:1), axe, capturas y sin desborde a 360 px.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox, WebKit y lectores de pantalla reales.

### 3.6 · `Tabla` responsiva, `Paginacion` y `Pestanas` (2026-11-01)

**Componentes** (`components/ui/`), sin dependencias nuevas:
- `Tabla.tsx` (sin `"use client"`, para usarla desde páginas de servidor):
  - Columnas con `celda`, `numerica`, `principal` y `ocultarEnTarjeta`; acciones por fila, fila seleccionada, estado cargando y huecos para el vacío y el error.
  - Desde 768 px pinta la tabla; por debajo, tarjetas con contraetiqueta. Las dos vistas se pintan y el CSS muestra una.
- `RegionDesplazable.tsx`: isla de cliente que mide si el contenido desborda (con `ResizeObserver`) y solo entonces entra en el tabulador, como el cuerpo de los diálogos.
- `Paginacion.tsx`: enlaces con la página en la URL. Exporta `paginasVisibles` y `hrefConParametro`, que conserva los demás parámetros.
- `Pestanas.tsx`: patrón de pestañas de WAI-ARIA, propio, sin Radix: no hace falta otra dependencia para el teclado y así la sincronización con la URL queda en el mismo sitio.
  - La pestaña de la URL se lee con `useSyncExternalStore`: en la hidratación vale la primera y luego la real, sin desajuste. El lint rechazó la primera versión, que hacía `setState` dentro de un efecto.
  - La URL se actualiza con `replaceState`, sin una entrada de historial por clic. La página puede pasar `valorInicial` desde sus `searchParams` para acertar en la primera pintura.
- Catálogo: sección «Tabla, paginación y pestañas» (`DemosTabla.tsx`), con:
  - una tabla de reservas con insignias, acciones y fila seleccionada;
  - tablas cargando y vacía;
  - paginación ligada a `?pagina=` y cuatro muestras fijas;
  - pestañas ligadas a `?pestana=` y otras en columna estrecha.
- DESIGN.md documenta los tres componentes.

**Revisión visual** (390 px, texto al 125 %, tema claro):
- Las tarjetas de la tabla habían perdido el estilo de contraetiqueta: un `div` envolvía cada par y `.contraetiqueta > dt` dejaba de aplicarse. Se cambió por un `Fragment`.
- «Página 1 de 12» se partía en dos líneas. En móvil, «Anterior» y «Siguiente» muestran solo la flecha, con el nombre en `aria-label`, y la cifra va en una sola línea.

**Verificación** (Chromium contra `next dev`):
- `tabla.spec.ts` (nueva):
  - semántica de la tabla a 1024 px (`caption`, `scope`, cifras al final y tabulares, fila seleccionada) y tarjetas con `dt`/`dd` a 390 px, sin desborde;
  - la región se enfoca y se desplaza con la flecha a 800 px, y sale del tabulador a 1600 px;
  - cargando con `aria-busy` y esqueleto oculto;
  - paginación: URL, `aria-current`, la última sin «Siguiente» para lectores, la 1 sin parámetro y la vista móvil;
  - pestañas: flechas, Inicio, Fin, ciclo, un solo tabulador, URL, nombre con contador y recarga;
  - axe a 390 px con texto al 125 % en los dos temas.
- `catalogo.spec.ts`, con la sección nueva: contraste AA de todas las muestras en los dos temas, axe y capturas.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.

**No verificado:** Firefox, WebKit y lectores de pantalla reales.

### 3.4 · `Aviso` y `Notificacion` (2026-11-01)

`Tarjeta` e `Insignia` ya estaban hechas desde la fase 1; este paso completa el 3.4.

**Componentes** (`components/ui/`), sin dependencias nuevas:
- `Aviso.tsx`: tonos `info`, `exito`, `aviso` y `error`.
  - Filete y relleno al 12 % del color del estado, e icono del estado en su color. Título y texto en `--color-texto-principal`.
  - Admite una acción en línea y un botón «Descartar aviso».
  - `role="alert"` en error y `status` en el resto; `rol={null}` para avisos fijos.
  - Es de servidor: no lleva `"use client"`. Exporta `ICONOS_ESTADO`, `COLOR_ESTADO` y `TonoEstado` para reutilizarlos.
- `Notificacion.tsx`: `ProveedorNotificaciones`, `useNotificaciones()` (`notificar` y `descartar`) y `VistaNotificacion`, que es la parte visible y la que muestra fija el catálogo.
- `styles/componentes.css`: `.pila-notificaciones` (abajo, a todo el ancho en móvil y 24rem en la esquina final desde 40rem, por encima de las zonas seguras) y `.notificacion`, con sus animaciones de entrada y salida, que usan solo opacidad y transform.
- Catálogo: sección «Avisos y notificaciones» (`DemosAvisos.tsx`).
- DESIGN.md documenta los dos componentes.

**Decisiones conservadoras:**
- **Anuncio aparte:** el texto se lee en una región `aria-live="polite"` oculta a la vista, separada de la pila. Si la notificación visible fuera la región viva, el lector leería también «Deshacer» y «Cerrar notificación».
- **Pila:** `<section aria-label="Notificaciones">` solo existe mientras hay alguna; un punto de referencia vacío confunde.
- **Tiempo (WCAG 2.2.1):** información y éxito se cierran a los 6 s, con pausa mientras el puntero o el foco están encima. Error y con acción se quedan hasta cerrarlas. Como mucho tres; al llegar otra, sale la más antigua que se puede ir sola.
- **Filete:** el de la notificación es del color del estado, como en el aviso, para que el estado cambie el filete y no solo el tinte. El relleno es la superficie elevada, porque flota.
- **Diálogos abiertos:** Radix oculta a los lectores lo que queda fuera del diálogo, también la pila y su anuncio. Anotado en DESIGN.md: lo que se notifique durante un diálogo va en el propio diálogo.

**Verificación** (Chromium contra `next dev`):
- `avisos.spec.ts` (nueva): **6/6**.
  - Rol por gravedad, icono oculto a lectores, descartar y restaurar.
  - Anuncio en la región viva y la pila sin `aria-live`; sin región vacía al empezar.
  - Pausa de 7 s con el puntero encima y cierre al salir.
  - Error y con acción siguen a los 7 s; «Deshacer» se atiende y cierra.
  - Máximo de tres.
  - axe sin violaciones con dos notificaciones abiertas, a 360 px, texto al 125 % y en los dos temas, sin desborde.
- `catalogo.spec.ts`, con la sección nueva: verde. Incluye el contraste AA de todas las muestras en los dos temas (avisos y notificaciones fijas de los cuatro tonos), axe en los dos temas al 100 % y al 125 % y la captura de la sección.
- Captura revisada: notificaciones en claro a 360 px.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.
- Primer intento con 3 fallos, de la prueba y no del componente: el nombre «Notificaciones» también coincidía con la sección «Avisos y notificaciones». Se corrigió con `exact: true`.

**No verificado:** Firefox, WebKit y lectores de pantalla reales (al cerrar la fase y en la fase 7).

### Decisiones de la revisión de 3.1, 3.5 y 3.3 (2026-11-01)

El usuario aprueba los tres pasos y decide:

1. **Validación** (`lib/validacion/`):
   - El **correo fiscal del checkout** (`esquemaDatosFiscales.email`) sigue siendo opcional; si se escribe, se comprueba con `isValidEmail`, la regla del registro (formato, 100 caracteres y 64 antes de la @). Nuevo `correoOpcionalValidado` en `campos.ts`.
   - El **RFC de la factura del admin** (`esquemaFactura.clientRFC`) sigue siendo obligatorio, en mayúsculas y de hasta 13; una vez escrito, se comprueba con `RFC_REGEX` («El RFC no tiene un formato válido.»).
   - El **teléfono de la reserva** se queda como está. Anotado en NP-06: la validación real del formato es del servidor.
2. **Envío protegido** (`useEnvioFormulario`):
   - El campo trampa es la defensa principal.
   - Tiempo mínimo: **1 s** por defecto, para registro y reserva, y **0** en el inicio de sesión. Anotado en los pasos 4.16, 4.17 y 4.18 del PLAN.
   - El rechazo muestra «No se pudo enviar el formulario. Inténtalo de nuevo.»: invita a reintentar sin decir el motivo. Sustituye a «Revisa los datos…», que mandaba revisar unos datos correctos. Se exporta como `MENSAJE_ENVIO_RECHAZADO`.
3. **Títulos de diálogo** en DM Sans 600: sin cambios.

**Verificación:**
- `pnpm test:unidad`: 22/22, con casos nuevos: correo fiscal vacío, con espacios, sin dominio completo y con más de 64 antes de la @; RFC vacío, corto y de persona moral en minúsculas.
- `campos.spec.ts`: 11/11 en Chromium contra `next dev`. La prueba del envío demasiado rápido ahora fija `Date.now()` con `page.clock.setFixedTime` (los temporizadores siguen). Con 1 s ya no se podía garantizar enviar antes de tiempo, y la prueba anterior se saltaba esa parte si el relleno tardaba.
- Typecheck: 0 errores. Lint de los archivos tocados: limpio. Sin procesos abiertos.

### Escape de la unión de ancho cero de un emoji (2026-11-01)

Corrige las 2 líneas que encontró `pnpm revisar:invisibles`. Las dos tenían el emoji del cocinero, una secuencia de hombre, U+200D (unión de ancho cero) y sartén, con el U+200D escrito literal desde `a032603`:
- `features/dashboard/admin/data/usersMock.tsx:59` (icono del rol «Cocina»).
- `features/dashboard/cliente/components/tabs/TrackingTab.tsx:43` (estado «preparando»).

Ahora se escribe como escape: `\u{1F468}\u200D\u{1F373}`. Los otros emojis de esas líneas no contienen caracteres prohibidos y se dejan como están. DESIGN.md no admite emojis como iconos; se sustituirán al rediseñar esas pantallas: `usersMock` en la fase 5, y `TrackingTab` según lo que se decida en NP-19, porque `/dashboard/cliente` aún no existe.

**Verificación:**
- Evaluado con Node, el escape produce los mismos códigos que el original (`1f468 200d 1f373`), así que se ve igual.
- `pnpm revisar:invisibles`: 270 archivos, sin hallazgos.
- Typecheck: 0 errores.
- Lint: limpio en `usersMock.tsx`. En `TrackingTab.tsx` quedan 2 errores `no-explicit-any` (líneas 7 y 91), que ya estaban en `HEAD` y no son de la línea tocada.
- Sin capturas: el cambio no altera lo que se muestra.

### Script que rechaza caracteres invisibles (2026-11-01)

A raíz de los escapes `\uXXXX` que la herramienta de escritura convirtió en caracteres literales durante el 3.1 (ver su entrada), se añade una comprobación automática. No es un paso del PLAN.

- `scripts/revisar-caracteres-invisibles.mjs` y `pnpm revisar:invisibles`. Revisa los archivos versionados y los nuevos no ignorados (`git ls-files --cached --others --exclude-standard`) de `app`, `components`, `lib`, `features`, `hooks`, `config`, `tests` y `styles`, y salta los binarios.
- Falla, con código 1, ante controles bidireccionales (U+202A a U+202E y U+2066 a U+2069), caracteres de ancho cero (U+200B a U+200F) o U+FEFF fuera del inicio del archivo. Solo informa de archivo y línea, una vez por línea, para no volver a imprimir el carácter.
- Compara los códigos numéricamente, así que el script no contiene escapes ni caracteres invisibles.
- Va aparte de `revisar-bundle.mjs` porque ese necesita un build y este revisa el código fuente.
- Se añade a la definición de terminado del PLAN, **solo al cerrar cada fase**.

**Verificación:**
- En un repositorio temporal: detecta un control bidireccional en un archivo versionado y un carácter de ancho cero en uno nuevo sin añadir; deja pasar el BOM inicial y los archivos ignorados o fuera de las carpetas revisadas; detecta el BOM a mitad de archivo.
- Sobre la rama: la primera ejecución encontró 2 líneas, `features/dashboard/admin/data/usersMock.tsx:59` y `features/dashboard/cliente/components/tabs/TrackingTab.tsx:43`, previas a la rama (`a032603`). Se corrigen en el commit siguiente.
- `node --check` y lint del script: limpios.

### 3.3 · Campos de formulario (2026-11-01)

**Componentes** (`components/ui/`), sin dependencias nuevas:
- `Campo.tsx`: `Campo` (con `contador`, `codigo` y `revelable`), `AreaTexto`, `Selector` (nativo, con `marcador` y opciones con fondo y color del tema) y `MensajeError`. Todos con la etiqueta visible encima, y `aria-describedby` con la ayuda, el contador y el error. El contador funciona controlado o no.
- `Casilla.tsx`: `Casilla` e `Interruptor`, casillas nativas.
- `CampoTrampa.tsx` y `AnuncioFormulario.tsx`.
- `hooks/useEnvioFormulario.ts`: `propsFormulario` (`onSubmit`, `onInput`, `noValidate`), `errores`, `errorGeneral`, `enviando` y `anuncio`. Lee los datos del propio formulario por `name` (`leerFormulario`: booleano en casillas, número en `type="number"`, texto en el resto) o con `obtenerDatos`. Usa `erroresPorCampo` del 3.1.
- Catálogo: sección «Campos de formulario» (`DemosCampos.tsx`), con la matriz de estados del campo (vacío, con valor, foco, error, deshabilitado y solo lectura), las variantes, casillas e interruptores en todos sus estados y un formulario completo con los esquemas del 3.1.

**Decisiones conservadoras:**
- Ante el campo trampa relleno o un envío demasiado rápido, el formulario no envía y muestra un mensaje neutro («No se pudo enviar. Revisa los datos e inténtalo de nuevo.»), sin fingir un éxito. Si una persona fue demasiado rápida, el segundo intento ya pasa.
- El tiempo mínimo es de 3 s por defecto y se puede poner a 0. En el inicio de sesión (4.17) debe ser 0: con autorrelleno, una persona envía en menos de un segundo.
- Si `alEnviar` lanza un `Error` con mensaje, ese mensaje es el error general. Quien llame decide qué texto mostrar: los mensajes genéricos de autenticación son responsabilidad de 4.17 y 4.18 (NP-15).
- La marca de la casilla se dibuja sobre un `span` con su relleno, bajo el input transparente. Con la marca como hermana del input, su contraste se medía contra la página y, sin marcar, solo se ocultaba con `opacity`.
- Casilla e interruptor se alinean con el borde de los campos mediante márgenes negativos, sin reducir los 44 px del área táctil (visto en la captura).
- No hay estado «hover» en los campos de texto: DESIGN.md no lo define.

**Verificación** (Chromium contra `next dev`):
- `campos.spec.ts` (nueva) + `catalogo.spec.ts`: **24/24** (1 omitida: el 404 de producción), en la primera tanda y otra vez tras alinear la casilla y el interruptor.
- `campos.spec.ts` cubre:
  - etiqueta en cada control y errores enlazados con `aria-describedby` y `aria-invalid`;
  - `autocomplete`, `inputmode` y `spellcheck` en el formulario;
  - el campo trampa fuera de los lectores, del tabulador y del autorrelleno;
  - el recorrido con el tabulador en orden, y la barra espaciadora en la casilla y el interruptor;
  - el foco al primer inválido, con el anuncio «Revisa 6 campos: …» y el error que se borra al corregir;
  - el envío antes de 3 s, que no sale, y el segundo intento, que sí;
  - dos Enter seguidos que dan un solo envío;
  - el campo trampa relleno, que no envía;
  - el fallo del servidor, con `role="alert"` y conservando lo escrito;
  - la contraseña revelable y el contador anunciado («10 / 300 caracteres»);
  - el contraste no textual de filetes y pomos (≥ 3:1) y el del texto escrito y el marcador (≥ 4,5:1), en los dos temas;
  - el foco real igual que la muestra fijada.
- `catalogo.spec.ts` añade la sección al contraste de todas las muestras, a axe (0 violaciones en los dos temas, al 100 % y al 125 %), a las capturas y a la comprobación de desborde a 360 px.
- Typecheck 0. Lint de los archivos tocados limpio.

**No verificado:** Firefox y WebKit (cierre de la fase 3), lectores de pantalla reales (fase 7) y el uso en páginas reales (fases 4 y 5).

### 3.5 · `Dialogo`, `PanelLateral` y `DialogoConfirmacion` (2026-11-01)

**Dependencias:** `@radix-ui/react-dialog@^1.3.1` y `@radix-ui/react-alert-dialog@^1.2.1`, publicadas el 2026-10-12 (la misma familia que el Popover que ya se usaba).

**Componentes** (`components/ui/`):
- `Dialogo.tsx`: `Dialogo` (centrado, `normal` 32rem o `amplio` 44rem) y `PanelLateral` (`fin` o `inicio`, a toda la altura, con zonas seguras), más `CerrarDialogo` para cerrar desde un botón propio. Controlados o no, con `disparador`, `titulo`, `descripcion` (se enlaza con `aria-describedby`; si no hay, no se apunta a nada), `pie` y `cerrable` (mientras es `false`, ni Esc, ni el velo, ni «Cerrar» lo cierran, y «Cerrar» queda con `aria-disabled`).
- `DialogoConfirmacion.tsx`: AlertDialog (`role="alertdialog"`). El foco empieza en «Cancelar»; el velo no lo cierra; `destructiva` usa `peligro-confirmar`; mientras `alConfirmar` trabaja, el botón carga y se bloquean «Cancelar» y Esc; si falla, se queda abierto con el error (`role="alert"`). `useConfirmacion()` lo ofrece como promesa, para sustituir `if (!confirm(...)) return;` sin cambiar el flujo.
- `comun-dialogo.tsx`: título y descripción, `useFocoDeRetorno` y `CuerpoDialogo`.
- Estilos en `styles/componentes.css`: `.velo-dialogo`, `.caja-dialogo`, `.panel-lateral` y `.cuerpo-dialogo`, con animaciones solo de opacidad y transform y duraciones de token (con movimiento reducido duran 0,01 ms).
- Token nuevo `--velo-dialogo` (oscuro `rgb(10 8 6 / 0.72)`, claro `rgb(30 24 19 / 0.5)`), añadido primero a DESIGN.md; `tokens.css` sigue siendo copia literal de su bloque (comprobado).
- Catálogo: sección «Diálogos» (`DemosDialogo.tsx`) con siete demostraciones: guardar con bloqueo de cierre, contenido largo, panel de pedido, menú lateral, confirmación destructiva, confirmación que falla y `useConfirmacion`.

**Decisiones conservadoras:**
- Título en `--texto-titulo-interfaz` (DM Sans 600), como dice la jerarquía de DESIGN.md para los diálogos. Al principio lo puse en Fraunces y lo corregí al releer la tabla.
- El botón «Cerrar» va el último en el orden del tabulador (arriba a la derecha a la vista), para que el foco empiece en el contenido o en la primera acción.
- Sin disparador, Radix devuelve el foco a un `Trigger` que no existe y el foco se perdía (lo detectó la prueba de `useConfirmacion`). `useFocoDeRetorno` guarda el elemento enfocado al abrir y lo devuelve al cerrar.
- `CuerpoDialogo` solo se vuelve enfocable si su contenido desborda (axe `scrollable-region-focusable`); si cabe, no añade una parada inútil al tabulador.
- En el `PanelLateral`, las acciones del pie van siempre apiladas a todo el ancho, con la principal arriba: a 125 % no cabían en una fila y se partían de forma desigual (visto en la captura).
- En la confirmación de demostración, el botón de cancelar dice «Conservar reserva» y no «Cancelar», para no chocar con «Cancelar reserva».
- Al cargar, el nombre accesible del botón pasa a «Cancelando…» (la etiqueta se oculta); las pruebas lo localizan por su posición.

**Verificación** (Chromium contra `next dev`):
- `dialogos.spec.ts` (nueva) + `catalogo.spec.ts`: **26/26** (1 omitida: el 404 de producción). En la primera tanda salieron 10 fallos. Siete eran de las propias pruebas (`innerText` en mayúsculas por `text-transform`, un clic que Playwright no da sobre `aria-disabled` y el nombre del botón que cambia al cargar). Tres eran del código y se corrigieron: la vuelta del foco sin disparador, el cuerpo desplazable no enfocable y un desborde a 360 px por la etiqueta larga de un disparador del catálogo.
- Cubren la trampa de foco (Tab y Mayús+Tab), Esc, la vuelta del foco, la página de detrás inerte para los lectores y sin desplazamiento, el bloqueo de cierre mientras guarda, el clic en el velo (cierra el diálogo y no la confirmación), el cuerpo desplazable con `overscroll-behavior: contain` y el pie a la vista a 390 × 640, la posición del panel en sus dos lados, la carga y el error de la confirmación, `useConfirmacion`, el movimiento reducido y el apilado a 360 px con texto al 125 %.
- axe sin violaciones (WCAG 2.2 AA) y contraste de texto ≥ 4,5:1 e iconos ≥ 3:1 con **cada diálogo abierto**, en los dos temas y al 100 % y 125 %. Las capturas están en `test-results/catalogo/dialogos/`.
- Typecheck 0. Lint de los archivos tocados limpio.

**No verificado:** Firefox y WebKit (quedan para el cierre de la fase 3) y lectores de pantalla reales (fase 7).

**Visto de paso (para el 3.9):** en `.contraetiqueta`, los filetes de `dt` y `dd` no se alinean cuando las dos celdas tienen distinto alto (queda un escalón en la línea). Es anterior a este paso.

### 3.1 · Validación con zod (2026-11-01) — D-05

**Dependencia:** `zod@^4.6.7`, publicada el 2026-10-12. Es la única librería de validación del front. Ya estaba en el lockfile la 3.25 como dependencia transitiva de ESLint; ahora entra como dependencia directa.

**Archivos** (`lib/validacion/`):
- `reglas.ts`: límites y expresiones **sin zod**. Es la fuente única. `utils/validators.tsx` pasa a reexportarla (mismos nombres, las 10 expresiones idénticas byte a byte, comprobado con `comm`), así que login, registro y `frm_reset` no cargan zod hasta que se rehagan (4.17–4.19).
- `saneamiento.ts`: NFC, sin caracteres de control (en los textos de varias líneas se conserva el salto), sin controles bidireccionales (U+202A–202E, U+2066–2069), recorte y tope de 5.000 caracteres. Conserva el U+200D de los emoji compuestos.
- `campos.ts`: correo del registro (formato y tamaños del API) y del acceso, correo con la regla del navegador para el admin, nombre (1–2 palabras, letras, con vocal, sin triples, ≤ 50), teléfono (10 dígitos; admite `+52` y separadores), lada, contraseña nueva (5 requisitos y sin secuencias) y de acceso (≥ 8), RFC, CP y números con mínimo. `MENSAJES.accesoIncorrecto` = «Correo o contraseña incorrectos.».
- `formularios.ts`: acceso, registro (con datos personales en la contraseña y `aPayloadRegistro`, que da el contrato exacto de `POST /auth/sign-up`), perfil, reserva por pasos (`crearEsquemaReservaHorario(ahora)`), dirección y datos fiscales del checkout, y del admin: usuario (alta y edición), platillo, promoción, factura, movimiento de caja, propina, nómina, proveedor y orden de compra. También `erroresPorCampo`, para el hook del 3.3.
- `archivos.ts`: vacío, tamaño (imagen ≤ 5 MB, hoja ≤ 2 MB), extensión, MIME declarado y firma de bytes (JPEG, PNG, WebP, AVIF `avif`/`avis`, XLSX `PK 03 04`). La firma debe coincidir con la extensión. `ACEPTA` da el atributo `accept`.
- Pruebas: `tests/unidad/validacion.spec.ts` con `playwright.unidad.config.ts` (sin servidor ni navegador) y el script `pnpm test:unidad`.

**Decisiones conservadoras:**
- **Mismas reglas que hoy en cada formulario**, aunque sean flojas: la reserva solo exige texto en el teléfono y `\S+@\S+\.\S+` en el correo; el RFC de la factura del admin solo es obligatorio y de hasta 13; el correo fiscal del checkout no se valida; el CP del perfil admite hasta 5 caracteres. Endurecerlas es una decisión aparte (cambiaría el comportamiento al sustituir los formularios).
- Únicas reglas nuevas: el saneamiento (lo pide el paso); un tope de 100 en el correo del acceso (es el límite de la columna, ninguna cuenta lo supera, y evita evaluar la expresión sobre textos largos); la fecha de inicio ≤ fin en promociones, porque la pide el 5.10; y el formato `AAAA-MM-DD`/`HH:MM` en la reserva, que los `type="date"`/`"time"` ya garantizan.
- Las claves de cada esquema son las del estado actual de cada formulario. Los formularios que envían el estado entero (perfil y admin) usan `z.looseObject`, para que `id`, `tags`, `imageUrl`, etc., lleguen intactos.
- La contraseña no se sanea: se envía tal cual se escribió.
- zod 4.6 cuenta la longitud en puntos de código (igual que un `varchar` de Postgres); `maxLength` cuenta unidades UTF-16. Solo difiere con emoji (el campo de emoji de las promociones); queda documentado y probado.
- La herramienta de escritura convirtió los escapes `\uXXXX` en caracteres literales invisibles (incluidos los bidireccionales, un riesgo de tipo «Trojan Source»). Se reescribieron como escapes ASCII y se comprobó que no queda ninguno.

**Verificación:**
- `pnpm test:unidad`: **22/22** (2,2 s). Incluye un `.exe` renombrado a `.png` que declara `image/png` (se rechaza), un PNG renombrado a `.jpg`, SVG, archivos vacíos, el límite exacto de 5 MB, 2 MB en hojas, entradas de 5.001 caracteres y una entrada patológica para la expresión del correo resuelta en < 200 ms.
- Typecheck 0. Lint de los archivos nuevos y tocados limpio. Login, registro y `frm_reset` tienen los mismos 3 errores y 5 avisos de antes (no se tocaron).
- Recorrido contra `next dev` en Chromium de `/login`, `/register` y `/frm_reset` (las rutas que importan las reglas) a 390 y 1440 px: 5/6. El fallo, `/register` a 1440, es el aviso de desarrollo de `next/image` «…was detected as the Largest Contentful Paint (LCP). Please add `loading="eager"`…» sobre el fondo decorativo. Se repite igual (2/2) y **también con el `utils/validators.tsx` de HEAD**, así que es previo al 3.1: viene del fondo del 1.9 y solo aparece en `next dev` (las comprobaciones del 1.9 fueron contra el build). No se añade a `excepciones.ts`, que solo puede decrecer. Se resuelve en el 4.18, junto al LCP de la portada (4.3).

**No verificado:** que zod no entre en el bundle de login y registro se deduce de los imports (`reglas.ts` no importa nada); no se hizo build, porque el paso no toca `next.config` ni rutas de servidor.

### Medición de rendimiento móvil de la fase 1 · verificada (2026-11-01)

**Medida por el usuario** con `scripts/comparar-rendimiento.mjs`, desde una terminal con el editor cerrado. Resultado en `D:\dev-cache\rendimiento\2026-11-01-23-11\resumen.md`. Lighthouse 12.8.2, móvil con limitación simulada, mediana de 3:

| Commit | Mediana | Ejecuciones | FCP | LCP | TBT | CLS | SI | benchmarkIndex |
|---|---|---|---|---|---|---|---|---|
| `766855a` (cierre de la fase 0) | **74** | 69 / 75 / 74 | 2415 ms | 4339 ms | 289 ms | 0,079 | 3455 ms | 2068 |
| `d6407c9` (cierre de la fase 1) | **76** | 74 / 76 / 76 | 1207 ms | 5194 ms | 209 ms | 0,084 | 1342 ms | 2070 |

- **Sin regresión** (+2 puntos), así que se descarta la bisección. Queda **verificado** el pendiente del 1.7: la bajada que se veía con VS Code abierto era del equipo, no del código.
- **LCP de la portada:** sube de 4339 a 5194 ms, mientras FCP (−1208 ms), TBT (−80 ms) y SI bajan. Se trata en el paso **4.3**: imagen de portada precargada, ancho ajustado al hueco y sin precargas innecesarias.
- El script borró los worktrees, pero quedan las carpetas `node_modules` en `D:\dev-cache\rendimiento\arboles\` (fuera del repo; no se borran sin permiso del usuario).

**Rama.** `feature/rediseno-web-componentes` sale de `feature/rediseno-web-cimientos` (`d6407c9`) y no de `feature/rediseno-web`, porque el PR de la fase 1 aún no está fusionado y la fase 3 parte de sus tokens, su catálogo y sus componentes. Al fusionar ese PR, esta rama solo añadirá sus propios commits. Esta anotación va aquí, y no en la rama de la fase 1, para no cambiar una rama que ya está en el remoto.

---

## Fase 1 · Cimientos y tokens (y adelantados de la fase 3)

### Cierre de la fase 1 (2026-11-01)

**Verificación completa.** Es la del commit `b94d87d` (1.9). Después no se tocó código: solo la anotación de una excepción, este script y la documentación.

| Comprobación | Resultado |
|---|---|
| Build de producción | correcto en 170 s; tabla de rutas igual que en el 1.8 |
| Catálogo fuera del build (`revisar-bundle`) | 890 archivos sin rastro |
| Chromium: 19 rutas × 5 anchos, 42 rutas, marca, preferencias, imágenes, almacenamiento, cabeceras | 164/164 (13 omitidas: catálogo, solo en dev) |
| Firefox | 162/162 |
| WebKit | 163/163 |
| Typecheck | 0 |
| `pnpm audit` | 7 críticas / 66 altas / 53 moderadas / 10 bajas, igual que tras el 1.10 (al empezar la fase: 7 / 70 / 54 / 11). Las críticas de Next 16.0.7 se resuelven con D-01 (fase 2) |
| Excepciones del recorrido | 18 al empezar la fase → 12 |

**Lighthouse completo** (mediana de 3, con VS Code abierto; no vale para comparar el rendimiento móvil):

| Página | Móvil | Escritorio | CLS móvil / escritorio |
|---|---|---|---|
| `/` | 60 | 97 | 0,084 / 0,079 |
| `/login` | 76 | 99 | 0 / 0,008 |
| `/menu` | 80 | 99 | 0,005 / 0,002 |
| `/promociones` | 76 | 98 | 0,084 / 0,074 |
| `/reservations` | 68 | 97 | 0,117 / 0,079 |

Accesibilidad 90–92, buenas prácticas 96 y SEO 100 en las 10 combinaciones.

**Pendientes «no verificado» de la fase, revisados:**
- **1.5 · CLS de las fuentes en Lighthouse:** medido. Coincide con el CLS sin fuentes medido en el 1.5. El salto de `/` (0,084) es del hero heredado y el de `/reservations` (0,117) también es previo; se rehacen en las fases 4.3 y 4.x.
- **1.6 · Rutas de panel en el navegador:** las 42 rutas pasan en los tres motores.
- **1.10 · Firefox, WebKit, `test:e2e` completo y las 42 rutas:** hecho; ver la tabla.
- **Excepción «was preloaded using link preload»:** estaba anotada como «solo next dev», pero **también aparece en producción**. Se comprobó en 9 rutas públicas a 390 y 1440 px. Son los CSS de los módulos de `app/error.tsx` y `app/not-found.tsx`, que Next precarga en todas las rutas. Es un aviso del navegador, no un error. Se reanota: la resuelven 2.17 y 4.23, al rehacer esas páginas sin módulo CSS. Corregirlo ahora sería adelantar pasos de fases posteriores.
- **1.4 · Contraste en las rutas públicas:** sigue sin verificar si los 3 nodos que quedan (`/login` 2, `/reservations` 1) son los de antes; esas pantallas se rehacen en la fase 4.
- **1.7 · Causa de la bajada de rendimiento móvil:** sin confirmar. Ver «Medición de rendimiento móvil».

**Medición de rendimiento móvil.** Por orden del usuario, no se hace dentro de VS Code. `scripts/comparar-rendimiento.mjs` hace lo siguiente:
- Mide `/` en móvil en `766855a` (cierre de la fase 0) y en HEAD.
- Monta cada commit en su propio worktree en `D:\dev-cache\rendimiento\arboles`, con instalación, build y `next start` en 3100.
- Pasa Lighthouse 12.8.2 tres veces y se queda la mediana. Anota FCP, LCP, TBT, CLS, SI, el `benchmarkIndex` y la RAM libre.
- Guarda `resumen.md`, `resumen.json`, los JSON y los registros en `D:\dev-cache\rendimiento\<fecha>\`, fuera de `test-results/`.
- Con `--biseccion`, si la bajada llega a 5 puntos, busca el primer commit responsable por bisección.
- Se niega a medir si VS Code, un navegador o un servidor de Next o Lighthouse siguen abiertos. Lo comprobó dentro de VS Code: detectó VS Code Insiders.
- Borra los worktrees al terminar, también si algo falla.

En este cierre, la medición dentro de VS Code dio 60 en `/`. Sus dos primeras ejecuciones tuvieron el `benchmarkIndex` en ~1.480 y la tercera, con el equipo normal, dio 74. Esa dispersión es la razón de medir con el equipo libre.

**PR.** En el remoto no existen `feature/rediseno-web` ni esta rama: la fase 0 se fusionó solo en local (`517a3bb`). Abrir el PR exige subirlas, y el agente no hace `git push`, así que lo hace el usuario. El texto del PR está en `D:\dev-cache\rediseno\pr-fase-1.md`.

### 1.9 · Imágenes: cargador de Cloudinary y lista de hosts (2026-11-01)

**Archivos nuevos:**
- `config/seguridad/hosts-permitidos.ts`: fuente única de los orígenes externos.
  - **Imagen:** `res.cloudinary.com` solo bajo `/dcb1tspbj/image/upload/`, y Supabase Storage.
  - **Conexión:** `api.cloudinary.com`.
  - **Marco:** `www.google.com` (mapa de `/about`) y `upload-widget.cloudinary.com`.
  - Expone `origenApi()` para la CSP de la fase 2.
- `lib/imagen/cargador-cloudinary.ts`: `f_auto,q_auto,c_limit,w_<ancho>`. Quita las transformaciones que ya traiga la URL y conserva versión, carpetas y extensión.
- `lib/imagen/origen.ts`: valida el origen. Acepta rutas locales, public IDs y URL `https` de hosts permitidos. Rechaza `http`, `data:`, `javascript:`, `//host`, puertos, credenciales, consultas en Cloudinary y rutas con `..`.
- `components/ui/Imagen.tsx`: `alt` y `sizes` obligatorios, y `decorativa` para `alt=""`. Si el origen no vale o la imagen no carga, pinta el respaldo descrito en DESIGN.md: panel café con el molino, en la misma caja y conservando el `alt`.

**`next.config.js` → `next.config.ts`,** para importar la lista de hosts sin depender de que el Node del despliegue elimine tipos:
- `remotePatterns` generado desde la lista: fuera Unsplash, pravatar y `lh3`, que solo usaban maquetas con `<img>` normal o la fachada que daba 403.
- `dangerouslyAllowSVG: false`.
- `formats: ["image/avif", "image/webp"]`.

**Usos:**
- `SmartImage` pasa a ser un alias de `Imagen`.
- `CldImage` sale del login, el registro y la portada de `/menu`; `next-cloudinary` queda solo para `CldUploadButton`.
- **Login y registro:**
  - El valor de reserva del fondo pasa a ser el de `INITIAL_SETTINGS` en lugar de `food-3955317_1280`, que daba 404. Así la foto tampoco cambia al leer los ajustes tras hidratar.
  - El fondo es decorativo, con `sizes` del 50 %.
- **`/menu`:** `priority` pasa a `preload`, que es lo mismo en Next 16 (`priority` está obsoleto). `CategoryHeroImage` gana `sizes`.
- **`/about`:** la fachada usa `Imagen`. Como `lh3` no está permitido, muestra el respaldo sin pedir la foto.
- **`<img>` del admin y `PromosSection`:** reciben `width` y `height` acordes a su caja, sin cambiar su CSS. No pasan a `Imagen` porque pintan URL pegadas a mano y un host no listado cambiaría el comportamiento (NP-36).
- **Código muerto:** las imágenes de NP-35 no se tocan.

**Excepciones:** salen 4 de `excepciones.ts`: las dos del fondo de login, su aviso de consola y la de `lh3`. Esta última se cierra antes de la fase 4, como consecuencia del paso.

**Pruebas:**
- `imagenes.spec.ts`, nueva:
  - validación del origen (24 entradas, `null` y la URL que genera el cargador);
  - el fondo del login sale de Cloudinary con el cargador;
  - login y registro piden una sola foto, sin cambiarla tras hidratar;
  - con Cloudinary bloqueado aparece el respaldo con su tamaño y color;
  - la fachada muestra el respaldo con su `alt` y 0 peticiones a Google;
  - la portada de `/menu` se precarga.
- El inspector del recorrido añade el tipo `dimensiones`: toda `<img>` necesita `width` y `height`, o `fill` con `sizes`. Se comprueba en las 19 rutas públicas × 5 anchos y en las 42 rutas.
- `marca.spec.ts` busca el logo de la cabecera dentro de su `<nav>` y espera a que aparezca. Con `.first()` a secas, en Firefox leía a veces el logo del pie, porque la cabecera se monta solo en el cliente.

**Fallos encontrados y corregidos durante la verificación:**
1. La expresión del public ID no admitía un punto en el primer segmento. Por eso `food-3955317_1280_zstvf7.jpg` salía como respaldo; la prueba lo detectó.
2. En Firefox, `/register` abortaba la descarga del fondo (`NS_BINDING_ABORTED`) por dos causas:
   - el valor de reserva no coincidía con el de los ajustes;
   - con `onError`, `next/image` reasigna `img.src` al montar y cada vez que cambia la función, y `Imagen` pasaba una nueva en cada render.

   `Imagen` ya no usa `onError`: escucha el evento `error` en el propio `<img>` con una ref estable y, al montar, detecta si la imagen ya había fallado antes de hidratar.

**Verificación contra el build de producción** (toca `next.config`):
- **Build:** correcto en 170 s, con la tabla de rutas idéntica. `revisar-bundle` revisó 890 archivos sin rastro del catálogo.
- **Chromium:** 164/164, con 13 omitidas del catálogo, que solo existe en dev.
- **Firefox:** 162/162, con 15 omitidas.
- **WebKit:** 163/163, con 14 omitidas y sin cierres por memoria.
- **Lighthouse completo** (30 ejecuciones, con VS Code abierto):
  - Móvil 60/76/80/76/68 (`/`, `/login`, `/menu`, `/promociones`, `/reservations`).
  - Escritorio 97/99/99/98/97.
  - Accesibilidad 90–92, buenas prácticas 96 y SEO 100.
  - `/login`, `/menu` y `/promociones` suben 3–4 puntos en móvil.
  - `/` baja de 69 a 60 por la carga del equipo, no por el código: en sus dos primeras ejecuciones el `benchmarkIndex` cayó a ~1.480 (lo normal es 1.920–1.990) y el TBT subió a ~730 ms. La tercera, con el equipo normal, dio 74. FCP (1,21 s) y CLS (0,084) son idénticos, y el paso no toca la portada.
- **Typecheck:** 0.
- **Lint de los archivos tocados:** ningún problema nuevo; en total, 1 error y 2 avisos menos (`SmartImage` y `/about`).
- **Revisión visual del respaldo:** login con Cloudinary bloqueado y fachada de `/about`, en los dos temas.

**No verificado:**
- Que el API siga sirviendo fotos desde Supabase, y bajo qué ruta.
- Los hosts del widget de subida.

Los dos quedan en NP-36.

**Entorno:**
- Antes de que el usuario cerrara su navegador y reiniciara el Explorador, tres builds seguidos abortaron por falta de memoria virtual: quedaban 2,9 GB libres de 16 GB, con `explorer.exe` en 1,7 GB comprometidos. Después había 7,2 GB libres.
- Dos `tsc` también abortaron (código 134) y pasaron al repetirlos sin cambios.
- Un monitor con `tail -f` dejó vivos su `tail` y su `grep` al terminar la tanda, y se mataron por PID. Desde entonces, las tandas se vigilan con bucles que terminan solos.

### Adelantados de la fase 3 · 3.0, 3.2 y parte de 3.4 (2026-11-01)

**Adelantados de la fase 3 (2026-11-01): 3.0 · catálogo de desarrollo, 3.2 · `Boton` y `BotonEnlace`, y `Tarjeta` e `Insignia` del 3.4.** Tres commits, en este orden para que cada uno compile solo: Boton → Tarjeta e Insignia → catálogo. **Componentes** (`components/ui/`): `Boton` (variantes `primario`, `secundario`, `fantasma`, `peligro` y `peligro-confirmar`; tamaños `normal` y `compacto`; `soloIcono`; `anchoCompleto`; deshabilitado con `aria-disabled` y enfocable; cargando con `aria-busy`, «Enviando…» en la misma celda que la etiqueta para que no cambie el ancho y sin atenuar; bloqueo de clics repetidos con una referencia, también antes de que React repinte; si `onClick` devuelve una promesa, carga hasta que termina), `BotonEnlace` (`next/link`, sin `"use client"`), `Insignia` (6 tonos, iconos por defecto en los 4 de estado, fondo al 12 % de su color, contador con descripción para lectores) y `Tarjeta` (con enlace extendido desde el título, no disponible con motivo escrito, cargando con esqueleto y error con Reintentar). Se borran con `git rm` el `components/ui/Button.tsx` huérfano y `types/ui.ts` (solo lo usaba él). **Estados fijados:** variantes `al-pasar` y `al-pulsar` en `globals.css` (hover solo con `@media (hover: hover)`; nada cambia si está deshabilitado u ocupado) que también responden a `data-demo`, igual que el anillo de foco: el catálogo muestra cada estado con la misma CSS que el real, y una prueba comprueba que el hover y el foco reales pintan lo mismo que las muestras. **Catálogo:** `app/(dev)/catalogo/page.dev.tsx`; `next.config.js` añade `dev.tsx` a `pageExtensions` solo en `PHASE_DEVELOPMENT_SERVER`, y la página llama a `notFound()` en producción. Cada muestra lee su contraste medido en vivo; selector de tema, texto y movimiento. **Decisiones conservadoras:** (a) el esqueleto de la tarjeta usa `--color-superficie-cafe`, no `--color-superficie-elevada` (blanco sobre hueso en claro, invisible); anotado en DESIGN.md; (b) el estado cargando no lleva `aria-disabled` ni se atenúa; (c) la tarjeta no disponible no se atenúa, porque su texto no es un control inactivo y debe cumplir AA; (d) los textos de ejemplo del catálogo (platos, cifras) solo existen en `next dev`. **Verificación:** `catalogo.spec.ts` contra `next dev` 13/13 en Chromium, Firefox y WebKit: contraste de **las 67 muestras en los dos temas** con una implementación independiente (color pintado por el navegador, incluido `color-mix`, y fondos compuestos), **mismas cifras en los tres motores**, mínimos 5,74:1 en oscuro y 4,93:1 en claro (insignia de aviso), tabla en DESIGN.md; axe 0 violaciones (WCAG 2.2 AA) en los dos temas al 100 % y al 125 %; hover y foco reales = muestras fijadas; deshabilitado y cargando enfocables y anunciados; ancho igual al cargar; 3 clics síncronos y un doble clic real atendidos una vez; fallo que vuelve a reposo con `role="alert"`; tarjeta en error que reintenta; foco que rodea la tarjeta con enlace; sin desborde a 360 px con texto al 125 %. En WebKit el foco de la tarjeta se comprueba sin Tab, porque WebKit, como Safari, no lleva el Tab a los enlaces por defecto. Capturas por sección, tema y tamaño en `test-results/catalogo/`. **Producción** (por tocar `next.config`): build correcto en **212 s**; tabla de rutas idéntica a la del 1.8, sin `/catalogo`; `scripts/revisar-bundle.mjs`: 889 archivos de `.next/server/app` y `.next/static` sin rastro del catálogo; `/catalogo` responde 404 en `next start`; Chromium recorrido + 42 rutas + marca + preferencias + catálogo **145/145**; Firefox **98/98**; WebKit **98/98** (10 pruebas se repitieron porque el navegador se cerró por falta de memoria, con 1,9 GB físicos libres; al repetirlas pasaron); Lighthouse completo (30 ejecuciones, 33 min): móvil 69/73/76/73/69 y escritorio 97/98/97/98/97, accesibilidad 90–92, buenas prácticas 96 y SEO 100, todo igual al 1.8 ±2 (los componentes aún no se usan en ninguna página). Typecheck 0; lint de los archivos tocados limpio.

### 1.8 · Logo y sello locales

Logo y sello locales (D-07): `components/marca/trazados.ts` (trazados del logo y del molino), `Logo.tsx` (`fill="currentColor"`, `role="img"`, `aria-label="El Quijote, restaurante"`) y `SelloCasa.tsx` (molino en `currentColor` dentro de dos círculos de 1 px en `stroke-acento` con `vector-effect: non-scaling-stroke`, separados ≈3 px; 4,5rem/6rem; `aria-hidden`; **creado pero aún sin montar**: se coloca en la fase 4). **Origen:** el SVG de potrace de Cloudinary `logo_dark_fvfcdk.svg` (descargado con `curl` sin `f_auto`; no se usó el MCP), 11.040 bytes. **Optimización** con un script propio fuera del repo: transformación aplicada, caja recortada al dibujo (`viewBox 0 0 104.6 53.7`), curvas consecutivas fusionadas solo si una cúbica las aproxima con error ≤1/600 del original (577 → 377 segmentos) y coordenadas con 1 decimal: **5.851 bytes el SVG completo** (<6 KB). Con 1 decimal sin fusionar seguía en ~9 KB. Comparación a doble tamaño: idéntico a la vista; 2,1 % de los píxeles de tinta cambian en los bordes. `Navbar`, `Footer` y `AdminSidebar` usan `<Logo>` en `text-texto-principal`; en la cabecera superpuesta a la foto, `text-white`, como el resto de esa barra heredada. **Decisión conservadora:** cada logo va en una caja cuadrada del mismo tamaño que la imagen anterior (era un cuadrado de 600×600 con el dibujo al 87 % de ancho), así que cabecera, pie y barra lateral no cambian de medida; el tamaño nuevo llega con 3.11 y 3.13. A 14 px (cabecera móvil) «Restaurante» no se lee, igual que antes. **WebKit:** con `aspect-square` + alto, la caja se ensanchaba con el ancho intrínseco del SVG (300 px) y desbordaba la cabecera en los anchos móviles de casi todas las rutas públicas; se corrigió con `size-*` explícito. Iconos: `app/icon.svg` (molino hueso sobre `#14100C`, 1.461 bytes) y `app/apple-icon.png` por convención de archivos; `metadata.icons` retirado (adiós al 404 de `logo_text_white_ktnpgg.png` y al `.ico` remoto). Los PNG del manifiesto (`icon-192`, `icon-512`, también `maskable`: el molino ocupa el 52 %, dentro de la zona segura) y `public/icons/apple-touch-icon.png` se regeneran con el mismo diseño (antes en naranja `#e85d04`); este último se conserva porque `public/sw.js` lo precarga (se retira con 2.7). `public/icons/icon.svg` (naranja, sin referencias) se borra con `git rm`. Se retiran de `excepciones.ts` las 2 entradas de `/logo.svg`. Verificación contra el build de producción: `marca.spec.ts` nuevo (SVG local; el del pie toma `--color-texto-principal` en oscuro y en claro; el de la cabecera sobre foto sigue blanco; 0 peticiones a logos remotos; `/icon.svg`, `/apple-icon.png` y los PNG del manifiesto responden 200) en verde en Chromium, Firefox y WebKit; Chromium recorrido + 42 rutas + marca + preferencias **144/144**; Firefox y WebKit **92/97** (los 5 fallos de cada uno son el 403 de `lh3` en `/about`, previo; desaparece el aborto del logo remoto de Firefox); typecheck 0; lint de los archivos tocados sin errores nuevos (baja 1 error y 3 avisos). **CLS tras el 1.8** (mismo método que en el 1.7): portada 0,099/0,082; `/menu/pedido/checkout` a 390 px 0,077 → 0; `/profile` 0,357/0,181 y `/dashboard/cocina` 0,101 a 390 px **no cambian**: su salto no viene del logo; se revisa al rehacer esas pantallas (fase 5 y 3.13). Lighthouse completo (30 ejecuciones): `viewport` aprobado en las 30; accesibilidad 90–92, buenas prácticas 96 y SEO 100 sin cambios; rendimiento móvil 71/71/77/72/70 y escritorio 97/98/98/98/97 (igual que en el 1.7 ±2); CLS de Lighthouse en la portada 0,084 en móvil y 0,079 en escritorio. La lámina de revisión del logo y el sello en ambos temas se generó fuera del repo para que el usuario la juzgue.

### 1.7 · Viewport y color de tema

Viewport y color de tema: `viewport-fit=cover` sin `maximum-scale` ni `user-scalable`; `color-scheme: dark` (el tema no sigue al sistema: oscuro por defecto); `theme-color` = `--color-fondo` del oscuro (`#14100C`) en el HTML; manifiesto con `background_color` y `theme_color` del mismo token (antes `#ffffff` y el naranja `#e85d04`); `apple-mobile-web-app-status-bar-style` pasa de `default` (barra blanca) a `black`. Los colores van como literales en `COLOR_FONDO_POR_TEMA` (`lib/preferencias/preferencias.ts`), porque ni la meta ni el manifiesto aceptan variables CSS; `public/preferencias.js` repite el claro. **Decisión:** en tema claro el script **inserta otra meta delante** de la de Next en lugar de editarla, porque React 19 reconoce sus `<meta>` por los atributos y, si cambian antes de hidratar, crea un duplicado (comprobado: salían dos). Tras hidratar, `aplicarPreferencias` pone el color del tema en todas (ya no usa `getComputedStyle`). Verificación contra el build de producción: `preferencias.spec.ts` 5/5 en Chromium, Firefox, WebKit y iPhone 13 (nueva prueba: barra `#14100C` en oscuro con una sola meta; `#F4EEE3` en claro ya en `DOMContentLoaded`; vuelve a oscuro desde el panel; sin errores de script); Chromium recorrido 19×5 + 42 rutas **137/137** (8,7 min); typecheck 0; lint de los archivos tocados sin errores (1 aviso previo en `preferencias.js`). Lighthouse completo (30 ejecuciones, 32 min): auditor **`viewport` aprobado en las 30**; accesibilidad 90–92, buenas prácticas 96 y SEO 100 iguales al 0.9; rendimiento escritorio 97/98/98/97/97 (`/promociones` y `/reservations` suben de 83 a 97); **móvil 71/71/75/74/70, por debajo de la referencia del 0.9** (74/79/82/83/85; LCP simulado ≈5 s, FCP 1,2 s). **No verificado:** la causa de esa bajada; el 1.7 solo cambia etiquetas `<meta>`, y los JSON del 0.9 se sobrescribieron, así que no se puede comparar auditor a auditor (posibles causas: precarga de 3 fuentes desde el 1.5 o carga del equipo); se revisa al cerrar la fase. **Firefox 83/95 y WebKit 90/95, por defectos previos ajenos al 1.7** (primera vez que el recorrido corre en esos motores en la fase): en Firefox la petición del logo remoto de Cloudinary se aborta (`NS_BINDING_ABORTED`, 7 pruebas; lo elimina el 1.8), y en `/about` el 403 de `lh3.googleusercontent.com` (Fase 4) llega como `http`/consola en lugar de `red`/`imagen`, que es lo que cubren las excepciones (Firefox 5, WebKit 5). No se amplió `excepciones.ts` (solo puede decrecer): **pendiente de decidir al cerrar la fase** si esas dos entradas de `lh3` se extienden a los tipos `http` y `consola`. WebKit también rechaza registrar `/sw.js` en `http://localhost` (lo resuelve 2.7). **CLS medido** (build del 1.7, Chromium, sin interacción, 4 s tras `load`, 390/1440 px): portada 0,099/0,090 (Lighthouse 0,084 en ambos); 38 de 46 mediciones de panel ≤0,007; por encima de 0,1: `/profile` 0,357/0,187 y `/dashboard/cocina` 0,101 a 390 px; `/menu/pedido` y el checkout ≈0,08. Comparten la `Navbar` heredada, cuyo logo era una `<img>` sin dimensiones: se vuelve a medir tras el 1.8. **Zonas seguras:** con `viewport-fit=cover`, las barras fijas heredadas (cabecera, avisos de PWA) no suman `env(safe-area-inset-*)` y en un iPhone en horizontal pueden quedar bajo la muesca; se corrigen al sustituirlas (3.11 y 3.13). Solo lo usa ya `.contenedor-pagina`.

### 1.6 · Preferencias de accesibilidad sin parpadeo

Preferencias de accesibilidad sin parpadeo: `lib/preferencias/preferencias.ts` (lectura validada con versión, migración única de la clave `theme`), `public/preferencias.js` (aplica `data-tema`, `data-tamano-texto` y `data-movimiento` antes de pintar), `ScriptPreferencias`, `PreferenciasProvider` (`useSyncExternalStore`, sincroniza pestañas y ajusta `theme-color` leyendo `--color-fondo`), `useTheme` lee del contexto, `ConditionalNavbar` sin lógica de tema propia, `ThemeProvider` vacío borrado y **panel de accesibilidad funcional adelantado del 3.12** en `Navbar` y `AdminSidebar`. **Decisión:** script como archivo estático síncrono en lugar de en línea, para no usar `dangerouslySetInnerHTML` (condición de D-03); preparado para `nonce`. Verificación contra `next dev` en Chromium: `preferencias.spec.ts` 4/4 (claro + muy grande + reducido presentes al insertarse `<body>`, fondo claro `rgb(244, 238, 227)` y raíz a 20 px; oscuro por defecto; migración de `theme` y borrado; el panel cambia el tema y lo recuerda al recargar); `almacenamiento.spec.ts` 2 pasan y 1 omitida (IndexedDB en Firefox) tras repetir una navegación abortada por la carga del equipo; recorrido de 19 rutas públicas a 1440 px 19/19; typecheck 0 errores; lint de los archivos nuevos limpio. **No verificado en navegador:** las rutas de panel con el 1.6 (el servidor dev tardaba 19–53 s por petición y las navegaciones se abortaban); por análisis, todos los usos de `useTheme` están dentro de `PreferenciasProvider`.

### 1.5 · Fuentes autoalojadas

Fuentes: Fraunces (normal e itálica, ejes `opsz` y `SOFT`) y DM Sans (`opsz`) **autoalojadas con `next/font/local`** desde `app/_fuentes/` (woff2 variables, subconjunto latino, licencias OFL incluidas); sin `<link>` ni `preconnect` a Google; alias `font-display`/`font-body` → `--font-titulos`/`--font-texto`; `h1` y `h2` en Fraunces por estilo base; `DesignSystemProvider` deja de escribir colores y fuentes en `<html>` (pisaba el acento con `#e85d04` tras hidratar; D-12) y conserva el radio; los estilos en línea con `'Fraunces'`/`'DM Sans'` pasan a los tokens. **Por qué local:** con `next/font/google` el build falló dos veces al descargar las fuentes desde Turbopack (1.694 s el primero; `curl` y el `fetch` de Node sí conectaban). **Build completo con fuentes locales: correcto en 3.868 s (64 min)** por saturación del equipo (5,8 GB de RAM con ~4 GB reservados por VS Code Insiders; antes tardaba 128–142 s). Verificación (Chromium, 390 y 1440 px): 0 peticiones a `fonts.googleapis.com`/`fonts.gstatic.com`; cuerpo en DM Sans y títulos en Fraunces; **saltos por el respaldo**: el CLS con solo la fuente de respaldo es igual al CLS real (`/` 0,099/0,099 y 0,090/0,091; `/login` 0; `/menu` 0,003; cajero ≤0,0002), así que el cambio de fuente no añade salto; el CLS de `/` es del hero heredado, y su `h1` (DM Sans 900 en mayúsculas) cambiaría hasta 77 px de alto si la fuente llegara tarde: se revisa al sustituirlo en 4.3. Botones sobre acento: texto oscuro verificado numéricamente (7,98:1 y 10,15:1 en oscuro; 5,51:1 y 7,37:1 en claro; AA) y criterio para los ~60 sitios con texto blanco fijado en DESIGN.md y en 5.20. **No verificado:** CLS de fuentes en Lighthouse (las 12 ejecuciones fallaron por saturación; queda para el cierre de la fase).

### 1.4 · Tokens y estilos base

Tokens y estilos base: `styles/tokens.css` (copia literal de DESIGN.md, verificada con `diff`), `styles/componentes.css` (las 13 clases explícitas, solo con tokens), `globals.css` reescrito (estilos base: fondo y texto, `:focus-visible`, `::selection`, `scroll-margin-top`, `100dvh` con respaldo, `text-size-adjust`, `touch-action`, `text-wrap`, barra de desplazamiento y `caret`/`accent-color` con tokens; utilidades a mano eliminadas; alias temporales y clases heredadas recoloreadas, inventario en 5.20). **Decisiones conservadoras:** (a) `@custom-variant dark` activo mientras el tema no sea claro (DESIGN.md actualizado), porque el oscuro no lleva atributo y con `[data-tema="oscuro"]` las 123 clases `dark:` heredadas quedarían apagadas; (b) el cuerpo usa `var(--font-texto)` (pila de respaldo de sistema hasta 1.5) en lugar de Ibarra Real Nova, a raíz del hook de impeccable; (c) `.btn-secondary` pasa a filete (variante `secundario` de DESIGN) y `.link-secondary` a acento, porque `--color-secondary` (café) sería ilegible como texto; (d) `bg-surface/10` ahora es 10 % real (la utilidad a mano daba 90 %; 1 uso). Verificación: typecheck 0 errores; `rg "#e85d04" styles` vacío; 9 rutas clave a 1440 px en Chromium contra `next dev`: fondo `rgb(20, 16, 12)` y 0 errores de página en todas; nodos con violación de contraste de axe **125 → 46** (ninguna ruta empeora: `/` 7→0, `/login` 4→2, `/menu` 4→0, `/promociones` 7→0, `/reservations` 7→1, cajero 36→8, cocina 22→20, mesero 38→15, admin 0→0); recorrido de 19 rutas públicas a 1440 px 19/19. **No verificado:** si los 3 nodos públicos que quedan (`/login` 2, `/reservations` 1) son los mismos que antes (axe no guardó el detalle); build, Firefox, WebKit y 42 rutas quedan para el cierre de la fase. La comparación visual contra la línea base deja de aplicar desde este paso: las capturas se regeneran como nueva base cuando el usuario apruebe el aspecto.

### 1.10 · Retirada de dependencias

Retirada de 8 dependencias, una por commit (`fd70b5c` cloudinary-react, `43bb9a3` cloudinary-core, `50a26b7` firebase, `b262527` @supabase/ssr, `a29206d` @supabase/supabase-js, `13b8c2d` @types/grecaptcha, `0eb8160` next-themes, `9ba0a04` autoprefixer); ninguna se importaba (solo comentarios; `next-themes` ya estaba sin uso, por eso se retiró antes del 1.6). Cada commit pasó typecheck y build (8–16 min por la instalación; el build solo ≈2 min). `pnpm audit` pasó de 7 críticos / 70 altos / 54 moderados / 11 bajos a **7 / 66 / 53 / 10** (firebase −3 altos y −1 bajo; supabase-js −1 alto y −1 moderado). Recorrido final de 19 rutas × 5 anchos en Chromium contra el build de producción: 93 de 95 y, tras documentar la excepción NP-33 del fondo de login (petición abortada en producción), `/login` 5/5. **No verificado:** Firefox y WebKit, `pnpm test:e2e` completo y la comparación visual de 42 rutas (quedan para el cierre de la fase).

### 1.3 · Store

Store: 9 imports (`RootState`, solo tipos) pasan a `@/store/index` y se borra `store.ts` (versionado). Verificación: typecheck 0 errores; lint de los 9 archivos con los mismos problemas de la línea base (44 errores y 23 avisos, ninguno nuevo por el cambio). **No verificado en navegador:** el cambio solo afecta a tipos, que desaparecen al compilar; no se recorrió ninguna ruta.

### 1.2 · Código muerto, lote 2

Código muerto, lote 2: 41 archivos versionados borrados con `git rm` (27 componentes de admin, `layout/Sidebar`, `ActiveSidebar`, `ThemeToggle`, `handlerEmailActions`, `utils/supabase/*`, 4 hooks, `types/navigation.ts`, `inventoryMock`, `cocinaMock`), confirmados sin importadores con un grafo desde `app/` y `proxy.ts`. Cambios por dependencias: los tipos `NavItem` y `SidebarSection` pasan a `config/navigation/tipos.ts` (los usan los `*.nav.ts`); **se conserva `types/ui.ts`** porque `components/ui/Button.tsx` (huérfano, lo sustituye 3.2) lo importa; el resto huérfano queda en NP-35. Verificación: typecheck 0 errores; lint de los archivos tocados limpio; ninguna ruta afectada (0 importadores). **No se ejecutaron** build ni comparación visual (el paso no cambia estilos, configuración ni rutas).

### 1.1 · Código muerto, lote 1

Código muerto, lote 1 (los 4 archivos estaban versionados: se borraron con `git rm`; quedan en el historial; no hubo que moverlos fuera del repo). Verificación: typecheck 0 errores, build correcto en 128 s, `rg` sin referencias; comparación visual de 42 rutas × 5 anchos en Chromium contra `next dev`: 183 de 205 capturas idénticas byte a byte y 22 con mismas dimensiones y ≤4 KB de diferencia, todas en páginas que no usan el código borrado (reloj de cocina, imágenes de `/about`) = ruido de renderizado; `/dashboard` (redirección) se compara por su destino. Duración de una pasada de 42 rutas: 9,5–14 min.

---

## Fase 0 · Línea base y herramientas

### Fase 0 cerrada · 0.9 y referencia de Lighthouse

**Fase 0 cerrada** (0.1–0.9; 0.8 hecho en planificación). 0.9: `scripts/medir-lighthouse.mjs`. Accesibilidad 90–92, buenas prácticas 96 y SEO 100 coinciden con ESTADO §12. El rendimiento no entra en ±5 en todas las páginas (mediana de 3 ejecuciones frente a una sola medición antigua): **referencia nueva** — móvil `/` 74, `/login` 79, `/menu` 82, `/promociones` 83, `/reservations` 85; escritorio 97, 98, 99, 83, 83. Producción: `almacenamiento` y `cabeceras` en verde en los 3 navegadores (32 pasan, 1 omitida; los `test.fail()` fallan como se espera).

### 0.7 · Sesión simulada y línea base visual

Sesión simulada y línea base visual (JWT de pruebas por rol, API simulada, 42 rutas × 5 anchos = 210 capturas en `test-results/linea-base/chromium/` y `rutas.txt`, Chromium contra `next dev`; las rutas de panel no redirigen a login; `/dashboard` → `/dashboard/admin` es el comportamiento esperado)

### 0.6 · Almacenamiento, caché y cabeceras

Almacenamiento, caché y cabeceras (`almacenamiento.spec.ts` en verde en Chromium, Firefox y WebKit contra `next dev`: `localStorage` sin claves fuera de la lista, `sessionStorage` e IndexedDB vacíos; el test de service worker/Cache Storage y `cabeceras.spec.ts` se omiten en dev y **quedan por ejecutar contra el build de producción al cerrar la fase 0**, con `test.fail()` enlazados a 2.2, 2.6 y 2.7/2.14)

### 0.5 · Recorrido de páginas

Recorrido de páginas (19 rutas públicas × 5 anchos, 95/95 en Chromium contra `next dev`, con 18 excepciones documentadas en `tests/e2e/excepciones.ts`; las rutas de panel se recorren en 0.7 con sesión simulada; se ejecuta con `E2E_MODO=dev`)

### 0.3 · .env.example

`.env.example` (solo nombres; `.gitignore` con `!.env.example`)

### 0.4 · Playwright

Playwright (5 proyectos en verde; build ≈30 min en este equipo de 5,8 GB de RAM, por eso `webServer.timeout` es de 45 min)

---

## Decisiones del usuario registradas en el bloque de estado

**Decisiones del usuario tras el 1.8 (2026-11-01):** logo aprobado. (a) La excepción de `lh3.googleusercontent.com` en `/about` se amplía a Firefox y WebKit **en la misma entrada**: las dos que había (`red` e `imagen`) se funden en una con `tipo: ["red", "imagen", "http", "consola"]` y el campo `motores`; la cierra la fase 4. Como WebKit no pone la URL en el texto de «Failed to load resource», el vigilante de consola añade al detalle la URL de origen del mensaje (`m.location().url`). Comprobado contra el build del 1.8: `/about` a 360 y 1440 px en verde en Chromium, Firefox y WebKit. (b) **Al cerrar la fase 1**, investigar la bajada de rendimiento móvil con método: medir `/` en móvil en el commit de cierre de la fase 0 (`766855a`) y en el actual, mediana de 3 ejecuciones, sin ningún otro proceso y con el navegador y el editor cerrados; si la diferencia persiste, localizar el commit responsable (bisección sobre los commits de la fase 1). (c) Al parar cualquier tanda de pruebas, comprobar que no quedan procesos hijos (Lighthouse, navegadores, servidor) antes de lanzar otra. (d) Se adelantan de la fase 3 el catálogo (3.0), `Boton`/`BotonEnlace` (3.2) y `Tarjeta`/`Insignia` (parte de 3.4) para que el usuario los apruebe en el catálogo antes de seguir.

---

## Lecciones de entorno y política de verificación

**Tiempo de build tras reconfigurar la memoria virtual (2026-11-01):** 248 s el primero (compilación 107 s), **133 s** el segundo, 176 s y 219 s los del 1.8: de nuevo en el rango de 2–4 min (en el 1.5 fueron 64 min).

**Lecciones de procesos (1.8):** en este Windows en español, `netstat` no muestra `LISTEN` para el socket de escucha (salió como `CLOSED` con el PID del servidor): comprobar el puerto con `curl` o filtrando por `:3100` sin estado. Parar con TaskStop un script `sh` que lanza Playwright y Lighthouse **no mata a sus hijos**: el script siguió y su Lighthouse corrió en paralelo con otra tanda; parar por PID cada hijo. Playwright vacía `test-results/` en cada ejecución, incluidos los JSON de Lighthouse: ejecutar Lighthouse al final o guardar su salida fuera. Las reglas permanentes de la sesión están en un `CLAUDE.md` local, excluido en `.git/info/exclude`. Un `next dev` cortado dejó `.next/dev/types/routes.d.ts` escrito dos veces encima (el typecheck fallaba con 30 errores de sintaxis en ese archivo generado): se apartó fuera del repo y `next dev` lo regenera. Los navegadores de Playwright exigen `PLAYWRIGHT_BROWSERS_PATH=D:\playwright-browsers` en cada ejecución.

**Lecciones de entorno (1.5–1.6):** los vigilantes con `tail -f` sobreviven a su caducidad en Windows y consumen CPU (se cerraron 8 por PID): usar bucles que terminen; un script dejó vivo un `next start` en 3100 y Playwright lo reutilizó (`reuseExistingServer`), así que una tanda de pruebas «en dev» corrió contra el build anterior: comprobar el puerto libre antes de cada tanda y cerrar el servidor por PID al terminar; con el equipo saturado, ejecutar en secuencia, nunca en paralelo.

**Verificación proporcional (orden del usuario):** en pasos que no cambian estilos ni componentes, solo typecheck, lint de los archivos tocados y las rutas afectadas; la comparación completa de 42 rutas y la medición completa de Lighthouse (30 ejecuciones) solo al cerrar cada fase; en pasos intermedios, Lighthouse solo en las páginas que cambien. Para comparar visualmente: `LINEA_BASE_DIR` guarda fuera de `test-results/` (Playwright lo vacía), y como el ruido de render impide igualdad total, se mira que las dimensiones coincidan y que las diferencias sean mínimas y ajenas al cambio; la captura «antes» se obtiene restaurando HEAD en los archivos del paso (guardando un parche antes), no con `git stash` (falla con archivos borrados en el índice). Una ejecución de pruebas quedó sin resultado por corte de la sesión (2026-10-31); se repitió de una en una por navegador con `--workers=1` y 120 s por prueba, sin procesos huérfanos. Las claves de `dataService` (NP-12) solo aparecen en flujos con sesión: se comprobarán en 0.7.

**Política de verificación (decidida por el usuario):** en pasos intermedios, lint + typecheck + Playwright contra `next dev`. Build completo y pruebas contra `next start` al cerrar cada fase y en cualquier paso que toque `next.config`, cabeceras, imágenes, fuentes, metadatos, `proxy.ts` o rutas de servidor; las comprobaciones de CSP, `no-store` y secretos en el bundle solo contra el build de producción.

**Dudas no irreversibles:** elegir la opción más conservadora, anotarla aquí y continuar; preguntar solo si es irreversible, toca el backend o exige decisión de producto. Tiempo de build: ≈30 min antes de las excepciones de Avast y **142 s** después (2026-10-31); Lighthouse completo (30 ejecuciones) ≈33 min. Para el build y las pruebas se inyectan valores ficticios (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) desde `playwright.config.ts`, sin tocar `.env`. Usar `corepack pnpm` (el pnpm global está roto). El disco `C:` está casi lleno: todo almacenamiento de herramientas va a `D:\dev-cache` (`TEMP`/`TMP`, `COREPACK_HOME`, `npm_config_cache`, `npm_config_store_dir`) y los navegadores de Playwright también a `D:` (paso 0.4). Sin `.env.local` de desarrollo, las pruebas usan variables públicas ficticias y la API simulada del paso 0.7.
