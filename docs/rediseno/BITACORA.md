# Bitácora del rediseño — El Quijote

> Detalle de cada paso completado: qué se hizo, decisiones conservadoras, verificación y lo que quedó sin verificar. El bloque «ESTADO ACTUAL Y SIGUIENTE PASO» de `PLAN.md` solo resume y remite aquí. Las entradas van de la más reciente a la más antigua; cada paso nuevo añade la suya arriba **en el mismo commit** que lo cierra.

---

## Ampliación (D-22 a D-38) · plan en `PLAN-AMPLIACION.md`

### P1 · Seguridad de la documentación (2026-11-03)

**Qué se hizo:**
- El repositorio es público, así que el detalle de vulnerabilidades sale de los documentos versionados. Los originales de `ESTADO.md` y `NOTAS-PENDIENTES.md` (estado `1b3fd9f`) se copiaron fuera del repo, junto con un registro de lo retirado y de los hallazgos abiertos comprobados contra el código.
- `NOTAS-PENDIENTES.md`: NP-01 a NP-11, NP-15, NP-20 a NP-22, NP-31 y NP-32 quedan como «pendiente de endurecer en el API», con su prioridad y remisión a `PLAN-AMPLIACION.md`. Se conserva la decisión del teléfono de la reserva (NP-06). NP-36 (punto 4), NP-40 y NP-35 en texto genérico.
- `ESTADO.md`: fila de seguridad del resumen, §14, anexo C completo, los códigos de `/api` sin sesión y el aviso lateral del anexo D, y dos líneas del anexo A, en texto genérico.
- `PLAN.md` (fila del cron en la lista de rutas públicas) y el `motivo` de esa ruta en `config/seguridad/rutas-api-publicas.ts`, sin mencionar lo que le falta.
- Nuevo `PLAN-AMPLIACION.md`: decisiones D-22 a D-38, paquetes P0 a P9 con casillas y criterios, pendientes para el usuario y la clasificación D-38 (se completa en P2).

**Aviso:** las ramas `feature/rediseno-web`, `-cimientos`, `-componentes` y `-seguridad` de `origin` ya contienen las versiones anteriores de estos documentos, y el historial local también. Esta corrección no las cambia: lo decide el usuario (sin push ni reescritura en la web).

**Verificación:** `rg` en `docs/`, `config/` y el código de rutas sin comprobación, secretos, commits del historial con secretos, contraseñas por defecto e interpolaciones explotables: sin detalle de vulnerabilidades abiertas. El cambio de `rutas-api-publicas.ts` es solo el texto de un `motivo` (sin efecto en la lógica).

---

## Fase 5 · Administración

### Cierre de la fase 5: en curso (2026-11-03), resumen para leer al volver

Los pasos 5.1 a 5.20 están hechos, cada uno en su commit (de `92bd7c8` a `be09aa6`). La verificación completa se cortó por el límite de uso.

| Comprobación | Resultado |
|---|---|
| Chromium en producción, batería completa | Administración 191/191 · públicas 124 + 90 · recorrido 95/95 |
| Firefox en producción, batería completa | Administración 191/191 · públicas 120 + 90 · recorrido 95/95 |
| WebKit en producción | Administración 191/191. **Pendiente:** públicas A1 (se lanzó al cortar; resultado sin leer), A2 y recorrido |
| Catálogo en dev | Chromium 73 + 68. **Pendiente:** Firefox y WebKit |
| `revisar:invisibles`, `revisar-bundle`, `pnpm audit` y lint global | **Pendientes** |

**Para retomar:**
1. Los scripts están en el scratchpad de la sesión: `ciclo-prod.sh` y `e2e-dev.sh` con `grupoA1.txt`, `grupoA2.txt` y `grupoA3.txt`.
2. Terminar WebKit en producción (A1, A2 y recorrido) y el catálogo en dev en Firefox y WebKit (`dev1.txt` y `dev2.txt`).
3. Después, invisibles, bundle, audit y lint, y escribir aquí el cierre.
4. Crear `feature/rediseno-web-pulido` (fase 6).

**Nuevas notas de esta fase:** NP-44 (cifras del inicio que el API no da), NP-45 (caja y facturas sin backend), NP-46 (preset de Cloudinary de marcador; disponibilidad y borrado de platillos solo locales) y NP-47 (`IdleLogout` sin montar).

**No verificado:** lectores de pantalla, dispositivos reales (tableta de caja, móvil de sala, monitor de cocina), Lighthouse (lo lanza el usuario) y el backend real (subidas, importación, exportación).

**Decisiones pendientes del usuario:** 2.5 (aplicar la CSP), NP-43 (posicionamiento) y NP-46/NP-47 (producto o backend).

### 5.20 · Retirar los alias y las clases heredadas (2026-11-03)

**Cambios:**
- **`styles/globals.css`: de 358 a 108 líneas.** Fuera:
  - el bloque de alias del paso 1.4: `--color-brand`, `-brand-dark`, `-surface`, `-text`, `-text-sec`, `-text-muted`, `-border`, `-secondary`, `--font-display` y `--font-body`;
  - la red de seguridad `@custom-variant dark`;
  - todas las «clases heredadas»: `.auth-*`, `.input-floating`, `.input-label`, `.btn-primary` y `.btn-secondary`, `.separator*`, `.alert-*`, `.link-secondary`, `.google-btn`, `.menu-card*`, `.promo-*` y `.skeleton*`;
  - las animaciones `marquee` y `slideRight`.
  - `.resaltado` (el `<span>` del API) pasa del degradado naranja con `--color-brand` al acento de la casa.
- **Últimos consumidores de alias:** `InstallPrompt` y `ConnectionStatus` (PWA), montados en todo el sitio, pasan a tokens. Usan `Boton`, `superficie-elevada` y `shadow-flotante`, y los iconos de conexión llevan tono de éxito o aviso.
  - De paso se corrigieron sus dos errores de lint previos (estado en efecto).
- **Código muerto retirado** (todo versionado y sin importar):
  - `features/dashboard/cliente/` (8 archivos, sin ruta);
  - `components/Button`, `Checkbox`, `FloatingInput`, `PhoneInput`, `PasswordToggleButton`, `PasswordRequirements`, `BackButton` y `SmartImage`;
  - los mocks `usersMock`, `mockData` y `suppliersMock`;
  - de `menuMock`, todo salvo el tipo `TagKey`.
  - **`IdleLogout` se conserva:** nunca se montó, tampoco antes del rediseño, y activarlo es de producto (NP-47).
- **Barridos (aceptación de 5.20) en `app`, `components`, `features`, `hooks` y `lib`:**
  - **Hex fuera de `tokens.css`: 0**, salvo el `theme-color` de `lib/preferencias/preferencias.ts`. Esa `<meta>` necesita un color literal; replica `--color-fondo` de cada tema.
  - Las categorías de ejemplo y la apariencia sin efecto de `restaurantData` pasan a tokens.
  - **`text-[Npx]`: 0.**
  - **`style={{` (estilos en línea): 0.**
    - Las muestras de color de las gráficas pasan a un SVG con `fill` (`Muestra`).
    - Las alturas dinámicas de la zona y del esqueleto se reservan con un SVG espaciador (`Espaciador`).
    - La dona se coloca en absoluto sobre él.
    - `Imagen` sigue pasando su prop `style`, como la API de `next/image`.
  - **Llamadas a `alert()` y `confirm()`: 0.** Las coincidencias que quedan son textos o comentarios.
  - **Clases heredadas, `bg-brand`, `text-brand`, `dark:` y blanco sobre acento: 0.**
  - **Colores por defecto de Tailwind en la UI: 0.** Quedan los valores de `GRADIENT_PRESETS`, que son datos del API (campo `color` de las promociones).
  - **SVG hechos a mano fuera de `components/marca`:** solo los del sistema de gráficas (`components/ui/graficas`, con el nuevo `Medidor`, adonde pasa la barra de nivel del inventario) y el molino de `Imagen`, que usa los datos de la marca.

**Verificación:**
- Typecheck limpio. Lint limpio en los archivos tocados, incluidos los dos errores previos de la PWA. Build correcto.
- Chromium en producción, batería completa en cuatro tandas: administración 191/191, públicas 124 + 90 (134 omitidas, del catálogo) y recorrido 95/95.
- Catálogo (dev), Chromium: 73 + 68.
  - La prueba de la leyenda de `graficas.spec` leía `style.background`; ahora lee el `fill` de la muestra.

**No verificado:** Firefox y WebKit (en el cierre de la fase, a continuación).

### 5.19 · Panel de cocina (2026-11-03)

**Cambios:**
- **`app/dashboard/cocina/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/cocina/CocinaPanel.tsx`, para una tableta o un monitor que se lee a distancia.
- **Misma lógica sobre los servicios locales:** las comandas se leen cada 5 s, y «Empezar» y «Marcar lista» avanzan el estado (nuevo → preparando → listo).
- **Retirado lo que no era verdad:**
  - el «12m Avg» fijo;
  - el botón «Entregado» de las listas, que no cambiaba nada (ahora dicen «Esperando al mesero»);
  - el «aviso enviado» del inventario, que no avisaba a nadie;
  - el banner descartable de existencias críticas (pasa a un `Aviso` con «Ver existencias»).
- **Indicadores:** en cocina (nuevas y en preparación) como protagonista, nuevas, listas para la mesa y existencias bajas.
- **Tres columnas desde `lg`:** nuevas, en preparación y listas para la mesa, con su cuenta.
  - Cada comanda lleva la mesa en Fraunces `--texto-titulo-2`, los platos en `--texto-titulo-interfaz` con la cantidad en negrita, y las notas con icono en tono de aviso.
  - Botón de **56 px** a todo el ancho. Su nombre accesible empieza por el texto visible y nombra la comanda.
- **Existencias en `PanelLateral`:** primero las bajas, con su nivel en texto.
- **Retirados:** `InventoryModal`, `KanbanColumn`, `KitchenHeader`, `KitchenStats`, `OrderCard` y `StockAlertBanner`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `cocina.spec` (nueva), 10/10. Comprueba:
  - que no queden «Avg» ni «Entregado»;
  - una comanda de nueva a lista, con su botón de 56 px o más y la notificación;
  - las existencias en el panel;
  - axe, sin desborde, a 360, 768, 1024 y 1440 px, en los dos temas.
- Captura revisada: oscuro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). Lectura a distancia en un monitor real.

### 5.18 · Panel del mesero (2026-11-03)

**Cambios:**
- **`app/dashboard/mesero/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/mesero/MeseroPanel.tsx`, pensada para el móvil.
- **Misma lógica sobre los servicios locales** (`TableService`, `MenuService`, `OrderService`):
  - tomar un pedido crea la orden (`addOrder`) y ocupa la mesa;
  - «Pedir la cuenta» (antes «Llamar al cajero») pasa la mesa a «lista».
  - Los servicios se leen al montar, sin `mounted` ni `return null`.
- **Retirados de la pantalla:**
  - la barra lateral propia (cuadro con la inicial y botones «Mesas» y «Pedidos»); la pestaña «Pedidos» no mostraba nada;
  - `SettingsService`, que solo servía para esa inicial.
- **Indicadores:** libres como protagonista (de cuántas), ocupadas y cuenta pedida. Más un filtro de estado.
- **Mesas en tarjetas:** nombre en Fraunces, capacidad, pedido actual y estado en `Insignia` (Libre, Ocupada, Cuenta pedida).
  - Botones a todo el ancho de **48 px**: «Tomar pedido» o «Añadir al pedido» y «Pedir la cuenta», con nombres accesibles que empiezan por el texto visible y nombran la mesa.
- **Pedido en `PanelLateral`:**
  - `Selector` de categoría y platos con «Añadir un…» y «Quitar un…» de 48 px, más la cantidad con `aria-live`.
  - Resumen del pedido, descuento (porcentaje o cantidad fija) y total en vivo.
  - Envío «Enviar a cocina · $ X» con notificación.
- **Se conserva** lo que hacía el pedido: el descuento se calcula y se ve, pero la orden se guarda con el total sin descuento. Corregirlo cambiaría la lógica de la orden; queda anotado aquí.
- **Retirados:** `OrderModal`, `TableCard` y `TableGrid`, con sus colores fijos y `bg-[#0a0a0e]`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `mesero.spec` (nueva) y el layout de paneles, 18/18. La nueva comprueba:
  - el pedido en una mesa libre, con botones de 48 px o más, dos platos, el 10 % de descuento a la vista, la mesa que pasa a ocupada y la notificación;
  - «Pedir la cuenta», que la deja en «Cuenta pedida»;
  - axe en la página y en el panel, sin desborde, a 360, 390, 768 y 1440 px, en los dos temas.
- Captura revisada: oscuro a 390 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). Un móvil real.

### 5.17 · Panel de caja (2026-11-03)

**Cambios:**
- **`app/dashboard/cajero/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/cajero/CajaPanel.tsx`, pensada primero para tableta.
- **Sin endpoint, como antes:** `cajeroMock` en memoria, ahora avisado (D-13).
- **Indicadores:** por cobrar como protagonista (con los tickets abiertos), cobrado hoy, tickets cerrados y ticket medio.
- **Por cobrar:** tarjetas grandes, a dos columnas en tableta, con la mesa en Fraunces, el cliente y el ticket, el total como cifra destacada, artículos y espera, y un botón «Cobrar $ X» a todo el ancho de **48 px** de alto.
- **Cobro en un diálogo:**
  - Forma de pago como opciones de 48 px (radios con su etiqueta).
  - En efectivo, «Recibido» con el cambio o lo que falta en vivo; avisa si no alcanza.
  - El resultado llega como notificación.
- **Cobrados hoy:** `Tabla`.
- **Formas de pago:** `GraficaDonut` calculada de los cobros. Antes eran porcentajes fijos del mock.
- **Buscador** por ticket, mesa o cliente.
- **Retirados:**
  - de `cajeroMock`: `PAYMENT_METHODS` y `PAYMENT_STATS` (clases de color fijas);
  - componentes: `BillingModal`, `PaymentDistribution`, `StatCard` y `TicketRow`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `caja.spec` (nueva) y el layout de paneles, 19/19. La nueva comprueba:
  - el botón de cobro de 48 px o más;
  - efectivo insuficiente («Faltan $ 8.50.»), cambio en vivo («$ 1.50»), el ticket que pasa a cobrados y la notificación;
  - la tarjeta sin campo de recibido y la búsqueda;
  - axe, sin desborde, a 360, 768, 1024 y 1440 px, en los dos temas.
- Captura revisada: oscuro a 1024 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). Una tableta real.

### 5.16 · Salud del sistema (rendimiento de BD) (2026-11-03) — NP-24

**Cambios:**
- **`app/dashboard/admin/db-performance/page.tsx`:** pasaba de 1504 líneas con paleta hex propia, estilos en línea y gráficas SVG hechas a mano a una página de servidor. La pantalla es `features/dashboard/admin/salud/SaludSistema.tsx`.
- **Mismos endpoints:** los ocho de `/db-metrics/*` (cpu, rw-ratio, autovacuum, storage, hot-tables, latency, connections, wait-events), pedidos a la vez cada 10 s, y `POST /db-metrics/vacuum-manual`.
  - Al refrescar no se borra lo que hay.
  - Si una lectura falla después de la primera, se conservan los datos.
- **Semáforo (NP-24):** un estado general, el peor de seis comprobaciones con los umbrales que ya usaba la pantalla:
  - procesador: 60 y 85 %;
  - conexiones: 60 y 80 %;
  - respuesta de consultas (p95): 50 y 100 ms;
  - esperas por bloqueo: 10 y 20 %;
  - limpieza: 30 % de datos viejos, o más de un día sin limpiar;
  - crecimiento: más de 100 MB en 24 h.
  - Cada comprobación va con su valor, su estado en texto y qué mide, en palabras de la casa: «Tiempo de respuesta», no «Latencia SELECT p95»; «Limpieza interna», no «Autovacuum» (D-20).
- **Indicadores:** procesador (protagonista), conexiones («14 de 100»), respuesta y espacio.
- **Detalle desplegable por área (`<details>`):**
  - procesador, con `GraficaLinea`;
  - lecturas y escrituras, con `GraficaDonut`;
  - limpieza por tabla;
  - espacio, con su gráfica;
  - tablas con más movimiento;
  - tiempos por operación (consultar, añadir, cambiar, borrar);
  - conexiones, con su gráfica;
  - causas de espera, traducidas.
- **«Limpiar ahora»** pide confirmación del sistema y avisa con notificaciones. Antes eran `alert()` con el error crudo.
- **Retirados** (sin uso): `KpiCard` y `charts/DonutChart`, y con ellos el campo `color` de `PAYMENT_DIST`. `features/dashboard/admin/components/` queda vacía.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `salud-sistema.spec` (nueva) y reportes, 24/24. La nueva comprueba:
  - «Todo en orden» con las seis comprobaciones y el desplegable que se abre;
  - el procesador al 90 %, que pone el semáforo en «Necesita atención»;
  - la limpieza con confirmación y su `POST`;
  - el error con «Reintentar»;
  - axe con todos los desplegables abiertos, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Captura revisada: oscuro a 1440 px, con todo abierto.

**No verificado:** Firefox y WebKit (al cierre de la fase). Los umbrales con datos reales de producción.

### 5.15 · Acerca del restaurante (panel) (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/about/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/acerca/AcercaAdmin.tsx`.
- **Lo que hacía era engañoso, y se dice:**
  - «Guardar» mostraba «guardado» sin llamar a nadie.
  - La vista previa (`AboutPreviewModal`) imitaba una página «Nosotros» que ya no existe: la de la fase 4 sale de la configuración (NP-43).
  - Ahora un aviso dice que son datos de ejemplo, que se editan en la visita y no se guardan. Cada bloque lleva su insignia (D-13) y ya no hay botón de guardar falso ni vista previa.
- **Bloques:**
  - **Identidad:** nombre, lema, razón social, RFC, descripción e historia, con contador.
  - **Contacto.**
  - **Horario:** hora de apertura y de cierre con etiqueta por día, e `Interruptor` «Cerrado», que deshabilita las horas.
  - **Lo que ofrece la casa:** lista sin emojis; añadir con Enter y quitar con un botón que lleva su nombre.
  - **Galería.**
- **D-18:**
  - La galería del mock traía tres fotos de `images.unsplash.com` y ahora empieza vacía.
  - Añadir una foto solo admite la nube propia (`esImagenPermitida`).
- **Retirados** (versionados): las seis secciones de `components/about/` y `AboutPreviewModal`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `acerca-admin.spec` (nueva), 8/8. Comprueba:
  - el aviso, que no haya «Guardar» ni «Vista previa» y que no salga ninguna petición a Unsplash, Pixabay ni Pravatar;
  - la foto de Unsplash rechazada y la de Cloudinary propia añadida;
  - el lunes cerrado con su hora deshabilitada y una característica añadida;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Captura revisada: claro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.14 · Ajustes (2026-11-03) — D-12

**Cambios:**
- **`app/dashboard/admin/settings/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/ajustes/AjustesAdmin.tsx`.
- **D-12:**
  - **Fuera la sección «Apariencia»** (colores, fuentes y radios) y `DesignSystemProvider`, que se retira de `AppProviders`. Solo fijaba `--radius-standard`, que ya no usaba nadie.
  - **Pasarelas:** fuera los campos «API Key» y «Secret Key», que eran inputs no controlados y no se leían ni se enviaban. Quedan el estado y el entorno en un diálogo «Ajustes», con un aviso de que las claves se gestionan en el sistema (NP-09).
  - También se retiraron la URL de *webhook* inventada, «Probar conexión» y el falso «Conexión verificada · hace 5 min».
- **Marca y textos del área de clientes:** se guardan en este navegador (`SettingsService`), como antes, y ahora lo dice un aviso.
  - El almacenamiento local se lee al montar, no al pintar en el servidor.
  - Las categorías destacadas son casillas.
- **Imagen del inicio de sesión (D-18):** antes el campo sugería «Unsplash, Pixabay». Ahora solo admite fotos propias, comprobadas con `esImagenPermitida`: la nube `dcb1tspbj`, un identificador de esa nube (el valor por defecto lo es) o una ruta del sitio.
- **Respaldos:** las mismas llamadas (`GET` y `POST /backups`, `DELETE /backups/:id`).
  - `Tabla` con estado en `Insignia`.
  - Crear avisa del resultado. Eliminar pide confirmación del sistema; antes borraba sin preguntar y sin comprobar la respuesta.
  - Se retiró la cifra inventada «Tamaño promedio 41.2 MB».
  - La programación (automático, frecuencia, hora, nube) era estado local que no se guardaba: va marcada como datos de ejemplo.
- **Trabajo sin conexión y pasarelas:** datos de ejemplo, marcados como tales, y «Aún sin efecto».
- **Retirados** (versionados y sin uso): `DesignSystemProvider` y las siete secciones de `components/settings/` (Appearance, Backup, Branding, GatewayModal, GatewaySection, Landscape, Offline). También `SettingRow`, `Toggle`, `SectionCard` y el `STATUS_CFG` de `settingsMock`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `ajustes.spec` (nueva) más acceso, portada, marca y recorrido de rutas, 145/145. Se incluyen porque `AppProviders` cambia en todo el sitio. La nueva comprueba:
  - que no queden «Apariencia» ni campos de clave o contraseña en la pasarela;
  - la imagen: Unsplash rechazada, el valor por defecto válido, y Cloudinary propia guardada en el almacenamiento;
  - los respaldos: `POST /backups` y `DELETE /backups/4` tras la confirmación;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Captura revisada: oscuro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.13 · Usuarios (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/users/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/usuarios/UsuariosAdmin.tsx`.
- **Mismas llamadas:** `GET /users`, `POST /users` y `PATCH /users/:id`, con el formulario o con `{ isActive }`. Mismo payload: en la edición, la contraseña vacía no se envía.
- **Indicadores:** personal activo (administración, caja, sala y cocina) como protagonista, usuarios, clientes e inactivos.
- **Lista:** `Tabla` con buscador, filtro de rol y filtro de estado. Nombre con correo, teléfono, rol y estado en `Insignia`.
  - Acciones: «Activar» o «Desactivar», con el nombre accesible que empieza por el texto visible, y «Editar».
- **`DialogoUsuario`:**
  - Valida con `esquemaUsuarioNuevo` y `esquemaUsuarioEdicion` (paso 3.1): nombre, apellidos, correo, teléfono, contraseña de 8 o más y rol.
  - Al crear solo ofrece los roles creables, sin administrador, como exige el esquema. Al editar ofrece todos.
  - La contraseña es opcional al editar y lo dice.
- **Sin `alert()` ni `confirm()`:**
  - Activar o desactivar pide confirmación del sistema; desactivar es destructiva y explica que no podrá entrar.
  - Los resultados llegan como notificación. Antes, `alert()` mostraba el `err.message` del API.
  - La carga fallida muestra «Reintentar»; antes, `alert()`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `usuarios.spec` (nueva), 8/8. Comprueba:
  - los errores del esquema, que no se ofrezca «Administrador» al crear y el `POST /users` exacto;
  - el `PATCH /users/2` de la edición sin `password`;
  - el `PATCH { isActive: false }` tras la confirmación;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Captura revisada: claro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.12 · Predicción de demanda (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/predictive/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/prediccion/Prediccion.tsx`.
- **Mismas llamadas:** el ranking (`GET /inventory/predictive/ranking?dias=7`) al entrar y el detalle (`GET /inventory/predictive/:id?dias=7`) al elegir un platillo. Cada uno con su carga, su error con «Reintentar» y el motivo del API cuando no hay datos.
- **Indicadores en palabras de la casa (D-20):**
  - **Margen de error** (protagonista; antes «WAPE»), con «La estimación simple falla un X %» (antes «baseline ingenuo»).
  - **Mejora sobre la estimación simple.**
  - **Crece más** y **Cae más**, con el nombre del platillo.
- **Previsión por platillo:** `Tabla` (tarjetas por debajo de 1024 px) con categoría, últimos y próximos 7 días, cambio y demanda en `Insignia`.
  - El nombre es un botón con `aria-pressed` («Ver la curva de…»), y la fila elegida se marca con `filaSeleccionada`.
  - Se retiró el texto «click en un platillo…».
- **Curva:** `CurvaPronostico.tsx` con Recharts **cargado con `next/dynamic`** (lo pide 5.12) y solo al elegir un platillo.
  - Tokens `--color-grafica-1/2` en lugar de `#f97316` y `#3b82f6`. La previsión va discontinua y con leyenda escrita, así que no depende solo del color.
  - Globo propio con clases en lugar de `contentStyle` en línea.
  - Oculta a los lectores y sin foco de teclado; los mismos datos están en la tabla «Vendido y previsto» de al lado.
- **Retirados de la página:** `CLASIFICACION_CONFIG` con colores fijos y la celda `Td` con `style`.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `prediccion.spec` (nueva), 8/8. Comprueba:
  - las cifras («18.3 %», «26.4 %») y que no queden «WAPE» ni «baseline»;
  - que solo se pida el ranking al entrar, y que al elegir la paella se pida su detalle, se dibuje la curva y aparezca su tabla;
  - el motivo del API cuando no hay datos;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas, con la curva abierta.
- Captura revisada: oscuro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.11 · Reservas en administración (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/reservations/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/reservas/ReservasAdmin.tsx`.
- **Mismos servicios:**
  - `getReservations` con sus filtros (`fechaDesde`, `fechaHasta`, `estatus`, `clienteNombre`), que se piden al cambiarlos, como antes;
  - `updateReservation(id, { estatus })`;
  - `getNoShowRisk` una vez por cada confirmada.
  - Se conserva la comprobación de token en el cliente. Mientras tanto se ve `CargadorMarca` («Preparando las reservas…») en lugar de «Verificando sesión...».
- **Indicadores:** reservas como protagonista, comensales (sin canceladas ni ausencias), confirmadas y pendientes.
- **Filtros:** campos de fecha con `min` y `max` cruzados, `Selector` de estado y `Buscador` de cliente.
- **`Tabla` desde `xl`, tarjetas por debajo:**
  - Columnas: cliente (con correo y teléfono), cuándo («sáb 14 de nov, 21:00»), comensales y mesa («4 · mesa 7»), detalles (ocasión, peticiones y canal), depósito, estado en `Insignia` y riesgo de no venir con texto y porcentaje («Alto · 72 %»).
  - **Motivo de juntar columnas:** con diez, junto a la barra lateral, el riesgo y las acciones quedaban fuera de la vista.
- **Estados:** «No Show» pasa a «No se presentó».
- **Cambio de estado en un diálogo («Cambiar estado»)** con «Guardar estado». Antes era un `<select>` dentro de la fila, que guardaba al instante y avisaba de los errores con `alert()`. Ahora el resultado llega como notificación.
- **Retirado:** la selección de fila con anillo de acento, que no servía para nada más.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `reservas-admin.spec` (nueva), el inicio y el recorrido de rutas, 112/112. La nueva comprueba:
  - las cifras, y el riesgo pedido solo para la confirmada (`/reservations/a1/no-show-risk`);
  - el filtro que llega al API (`?estatus=pendiente`);
  - el `PATCH /reservations/b2 { estatus: "confirmada" }` desde el diálogo;
  - la carga fallida;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas (con el nombre accesible que empieza por el texto visible, WCAG 2.5.3).
- Capturas revisadas: oscuro a 1440 px, antes y después de juntar columnas, y claro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.10 · Promociones en administración (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/promociones/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/promociones/PromocionesAdmin.tsx`.
- **Mismas llamadas y mismo cuerpo:** `GET /promociones/admin`, `POST /promociones`, `PATCH` y `DELETE /promociones/:id`. Activar sigue siendo optimista y se deshace si falla.
- **Indicadores:** «En la web ahora» (activas y dentro de sus fechas, con `promocionesVigentes` de la parte pública) como protagonista, activas y en total.
- **Lista:** `Tabla` (tarjetas por debajo de 1024 px) con buscador y filtro (todas, en la web, activas e inactivas).
  - Precio de la promoción con el normal tachado, con «Antes» para lectores.
  - Vigencia escrita.
  - Estado: «En la web», «Fuera de fechas» o «Inactiva».
- **`DialogoPromocion` sustituye a `PromoModal`:**
  - Valida con `esquemaPromocion` (3.1): título obligatorio, precios ≥ 0 y **la fecha de inicio no posterior a la de fin**, lo que pide 5.10. Además, `min` y `max` cruzados en los campos de fecha.
  - La imagen se sube con el mismo widget, limitado a JPG, PNG, WebP o AVIF de 5 MB (la firma antes de subir, en NP-46).
  - El color y el emoji siguen en el cuerpo porque son datos del API, pero ya no se muestran muestras de gradiente. Cada campo explica que la web no los usa.
- **Errores y confirmaciones:** eliminar pide confirmación del sistema, destructiva. Los errores van como notificación, sin texto del API; antes eran `alert()`. La carga fallida muestra «Reintentar»; antes la lista se quedaba vacía.
- **Retirado:** `PromoModal`.
- **`Contraetiqueta` en tarjetas estrechas:**
  - Con menos de 16rem (móvil con el texto al 125 %), cada rótulo va encima de su valor.
  - Las tarjetas de `Tabla` son contenedores (`container-type: inline-size`).
  - **Motivo:** una insignia ancha («Fuera de fechas») o un rango de fechas desbordaban la página a 360 px.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `promociones-admin.spec` (nueva), las demás pantallas de administración y las públicas con tarjetas (pedido, producto, reservas y checkout), 141/141. La nueva comprueba:
  - los tres estados y el filtro «En la web»;
  - la validación del título y de las fechas, y el `POST` con el cuerpo de siempre (color incluido);
  - el `PATCH { activa: true }`;
  - eliminar con confirmación y error avisado, y la carga fallida;
  - axe en la página y en el diálogo, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Catálogo (dev): tabla, componentes de marca y catálogo, 27/27 (1 omitida).
- Capturas revisadas: claro a 360 px y oscuro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.9 · Carta en administración (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/menu/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/carta/CartaAdmin.tsx`.
- **La lógica sale de la página a `useCartaAdmin.ts` sin cambiar el contrato:**
  - `MenuService` como almacén local y carga de `GET /platillos/export.json`;
  - alta optimista con `POST /platillos`, que reconcilia el id real;
  - `PATCH /platillos/:id` solo para los ids de la BD;
  - exportación local a CSV y JSON; Excel y plantillas desde el API.
  - Los colores de categoría pasan de hex a tokens de gráfica.
  - Sin `alert()` ni `confirm()`: las operaciones devuelven su resultado y la pantalla avisa.
- **Pantalla:**
  - Indicadores: platillos como protagonista (con las categorías), disponibles, agotados y populares.
  - Buscador y filtro de disponibilidad.
  - Una `Tabla` por categoría (tarjetas por debajo de 1024 px): precio, preparación, etiquetas como texto y estado en `Insignia`.
  - Acciones con nombre: «Agotar» u «Ofrecer» (el nombre accesible empieza por el texto visible, WCAG 2.5.3), editar y eliminar, que pide confirmación del sistema.
  - Importar y exportar abren diálogos con las opciones nombradas, en lugar de menús desplegables hechos a mano. Sin conexión al API, las opciones quedan deshabilitadas y lo explican; antes, `alert("Configura NEXT_PUBLIC_API_URL…")`.
- **Importación (`importacion.ts` + `DialogoImportacion.tsx`):**
  - **Validación antes de leer (5.9):** el XLSX pasa por `verificarArchivo(archivo, "hoja")` (≤ 2 MB, extensión, MIME y firma `PK 03 04`) **antes** de llegar a la librería `xlsx` (NP-31). El CSV y el JSON tienen el mismo tope de 2 MB. Los errores llegan en una notificación fija, sin texto técnico.
  - **La vista previa sustituye a `ImportPreviewModal`** (968 líneas, 86 hex, estilos en línea y `text-[Npx]`):
    - mismas diferencias por nombre con la BD, y los iguales empiezan sin marcar;
    - cada platillo es una `Casilla` con su insignia (Nuevo, Cambia, Sin cambios) y sus cambios «antes → después»;
    - buscador, filtro y «Marcar o desmarcar todos»;
    - mismos endpoints de subida (`/platillos/import.csv`, `/platillos/import.json`, `/import/platillos/excel`, `mode=upsert`).
- **`DialogoPlatillo` sustituye a `ItemModal`:**
  - Nombre y descripción con `esquemaPlatillo` (paso 3.1); números con sus propios mensajes.
  - Etiquetas como casillas y disponibilidad con `Interruptor`.
  - Imagen con vista previa y «Quitar la imagen».
  - La subida conserva el widget de Cloudinary y su preset, y ahora limita en el widget los formatos y los 5 MB.
  - La firma antes de abrir la subida necesita un cargador propio y un preset firmado (NP-46); el preset actual es un marcador.
- **Retirados** (versionados): `ItemModal`, `components/admin/Importpreviewmodal.tsx`. `components/admin/` queda vacía.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `carta-admin.spec` (nueva) y el recorrido de rutas, 105/105. La nueva comprueba:
  - la carta de la BD por categorías, el filtro y «Agotar»;
  - el `PATCH /platillos/21` y el `POST /platillos` con `categoria_id`, nombre, precio y etiquetas;
  - un `.xlsx` que no es Excel se rechaza **antes** de leerlo;
  - un CSV se revisa (nuevos, con cambios y sin cambios) y se sube a `/platillos/import.csv?mode=upsert`;
  - eliminar con confirmación;
  - axe en la página y en el diálogo del platillo, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Capturas revisadas: oscuro a 1440 px y claro a 768 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). La subida real a Cloudinary (NP-46) y la importación contra el backend real.

### 5.8 · Proveedores (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/inventory/suppliers/page.tsx` pasa a ser de servidor** (lee `?vista=proveedores|ordenes`). La pantalla es `features/dashboard/admin/proveedores/Proveedores.tsx`.
- **Mismo hook** (`useInventory`) y mismos cuerpos hacia `/api/inventory/suppliers` y `/api/inventory/orders`.
- **Migas:** «Productos y existencias › Proveedores».
- **Indicadores:** tres; lo comprado como protagonista, órdenes en curso (con las que van en camino) y proveedores activos.
- **Proveedores:**
  - `Tarjeta` con su estado en insignia.
  - `Contraetiqueta` con contacto, teléfono (`tel:`), correo (`mailto:`), entrega («2 días»), pago, órdenes y lo que surte («Jitomate, Cebolla y 3 más»).
  - Pie con «Hacer pedido» (solo los activos), editar y eliminar.
  - Antes era un menú «⋮» hecho a mano y la opacidad para los inactivos.
- **Órdenes:** `Tabla` con buscador, filtro de estado, número de artículos y estado en `Insignia`.
- **Diálogos** (`DialogosProveedores.tsx`): sustituyen a `SupplierModal` y `OrderModal`.
  - **Proveedor:** correo validado con `correoBasicoOpcional`, días ≥ 0, y productos que se añaden con Enter o con «Añadir» y se quitan con un botón que lleva su nombre.
  - **Orden:** solo ofrece los productos que surte el proveedor elegido, como antes, y lo explica si no hay ninguno. Toma el costo del inventario y calcula el total en vivo. El estado se cambia en un `Selector` en lugar de pastillas de colores.
  - Los dos validan, esperan la respuesta y avisan del resultado.
- **Operaciones:**
  - Las notificaciones sustituyen al banner «Error al…».
  - Eliminar un proveedor o una orden pide confirmación del sistema, destructiva; antes era `confirm()`.
- **Retirados:** los emojis de las pestañas y las clases de color fijas de `ORDER_STATUS`.
- **Comunes:** `Pie` y `useDialogo` se exportan desde `DialogosInventario.tsx` para los diálogos con guardado asíncrono.
- **Probado y descartado:** `Insignia` sin saltos de línea para todo el sitio. Desbordaba el catálogo a 360 px con etiquetas largas, así que solo el estado de las órdenes, que es corto, va en una línea.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `proveedores.spec` (nueva) más todo administración y las públicas con insignias (pedido, producto, carta, categoría, informativas), 134/134. Tras el ajuste final, proveedores, pedido y carta, 38/38. La nueva comprueba:
  - las migas, las cifras y el teléfono enlazado, y que al inactivo no se le pueda pedir;
  - la orden: solo productos del proveedor, total y el `POST` exacto;
  - el proveedor nuevo: correo validado, producto con Enter y `POST`;
  - eliminar una orden con confirmación y `DELETE ?id=7`;
  - axe, sin desborde, en proveedores (360, 768 y 1440 px) y órdenes (360 y 1440 px), en los dos temas.
- Catálogo (dev): catálogo, estados y tabla, 30/30 (1 omitida).
- Capturas revisadas: proveedores en oscuro a 1440 px y órdenes en claro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.7 · Inventario (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/inventory/page.tsx` pasa a ser de servidor** (lee `?vista=productos|mermas`). La pantalla es `features/dashboard/admin/inventario/Inventario.tsx`.
- **Mismo hook** (`useInventory`) y mismas rutas `/api/inventory/*`, con los mismos cuerpos. El hook gana `recargar` para «Reintentar»: antes, si la carga fallaba, el error se quedaba para siempre y mostraba «Failed to fetch inventory data».
- **Indicadores:** valor en bodega como protagonista, productos, en nivel crítico y pérdida por mermas. «Mermas del mes» pasa a «Pérdida por mermas», porque sumaba todas, no solo las del mes.
- **Alerta accionable:** críticos y bajos, con «Ver solo esos», que aplica el filtro, y «Ver proveedores».
- **Productos:** `Buscador`, filtros de categoría y estado, y `Tabla`.
  - El filtro de estado estaba mal: «Bajo stock» devolvía además los inactivos. Ahora las opciones son «Todos», «Activos», «Inactivos» y «Bajos o críticos».
  - **Nivel de existencias:** `Insignia` con texto (Correcto, Bajo, Crítico, Exceso), barra en SVG con tokens `fill-*` y mínimo y máximo. Antes era solo color, con hex en estilo en línea.
  - **Acciones con nombre** (ajustar, editar, eliminar) en lugar del menú «⋮» hecho a mano.
- **Mermas:** `Tabla` con motivo, qué pasó, quién lo reporta, fecha y pérdida; la pérdida acumulada va en la descripción del bloque.
- **Diálogos** (`DialogosInventario.tsx`): sustituyen a `ProductModal`, `MermaModal` y `AdjustModal`.
  - Validan al enviar: nombre, números ≥ 0, máximo ≥ mínimo; existencias que no queden negativas; merma con cantidad y explicación.
  - Esperan la respuesta y avisan si falla. Antes se cerraban sin saber si se había guardado.
  - El ajuste muestra «Ahora» y «Quedará»; la merma, la pérdida estimada.
- **Eliminar pide confirmación del sistema, destructiva.** Antes borraba al primer clic.
- **Sin emojis ni hex:** las categorías y los motivos van como texto.
- **Componentes:**
  - **`Tabla`:** nueva prop `tablaDesde` (`md` por defecto, `lg` o `xl`). El inventario usa `xl`, porque con siete columnas y acciones, en tableta y junto a la barra lateral las acciones quedaban fuera de la vista; ahí ahora van tarjetas.
  - **`EncabezadoPagina`:** el título pide 20rem y las acciones bajan a su línea si no caben. A 768 px, tres botones comprimían el título palabra a palabra.
  - **`lib/formato/plural.ts` (`contar`):** «1 registro», «2 movimientos». Se aplica también en finanzas.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos nuevos. `useInventory` mantiene sus 11 errores previos, sin ninguno nuevo. Build correcto.
- Chromium en producción: `inventario.spec` (nueva) más las otras cinco pantallas de administración, 68/68; repetidas inventario y finanzas tras el plural, 28/28. La nueva comprueba:
  - las cifras, la alerta y «Ver solo esos», con el nivel dicho con texto;
  - el ajuste: validación y `POST /api/inventory/products/adjust` con `{ id, stock }` exacto;
  - el producto nuevo: mínimo y máximo, y el `POST` con el cuerpo de siempre;
  - la merma: pérdida calculada y su `POST`;
  - eliminar con confirmación y error avisado;
  - la carga fallida;
  - axe, sin desborde, en productos (360, 768 y 1440 px) y mermas (360 y 1440 px), en los dos temas.
- Catálogo (dev): tabla y paneles, 15/15.
- Capturas revisadas: productos en oscuro a 1440 px y en claro a 768 px, antes y después del ajuste.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.6 · Nómina (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/payroll/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/nomina/Nomina.tsx`.
- **Mismas llamadas** (`GET`, `POST`, `PATCH` y `DELETE` sobre `/payroll`, con los mismos cuerpos) y la misma actualización optimista al activar o quitar, que se deshace si falla.
- **Indicadores:** nómina semanal como protagonista, al mes aproximado (×4, como antes), personal activo (de cuántos) y pago medio. Cargan con esqueleto; si la carga falla, muestran «Reintentar» y nunca un cero.
- **Gasto semanal por área:** `GraficaBarras`, que sustituye a las barras hechas a mano. Agrupa igual («Chef 1» → «Chef»).
- **Personal:** `Tabla`, que pasa a tarjetas por debajo de 768 px, con `Buscador` e insignia de estado.
  - Acciones: «Activar» o «Desactivar», con el nombre en `aria-label`, «Editar» y «Quitar», con iconos que llevan su nombre.
- **`DialogoEmpleado`** sustituye a `PayrollModal`: valida al enviar, con `Interruptor` para «Activo en la nómina», y no se cierra mientras guarda.
- **Sin `alert()` ni `confirm()`:**
  - Quitar pide confirmación del sistema, destructiva.
  - Los errores llegan como notificación genérica, sin el texto del API (D-20); antes era `alert(err.message)`.
- **Rejilla común de la primera fila** (`components/paneles/rejilla.ts`), aplicada al inicio, reportes, finanzas, facturas y nómina:
  - **Por debajo de 1280 px:** la protagonista ocupa su fila y las otras tres van juntas debajo. Con 2 + 2 la cuarta quedaba huérfana en tableta.
  - **Desde `xl`:** las cuatro en una fila.
  - **Con tres indicadores:** su propia variante.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `nomina.spec` (nueva) más inicio, reportes, finanzas, facturas y el layout, 62/62. La nueva comprueba:
  - los totales del personal activo y el alta con el mismo `POST` exacto;
  - la búsqueda y el `PATCH` exacto al activar;
  - quitar con confirmación, un error sin texto del API y el borrado deshecho;
  - la carga fallida;
  - axe, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Capturas revisadas: oscuro a 1440 px, claro y oscuro a 768 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). Con el backend real, la forma de las respuestas se toma de lo que ya leía el código.

### 5.5 · Facturas (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/finance/invoices/page.tsx` pasa a ser de servidor.** La pantalla es `features/dashboard/admin/facturas/Facturas.tsx`.
- **Sin endpoint, como antes** (`invoicesMock` en memoria), y ahora avisado: «no se guarda ni se timbra» e insignia D-13 (NP-45).
- **Migas:** `components/paneles/MigasPanel.tsx`, «Caja y propinas › Facturas», en el antetítulo. Las migas públicas empiezan en «Inicio» de la web y no sirven en el panel.
- **Indicadores:** facturado como protagonista (sin canceladas), cobrado y por cobrar.
- **Lista:** `Buscador` (folio, cliente o RFC) y `Selector` de estado, sobre una `Tabla` que pasa a tarjetas por debajo de 768 px.
  - **El folio es el botón que abre el detalle** («Ver la factura A-0001» para lectores). Una columna de acciones quedaba fuera de la vista en tableta.
  - El folio y la fecha no se parten.
- **Detalle en `PanelLateral`:**
  - Estado, datos fiscales en `Contraetiqueta`, conceptos en `Tabla` y totales.
  - La nota interna va en `Aviso`.
  - «Marcar como pagada» y «Cancelar factura». Cancelar pide confirmación del sistema, destructiva y con «Conservarla»; antes era `confirm()`.
  - Se retiraron «PDF», «Enviar» e «Imprimir», que no hacían nada (NP-45).
- **Factura nueva (`DialogoFactura`):** misma lógica que `InvoiceModal`.
  - Valida al enviar: RFC con el esquema `rfc` del paso 3.1, correo opcional con `correoBasicoOpcional`, y cada concepto con descripción, cantidad y precio.
  - El subtotal, el IVA y el total se ven en vivo.
  - Los conceptos se añaden y se quitan con un botón que lleva su nombre («Quitar el concepto 2»).
- **Retirados:** `InvoiceDrawer`, `InvoiceModal` y el `STATUS_CFG` de `invoicesMock`, con sus clases de color fijas.
- **`RegionDesplazable` pasa a `relative`:**
  - **Fallo:** el texto `solo-lectores` de la cabecera de acciones va en posición absoluta, y la región no lo contenía. A 768 px desbordaba la página aunque la tabla se recortara bien.
  - **Alcance:** vale para todas las tablas.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: `facturas.spec` (nueva), 9/9; con finanzas, reportes e inicio, 44/44. La nueva comprueba:
  - migas, búsqueda, filtro y estado vacío;
  - factura nueva: validación de RFC y conceptos, IVA calculado («$ 1,160.00») y notificación;
  - detalle y cancelación con la confirmación del sistema;
  - axe en la página y en el panel, sin desborde, a 360, 768 y 1440 px, en los dos temas.
- Capturas revisadas: detalle en oscuro a 1440 px, claro a 768 px y oscuro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.4 · Finanzas: caja y propinas (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/finance/page.tsx` pasa a ser de servidor** (lee `?vista=`). La pantalla es `features/dashboard/admin/finanzas/Finanzas.tsx`.
- **Sin endpoint, como antes:** trabaja con `financeMock` en memoria. Ahora lo dice: un aviso «Pantalla con datos de ejemplo» explica que lo registrado no se guarda, y cada bloque lleva su insignia (D-13).
- **Indicadores:**
  - Balance del día como protagonista, ingresos, egresos y propinas por repartir.
  - Toman el último día con movimientos y lo nombran («Resumen del 4 de marzo»). Antes usaban «hoy», que con datos de ejemplo de otra fecha daba siempre $0.00.
- **Caja abierta:** `Aviso` con «Cerrar caja», en lugar del banner verde hecho a mano.
- **Pestañas (`?vista=caja|cierres|propinas`)**, todas con `Tabla`, que pasa a tarjetas por debajo de 768 px:
  - **Caja chica:** movimientos con filtro de fecha y «Ver todas las fechas». El importe va con su signo (+ o −), no solo con color.
  - **Cierres:** cada sesión con su estado en `Insignia`.
  - **Propinas por mesero:** «Repartir $ X» pide confirmación del sistema (`useConfirmacion`).
  - Se retiraron los emojis de las pestañas.
- **Diálogos** (`DialogosFinanzas.tsx`): `Dialogo` con `Campo`, `Selector` y `AreaTexto`. Sustituyen a `MovementModal`, `CloseSessionModal` y `TipModal` con la misma lógica.
  - Validan al enviar y marcan el error en cada campo. Antes el botón quedaba deshabilitado sin explicar por qué.
  - El cierre de caja muestra la diferencia en vivo («Faltan $ X», «Sobran», «Cuadra exacto») en una región `aria-live`.
  - Cada registro avisa con una notificación.
- **Retirados:** los tres modales, y de `financeMock` las configuraciones `PAY_CFG` y `PAY_ICONS` con sus hex, ya sin uso.
- **Componentes, por lo que salió al verlo con importes reales:**
  - **`Indicador`:** pasa a contenedor (`container-type: inline-size`) y su cifra mide `min(token, 15cqi)`. Con cuatro por fila junto a la barra lateral, «$ 6,140.00» se salía de la tarjeta. Ahora encoge lo justo; en móvil y en la protagonista manda el token.
  - **`Contraetiqueta`:** la columna del valor no baja de su ancho mínimo de contenido (`minmax(min-content, 1fr)`), así una insignia («Repartido») no se sale de la tarjeta.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Build correcto.
- Chromium en producción: 75 pasan. Incluye `finanzas.spec` (nueva), reportes, inicio y las páginas públicas con `Contraetiqueta`. La nueva comprueba:
  - el aviso de ejemplo;
  - el registro de un ingreso con su validación y su notificación;
  - el cierre de caja con la diferencia;
  - el reparto de propinas con la confirmación del sistema, sin `alert()` ni `confirm()`;
  - axe, sin desborde de página ni de cifras dentro de indicadores y tarjetas, en las tres pestañas, a 360, 768 y 1440 px, en los dos temas.
- Catálogo (dev): gráficas, landing, componentes de marca, panel de accesibilidad y tabla, 35/35.

**No verificado:** Firefox y WebKit (al cierre de la fase).

### 5.3 · Reportes (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/reports/page.tsx` pasa a ser de servidor** y lee `?vista=` para la primera pintura.
- **La pantalla es `features/dashboard/admin/reportes/Reportes.tsx`,** con tres pestañas (`Pestanas`, `?vista=ventas|equipo|clientes`). El contenido solo se monta en la pestaña activa, así que la segmentación solo se pide al abrir «Clientes», como antes.
- **Ventas (datos de ejemplo de `reportsMock`, con su insignia, D-13):**
  - Cuatro indicadores, con «Ventas» como protagonista y el periodo en un grupo de botones con `aria-pressed`.
  - `GraficaBarras` de ventas por día y de ingresos por mes, `GraficaDonut` de formas de pago y `Tabla` de platos más vendidos.
  - **Sin cifras escritas a mano:** «Mejor día: Sábado $9,400», «+3.1% MoM» y la frase sobre el efectivo se calculan ahora de los mismos datos. Se retiró «Proyección $148k», que no salía de ningún dato. También se retiraron los sparklines con valores fijos y el botón de fila que no hacía nada.
- **Equipo:** `Tabla` con datos de ejemplo.
- **Clientes, segmentación real (`/reports/customer-segments`, sin cambios):**
  - Tiene sus estados: esqueleto, error con «Reintentar» y «no disponible» con el motivo del API.
  - Tres indicadores. «Índice de silueta» pasa a «Separación entre segmentos», con su escala explicada.
  - El mapa de clientes usa Recharts cargado con `next/dynamic`, colores `--color-grafica-*` en vez de hex, y no recibe el foco porque está oculto a los lectores.
  - Tarjetas de segmento con `Contraetiqueta` y su lista de clientes en un `Dialogo` con `Tabla`, en lugar del modal hecho a mano.
  - Se retiraron los textos técnicos «K-Means», «PCA» y «Reportes → Segmentación (nueva pestaña)» (D-20).
- **Exportar:** `DialogoExportar` sustituye a `components/admin/ExportModal` (46 hex, `text-[Npx]` y estilos en línea).
  - Hace la misma petición `GET /export?type&format&startDate&endDate&limit` y la misma descarga.
  - Añade campos del catálogo y la validación «Hasta» ≥ «Desde».
  - El error ya no muestra el texto crudo de la respuesta.
- **Comunes:** `components/paneles/BloquePanel.tsx` (sección con `h2`, acciones e insignia de datos de ejemplo), que ya usa también el inicio.
- **Ajustes de componentes** que salieron al montar la pantalla a 360 px con el texto al 125 %:
  - **`Contraetiqueta`:** el rótulo pasa de `auto` a `fit-content(55 %)`, porque un rótulo largo dejaba la cifra sin sitio. Afecta también a las páginas públicas, que se repitieron.
  - **`GraficaDonut`:** en la leyenda, el nombre se parte y las cifras bajan juntas a su línea. Nueva prop `formatoTotal` para la cifra del centro («$ 68 k»).
- **Retirados** (versionados y sin uso): `ExportModal`, `charts/BarChart` y `charts/Sparkline`. `DonutChart` y `KpiCard` siguen en salud de BD hasta 5.16. Los hex de `PAYMENT_DIST` también se retiraron.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. `DonutChart` conserva su error previo y no se ha tocado. Build correcto.
- Chromium en producción: 62 pasan. Incluye `reportes.spec` (nueva), `inicio-admin` y las páginas públicas con `Contraetiqueta`: producto, reservas, checkout y pedido. La nueva comprueba:
  - las insignias, el periodo y que no queden frases inventadas;
  - que la segmentación no se pida hasta abrir su pestaña;
  - la exportación: validación de fechas, la URL exacta y el nombre del archivo;
  - los segmentos con su diálogo, el error y «no disponible»;
  - axe sin violaciones y sin desborde en ventas (360, 768 y 1440 px) y en clientes (360 y 1440 px), en los dos temas.
- Capturas revisadas: ventas en oscuro a 1440 y 360 px, ventas en claro a 360 px y clientes en claro a 1440 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). La exportación con el backend real.

### 5.2 · Inicio de administración (2026-11-03)

**Cambios:**
- **`app/dashboard/admin/page.tsx` pasa a ser de servidor.** Saluda con el nombre del DTO de la sesión: «Hola, Ana», o «Hola» si no lo hay. Antes decía «Buenas noches, Admin» a cualquier hora y con un nombre fijo.
- **La pantalla es `features/dashboard/admin/inicio/InicioAdmin.tsx`** y usa los mismos cinco endpoints de antes.
  - **Indicadores (máximo 4):** ventas de hoy como protagonista (más ancha desde `xl`), pedidos pendientes con los que están en preparación, mesas ocupadas («7 de 12», con las libres) y reservas de hoy (sin las canceladas ni las no presentadas).
    - Las reservas salen del endpoint de reservas que ya existía, con su filtro `fechaDesde`/`fechaHasta`.
    - La comparación semanal, los cubiertos y el ticket medio no los da el API: no se inventan (NP-44).
  - **Alerta accionable de inventario:** «N productos en nivel crítico», o «por debajo del mínimo», con «Ver inventario».
    - Si la petición de existencias falla (la ruta mal apuntada de NP-17), lo dice con «Reintentar». Antes el contador marcaba 0 en silencio.
  - **Pedidos recientes:**
    - `Tabla`, que pasa a tarjetas por debajo de 768 px, con el estado en `Insignia` y el filtro en un `Selector`.
    - «Mostrar N más» de 10 en 10.
    - Se retiraron «Actualización en tiempo real vía SSE», un texto técnico y además falso (D-20), y «Ver todos», que llevaba a `/dashboard/admin/orders`, una ruta inexistente.
  - **Ventas de hoy por hora:** `GraficaBarras` con solo las horas con movimiento (mínimo seis barras) y el total del día.
  - **Estados:** cada bloque tiene los suyos de carga, vacío y error, con «Reintentar», y nunca un cero en lugar de un error.
- **Piezas comunes para la fase 5:**
  - **`lib/paneles/api-panel.ts`** (`pedirPanel`, `cabecerasPanel`, `tokenSesion`): la misma lógica de token y URL que copiaba cada pantalla. Si la respuesta no es 2xx, lanza un error.
  - **`hooks/useCarga.ts`:** estado de cargando, error o listo, y una función para recargar.
  - **`formatearImporte`** (`lib/formato/precio.ts`): siempre dos decimales, espacio duro y signo menos tipográfico, con su prueba unitaria.
- **Corrección en las gráficas (`useAncho`, `components/ui/graficas/comun.tsx`):**
  - **Fallo:** el `ResizeObserver` se enganchaba solo al montar. Una gráfica que empezaba en «cargando» no medía nunca su zona, así que se quedaba en blanco con datos reales. En el catálogo no se veía porque allí los datos son fijos.
  - **Arreglo:** ahora es una ref de callback.
- **Retirados** (versionados y sin uso): `RecentOrdersTable`, `HourBarsChart`, `TableStatusGrid` y `StockAlerts`. `KpiCard` sigue en uso en reportes y salud de BD, y se retira en sus pasos.

**Verificación:**
- Typecheck limpio y lint limpio en los archivos tocados. Pruebas unitarias: 50/50. Build correcto.
- Chromium en producción, `inicio-admin.spec` (nueva) más `layout-paneles`: 17/17. La nueva comprueba:
  - las cifras, la alerta con su enlace, la tabla (10 filas, «Mostrar 3 más», filtro) y las barras de la gráfica;
  - cada bloque con su error y «Reintentar» cuando el API falla, sin un «$» inventado;
  - axe sin violaciones y sin desborde a 360 px (texto al 125 %), 768 y 1440 px, en los dos temas.
- Catálogo (dev): `graficas.spec`, 8/8.
- Capturas revisadas: oscuro y claro a 1440 px, claro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase). Con el backend real, la forma de las respuestas se toma de lo que ya leía el código.

### 5.1 · Layout de los paneles (2026-11-03)

**Cambios:**
- **Marco nuevo:** `components/paneles/MarcoPanel.tsx`, montado por `app/dashboard/layout.tsx` con el DTO de la DAL (rol, nombre y apellidos).
  - Enlace «Saltar al contenido».
  - Desde 1024 px, barra lateral de 16rem, fija a la altura de la ventana y con su propio scroll, con el logo y `NavegacionPanel`.
  - Barra superior fija (`BarraSuperiorPanel`): por debajo de 1024 px abre el drawer; la cuenta lleva el «Cerrar sesión» único (2.14).
  - El contenido va en el único `<main id="contenido-panel">`.
  - Ya no se mide el ancho de la barra con `ResizeObserver`, ni hay `--sidebar-width` ni `style={{ marginLeft }}`: el reparto lo hace el flex (`.marco-panel`, `.marco-panel-lateral` en `styles/componentes.css`).
- **Navegación por rol:**
  - **Admin:** `navegacionDeRol(ROLES.ADMIN)`. A `admin.nav.ts` le faltaban Reservaciones, Promociones y Predicción, y ahora están las 15 pantallas. Las etiquetas son las de la barra anterior. Predicción usa `TrendingUp` y deja de repetir el icono de base de datos.
  - **Caja, cocina y sala:** sin navegación, porque sus configuraciones apuntan a rutas inexistentes (NP-37 ampliada). Ningún rol que no sea admin ve entradas de admin.
  - **Nombre del panel:** «Administración», «Caja», «Cocina» o «Sala».
- **`AdminSidebar` retirado** (estaba versionado). Era la barra con hex, `text-[Npx]`, estilos en línea, el rol «Administrador» fijo para todos y las entradas de admin para cualquier rol.
- **Un solo `<main>`:** las 17 páginas de `app/dashboard` pintaban el suyo, y ahora es un `div`, así que no quedan `main` anidados. Cada pantalla se rehace en 5.2–5.19.
- **Mesero:** su barra fija de 80 px tapaba el inicio de la barra superior, y pasa a `sticky` bajo ella. Pierde su botón de cerrar sesión: queda solo el de la cuenta, el único. El resto de la pantalla, en 5.18.

**Verificación:**
- Typecheck limpio. Lint limpio en los archivos nuevos, y en las páginas tocadas no sube la cuenta (mesero 3/0, como antes).
- Build correcto.
- Chromium en producción: `layout-paneles.spec` (nueva, 9 pruebas), recorrido y protección, más almacenamiento, sistema, marca y cabeceras: 129 + 50 pasan. Las 4 de almacenamiento que buscaban el botón de la barra antigua se corrigieron y se repitieron: el cierre de sesión de los cuatro roles ahora pasa por la cuenta.
- Las pruebas nuevas comprueban:
  - **Admin a 1440 px:** la entrada activa y que el contenido empieza donde acaba la barra.
  - **Admin a 360 px:** `main` a x = 0 y 360 px de ancho; el drawer navega y se cierra.
  - **Mesero, caja y cocina:** sin entradas de admin y con «Cerrar sesión» en la cuenta.
  - **Axe:** sin violaciones en el marco, a 360 y 1440 px, en los dos temas. El contenido de cada pantalla se mide en su paso.
- Capturas revisadas: oscuro a 1440 px y claro a 360 px.

**No verificado:** Firefox y WebKit (al cierre de la fase).

## Fase 4 · Páginas públicas

### Cierre de la fase 4 (2026-11-03)

Los pasos 4.0.1, 4.0.2 y 4.1–4.23 están hechos, más las dos excepciones autorizadas: `firebase-admin` retirado (NP-38) y `/api/auth/logout` caduca siempre las cookies (NP-41). Son 27 commits sobre `3775918`, más este. Por orden del usuario no se lanza Lighthouse.

| Comprobación | Resultado |
|---|---|
| Typecheck | 0 errores |
| Lint global | 127 errores y 67 avisos en 74 archivos, ninguno en la parte pública (`app/(public)`, `app/(auth)`, `app/menu`, `components/{marca,landing,carta,auth,ui}`): todo son pantallas del panel de la fase 5. En el cierre de la fase 3 eran 205 y 104. |
| Build de producción | Correcto (el último, tras 4.23, con las 42 rutas del recorrido) |
| `revisar-bundle` | 652 archivos: sin contenido de desarrollo, 0 secretos y 0 mapas de código |
| Producción (`next start`), batería completa en tres tandas | Chromium 124 + 90 + 95; Firefox 120 + 90 + 95; WebKit 121 + 90 + 95. Ningún fallo. Las omitidas (60–78 por tanda) son las pruebas del catálogo y las que exigen otro motor. |
| Catálogo (`next dev`), 16 archivos en dos mitades | Chromium 73 + 66 (la prueba de avisos falló en la primera mitad y pasa, repetida junto a la segunda, tras el ajuste de abajo), Firefox 74 + 60, WebKit 74 + 60; 1 omitida por motor en la primera mitad |
| `pnpm test:unidad` | 49/49 |
| `pnpm revisar:invisibles` | 0 hallazgos en 409 archivos |
| `pnpm audit` | 0 críticas / 19 altas / 13 moderadas / 0 bajas (antes de retirar `firebase-admin`: 3/45/31/6) |

**Correcciones del cierre (este commit):**
- **CSP y zod:**
  - **Problema:** zod v4 compila sus validadores con `new Function`, y la CSP en modo informe (2.5 sigue sin aplicarse) lo registraba como `eval` en cada formulario.
  - **Arreglo:** `z.config({ jitless: true })` en un módulo propio, `lib/validacion/configurar-zod.ts`, que se importa antes de zod en cada archivo que valida con él (`campos`, `archivos`, `ReservationSidebar` y la demo de campos). Así no depende del orden de carga de los módulos. Valida igual, sin `eval`. Tras el build: CSP, reservas, registro, acceso, checkout y cuenta, 46/46 en Chromium.
- **Una sola región viva para las notificaciones:** desde 4.12 `ProveedorNotificaciones` está montado una vez en `AppProviders`. La demo del catálogo (`DemosAvisos`) montaba el suyo dentro, y la página tenía dos `aria-live`. Ahora la demo usa el global.
- **Pruebas desfasadas por las fases 4.x:**
  - `csp.spec`: el carrusel de `/about` ya no existe, y su prueba pasa a «ningún `<style>` sin nonce» en `/about`.
  - `texto-enriquecido.spec`: espera el nuevo `h1` de la portada.
  - `excepciones.ts`: los avisos de consola del API simulado se llaman ahora `[promociones]` y `[carta]`.
- **Pruebas que dependían del motor:**
  - **WebKit aplica la CSP en informe a `addStyleTag`:** `landing.spec` oculta el texto con `style.setProperty` sobre el elemento.
  - **WebKit no llega a los enlaces con Tab:** `marca.spec` enfoca el enlace de salto con `focus()`.
  - **El campo de contraseña puede escribirse antes de hidratar:** `registro.spec` reintenta con `toPass()`.

**No verificado en la fase (queda para el usuario o para la fase 7):**
- **Lighthouse y la medición móvil** (7.3): las lanza el usuario con el editor cerrado.
- **Lectores de pantalla reales y dispositivos reales:** CargadorMarca, PaginaEstado, el panel de reservas y el dictado.
- **Dictado por voz** (`BotonDictado`): solo se prueba que el botón no aparece sin `SpeechRecognition`. No se ha probado con un micrófono real.
- **Stripe real en el checkout:** se prueba con la tarjeta simulada, sin pago real.

**Por confirmar con el restaurante (NP-43):** la contradicción «cocina mexicana» / «cocina española» y los datos de horario, dirección y teléfono que no estén en `config/restaurant.config.ts`.

**Decisiones pendientes del usuario:** 2.5 (aplicar la CSP).

### 4.23 · Páginas de sistema (2026-11-03) — D-20 y D-21

**Cambios:**
- **Todas sobre `PaginaEstado`, con su ilustración** (D-21). No conservan nada de las anteriores: ni los módulos CSS, ni la sartén animada, ni el «404» gigante de fondo, ni el naranja.

  | Página | Ilustración | Código | Salidas |
  |---|---|---|---|
  | 404 de la raíz (`app/not-found.tsx`) | plato con campana | 404 | inicio y carta |
  | `/unauthorized` | llave | 401 | iniciar sesión y crear cuenta |
  | `/forbidden` | puerta con candado | 403 | tu panel e inicio |
  | `/maintenance` | mesa con reloj de arena | — | llamar |
  | `/offline` | molino quieto | — | «Reintentar» |
  | Límite de error con `digest` (del servidor) | olla humeante | 500 | «Reintentar» y la salida del segmento |
  | Límite de error sin `digest` (del navegador) | copa volcada | — | «Reintentar» y la salida del segmento |
  | `global-error` | copa volcada | — | «Reintentar» e inicio |

  - El 404 de la raíz va dentro de `MarcoSitio` y responde 404.
  - **`/offline`:** «Reintentar» es un `<form>` nativo que funciona sin JavaScript; se conserva la recarga al volver la conexión. Sin estilos en línea.
  - Los límites de error conservan lo del 2.17: nunca `error.message` ni la pila, el `digest` como código para soporte y `registrarError`.
- **Las páginas de sistema entran en el grupo `app/(public)/(sistema)/`** (`git mv`; las URL no cambian), así que ya tienen cabecera y pie. Era el transitorio anotado en el 4.1.
- **`app/loading.tsx`:** `CargadorMarca` a pantalla completa, en lugar de la sartén con `styles/loading.css`.
- **Límites por segmento (D-20):** además de los del 2.17 (`(auth)`, `(public)`, `menu`, `dashboard`), nuevos `error.tsx` y `not-found.tsx` en `reservations` y `menu/pedido`. La salida de `menu` pasa a «Ver la carta».
- **Retirados:**
  - `app/{error,forbidden,maintenance,not-found,unauthorized}.module.css` y `styles/loading.css`;
  - la excepción de pruebas «was preloaded using link preload», que la producían esos módulos CSS que Next precargaba en todas las rutas (anotada en la fase 1 para resolverla aquí).

**Verificación:**
- Typecheck: 0 errores, tras regenerar los tipos de `.next`. Lint de los archivos tocados: 0 problemas.
- Build: correcto, con las mismas rutas.
- `pnpm test:unidad`: 49/49. `error-global.spec.tsx` actualizada: el texto nuevo y la ilustración de la copa, sin mensaje, `SELECT` ni pila.
- `sistema.spec.ts` (nueva, Chromium contra `next start`): 11/11. Comprueba:
  - en las cinco páginas, la página de estado con su ilustración (`aria-hidden`), el código con su nombre para lectores («Código 404»), la salida, el marco público, un solo `main`, nada del diseño anterior ni texto técnico, y axe sin violaciones;
  - que el 404 responde 404;
  - que `/offline` funciona sin JavaScript;
  - capturas de las cinco a 360 y 1440 px en los dos temas, sin desbordar.
- `limites-error.spec.ts` (solo en `next dev`) se actualiza a los textos nuevos y a la ilustración; se pasa al cerrar la fase.
- Revisión visual de las capturas (403 a 360 px en claro y sin conexión a 1440 px en oscuro): las ilustraciones se leen bien a los dos tamaños.
- Sin procesos abiertos.

### 4.22 · Páginas legales (2026-11-03) — D-17

**Cambios:**
- **Grupo de rutas `app/(public)/(legales)/`** (`git mv`; las URL no cambian) con su layout: ancho de lectura de 52rem y el ritmo de pie.
  - Contiene `/ayuda`, `/condiciones`, `/corporativo`, `/devoluciones`, `/privacidad` y `/seguridad`.
- **Las seis páginas pasan a ser de servidor** (antes `"use client"`), con su título en los metadatos.
- **`components/marca/PaginaLegal.tsx`** (nuevo): `PaginaLegal` (`EncabezadoPublico` con migas y «Volver al inicio») y `SeccionLegal` (cada apartado con su `h2` en Fraunces, filete sutil, ancho de lectura y enlaces con el subrayado del sistema).
- **La redacción legal no cambia (D-17):** solo el estilo. Se quitaron los iconos de cabecera, las tarjetas con sombra y los colores de los enlaces escritos a mano.
- **Retirado** `landing/InfoPageLayout.tsx`, que se quedaba sin uso.

**Verificación:**
- Typecheck: 0 errores, tras regenerar los tipos de `.next`, que aún apuntaban a las rutas sin el grupo. Lint de los archivos tocados: 0 problemas.
- Build: correcto, con las mismas seis rutas.
- `legales.spec.ts` (nueva) y el recorrido de las seis rutas en Chromium contra `next start`: 37/37. Comprueban que el `h1` y el título vienen en el HTML del servidor, las migas, las secciones, axe sin violaciones y que se conserva la redacción del aviso de privacidad.
- Sin procesos abiertos.

### 4.21 · `/about` y `/promociones` (2026-11-03) — D-08, D-17, D-18 y D-19

**`/about`**, ahora **de servidor**:
- Se conserva con su URL y sus migas («Inicio › Nosotros», «Volver a «Nosotros»»).
- Texto reescrito (D-17), el mismo de la sección de la landing, y el molino de la casa.
- **Visítanos:** dirección, horario y teléfono de `restaurant.config.ts` en contraetiqueta, «Cómo llegar» al mapa en otra pestaña y «Reservar mesa».
- **Se retiran:**
  - **las opiniones del carrusel**, inventadas (nombres, estrellas y «Google» o «Facebook» como fuente), que PRODUCT.md prohíbe;
  - la misión y la visión de plantilla («líder e innovador en la región»);
  - **la foto de la fachada de Google** (D-18; se mostraba con el respaldo);
  - **el mapa incrustado de Google**: según DESIGN.md, el mapa se enlaza y no carga terceros sin pedirlo;
  - el gancho `useTheme` y los colores escritos a mano.
- **`DistanceToRestaurant`** se conserva porque es una función real (geolocalización).
  - Pasa a los botones del sistema («¿A qué distancia estoy?», «Ver la ruta»).
  - Su comprobación de soporte se lee sin efecto (`useSyncExternalStore`).
  - La lógica, el cálculo y la URL de la ruta no cambian.

**`/promociones`:**
- Se conserva con sus migas.
- Pide `${API}/promociones` como siempre.
- Muestra las **vigentes** (activas y dentro de sus fechas) con la misma `TarjetaPromocion` de la landing (D-19).
- **Si el API falla, lo dice** con «Reintentar». Antes se quedaba en «No hay promociones activas», un vacío falso (PRODUCT.md, principio 3).
- Sin vigentes, un vacío honesto con salida a la carta.
- Fuera: el texto de relleno («¡no te quedes sin probarlos!») y la insignia con gradiente.
- **Retirado** `landing/PromosSection.tsx`, que se quedaba sin uso.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas. `DistanceToRestaurant` tenía un error previo de `setState` en un efecto, corregido al tocarlo.
- Build: correcto.
- `informativas.spec.ts` (nueva) e `imagenes.spec.ts`, con la prueba de `/about` actualizada (ni la foto de Google ni el `iframe` del mapa): 13/13. Comprueba:
  - en `/about`, las migas, que no quedan las opiniones ni la misión y la visión, los datos de la configuración y el mapa enlazado;
  - en `/promociones`, el error con «Reintentar» y, al reintentar, solo la vigente (fuera la caducada y la inactiva);
  - axe y que no desborda a 360 px con texto al 125 % en los dos temas.
- Revisión visual de `/about` a 360 px en oscuro.
- Sin procesos abiertos.

### 4.20 · `/profile` (2026-11-03)

**Lógica sin cambios:**
- Los datos salen de la sesión; sin sesión se va a `/login?redirect=/profile`.
- «Guardar cambios» solo se activa si algo cambió.
- Se pide confirmación.
- Se envía el mismo `PUT /usuarios/perfil/actualizar/{id}` con el formulario completo y el `Authorization` de siempre.
- «Cancelar» restaura los valores del bloque.

**Cambios:**
- `EncabezadoPublico` («Inicio › Tu cuenta», «Volver al inicio») con «Guardar cambios» como acción (`form="formulario-cuenta"`).
- **Dos bloques** («Datos personales» y «Dirección de entrega») con «Editar …» o «Cancelar».
  - Sin editar, los campos se leen como **texto sin caja** (`readOnly`), así que se distinguen a simple vista de los editables. La primera versión los mostraba iguales y se corrigió tras la revisión visual.
  - Campos del sistema con `autocomplete` (`given-name`, `family-name`, `tel`, `address-line1`, `address-level2`, `address-level3`, `postal-code`).
- **Confirmación:** el diálogo del sistema, en lugar del banner ámbar.
- **Validación con `esquemaPerfil` (3.1)**, con el error en cada campo, sin enviar.
- **Resultado:** notificación cálida («Tu cuenta está al día» o «No pudimos guardar los cambios»), sin el mensaje del servidor.
- **Carga:** esqueletos, en lugar de «Sincronizando perfil...».
- Errores registrados con `registrarError`.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `cuenta.spec.ts` (nueva, Chromium contra `next start`, con sesión de cliente y el API simulado) junto con `almacenamiento.spec.ts`: 19/19 y luego 6/6 tras el retoque. Comprueba:
  - «Guardar» inactivo sin cambios y los campos de solo lectura;
  - editar, el diálogo, el **PUT idéntico** y la notificación;
  - que un nombre vacío se marca sin enviar y que «Cancelar» restaura;
  - axe y que no desborda a 360 (al 125 %) y 1440 px, en los dos temas;
  - que no hay `alert()`.
- Revisión visual a 1440 px en los dos temas.
- **No verificado:** guardar con el backend real.
- Sin procesos abiertos.

### 4.19 · `/reset` y `/frm_reset` (2026-11-03) — D-17

**Cambios:**
- **`components/auth/RecuperacionNoDisponible.tsx`** (nuevo, de servidor), que comparten las dos páginas:
  - `EncabezadoPublico` («Inicio › Iniciar sesión › Recuperar contraseña» y «Volver a iniciar sesión»);
  - un `Aviso` informativo **en español**: «Todavía no puedes hacerlo desde aquí. La recuperación de contraseña en línea no está disponible por ahora. Llámanos y te ayudamos a recuperar el acceso a tu cuenta.»;
  - **salidas reales:** «Llamar al +52 771 702 8172», con el teléfono de la configuración, e «Ir a iniciar sesión».
- **`/frm_reset` y `/reset`** pasan a ser componentes de servidor de una línea, con su título en los metadatos.
- Fuera:
  - los avisos en inglés («Password Reset… disabled… handled by Supabase»);
  - el nombre de la empresa escrito con un hex;
  - el estado y la validación de un formulario que no existía;
  - todo el código comentado de Firebase.
- La funcionalidad sigue pendiente en NP-16.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `recuperacion.spec.ts` (nueva, Chromium contra `next start`): 2/2. En cada página comprueba el título, el aviso, el teléfono, el enlace al login, que no queda texto en inglés y axe sin violaciones.
- La primera tanda falló porque el botón y el «Volver» de las migas tenían el mismo nombre. El botón pasó a «Ir a iniciar sesión».
- Sin procesos abiertos.

### 4.18 · `/register` (2026-11-03)

**Lógica sin cambios:**
- Las reglas de siempre, ya recogidas en `esquemaRegistro` (3.1): nombre y apellido, correo, teléfono de 10 dígitos con +52, la contraseña con sus requisitos, sin secuencias ni datos personales, y aceptar las condiciones.
- El **contrato exacto** de `POST /api/auth/register` (`aPayloadRegistro`: `name`, `lastname`, `email`, `phone`, `password`, `passwordConfirm`).
- Los mismos mensajes del API ya filtrados (las listas técnicas y los 5xx no se muestran).
- La vuelta a `/login` a los 3 s.

**Cambios:**
- **`useEnvioFormulario`:**
  - **campo trampa** como defensa principal;
  - **tiempo mínimo por defecto (1 s)**;
  - **sin envío doble**;
  - errores junto a cada campo con `aria-invalid` y un anuncio para lectores, en lugar del botón deshabilitado sin explicación;
  - un fallo de red da un mensaje cálido.
- **Campos del sistema** con etiqueta y `autocomplete` (`given-name`, `family-name`, `email`, `tel-national`, `new-password`). La lada fija +52 va en un campo oculto, como exige el esquema, y se dice en la ayuda del teléfono.
- **Requisitos de la contraseña** visibles bajo el campo, con su estado en texto para lectores («cumplido» o «pendiente»). Sustituyen al botón con ventana y a la barra de colores con estilo en línea.
- La casilla de las condiciones enlaza a `/condiciones` y `/privacidad`; antes eran textos que parecían enlaces y no lo eran.
- **Foto de fondo (BITÁCORA 3.1):** solo desde 1024 px, con `sizes` y `preload`, porque a 1440 px es el LCP.
- `EncabezadoPublico` («Inicio › Iniciar sesión › Crear cuenta») y entradilla nueva (D-17).
- Éxito en un `Aviso` sin «Redirigiendo» (D-20).

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `registro.spec.ts` (nueva, Chromium contra `next start`, con el API simulado) e `imagenes.spec.ts`: 15/15. Comprueba:
  - el **payload exacto**, con los espacios del nombre limpiados y la lada, el aviso de éxito y la vuelta a `/login`;
  - los requisitos con su estado y el aviso de secuencias;
  - el envío vacío, que marca cada campo sin llamar al API;
  - que el error de validación del API no muestra texto técnico y que el campo trampa bloquea un segundo envío;
  - axe y que no desborda a 360 (al 125 %) y 1440 px, en los dos temas.
- Revisión visual a 360 px con texto al 125 % en claro.
- Sin procesos abiertos.

### 4.17 · `/login` (2026-11-03)

**Lógica sin cambios:**
- `POST /api/auth/login` con `{ email, password }`.
- El token en la cookie `session` y en `authToken` (D-03, hasta NP-04).
- El usuario solo en el store (2.15).
- El bloqueo temporal que lee `useLockout` del texto del API.
- El destino validado tras entrar (2.13).
- El enlace al registro con la ruta de origen.
- El fondo configurable de los ajustes, que se sigue leyendo tras montar para que no cambie al hidratar.

**Cambios:**
- **Errores genéricos (NP-15):**
  - un 400, 401 o 404 dice siempre «El correo o la contraseña no coinciden»: nunca si la cuenta existe ni el texto del servidor;
  - un fallo de red u otro estado: «No pudimos iniciar sesión…»;
  - se conservan el aviso de demasiados intentos (429) y el de bloqueo, que ahora dice «Podrás intentarlo de nuevo en N segundos», con el botón inactivo.
- **`useEnvioFormulario`** con `esquemaAcceso`, el **campo trampa** y `tiempoMinimoMs={0}` (con autorrelleno, una persona entra en menos de un segundo; decisión del usuario). Impide el **envío doble** y valida el formato del correo sin llamar al API.
- **Campos del sistema** con etiqueta asociada, `autocomplete` (`email`, `current-password`), `inputmode` y la contraseña revelable.
- `EncabezadoPublico` («Inicio › Iniciar sesión», «Volver al inicio») y entradilla nueva (D-17).
- La foto en un marco del sistema, no en la tarjeta redondeada con sombra.
- **Al entrar:** `CargadorMarca` («Te llevamos a tu cuenta…» para lectores), en lugar de «¡Login exitoso! Redirigiendo...» (D-20).
- Fuera: `FloatingInput`, `PasswordToggleButton`, `Button`, `BackButton` y las clases `.auth-*`, `.btn-primary` y `.alert-*` en esta página.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `acceso.spec.ts` (nueva, Chromium contra `next start`, con `/api/auth/login` simulado) junto con `almacenamiento.spec.ts`, `imagenes.spec.ts` y `urls.spec.ts`: 30/30. Comprueba:
  - las etiquetas y el `autocomplete`;
  - el error genérico, que no repite el texto del API ni dice si la cuenta existe;
  - el bloqueo con sus segundos y el botón inactivo;
  - que un correo inválido no llama al API;
  - el cargador al entrar, sin «Redirigiendo»;
  - axe y que no desborda a 360 (al 125 %) y 1440 px, en los dos temas.
- `almacenamiento.spec.ts` usa ya las etiquetas en lugar de los `id`.
- Revisión visual a 1440 px en oscuro.
- Sin procesos abiertos.

### 4.16 · `/reservations` (2026-11-03)

**Lógica sin cambios:**
- Los cuatro pasos (contacto, cuándo, mesa, confirmación).
- La sesión que rellena el contacto.
- `useReservationAvailability` y `getTableMap(fechaHora)`.
- El **mismo payload** de `createReservation`.
- Solo se eligen mesas disponibles.
- El teléfono se queda como hoy: su validación real es del servidor (NP-06).

**Interfaz y protección:**
- **`ReservationSidebar`** (también lo usa el panel de la landing, D-19):
  - pasos en lista con `aria-current="step"`, como en el checkout; la barra de progreso tenía un estilo en línea;
  - **campos del sistema** con etiqueta y `autocomplete` (`name`, `tel`, `email`) e `inputmode`;
  - `AreaTexto` para las peticiones;
  - **validación con los esquemas del 3.1** (`esquemaReservaContacto`, `crearEsquemaReservaHorario`, `esquemaReservaMesa`), con los mismos mensajes, ahora junto a cada campo con `aria-invalid`;
  - resumen en contraetiqueta, con la fecha legible y la hora en 24 h («sábado, 15 de junio, 14:30»).
- **Envío con `useEnvioFormulario`** (decisión del usuario del 2026-11-01):
  - campo trampa como defensa principal;
  - tiempo mínimo de 1 s;
  - sin envío doble;
  - anuncio para lectores;
  - si falla, «No pudimos confirmar tu reserva…», sin el mensaje del servidor.
- **`TableMap`:**
  - mesas por área como botones con `aria-pressed` («Libre», «Elegida» u «Ocupada» con texto); la ocupada, deshabilitada y con borde discontinuo;
  - mientras busca, `CargadorMarca` («Buscando mesas libres…»);
  - si falla o no hay mesas, un aviso cálido.
- **`/reservations`:** `EncabezadoPublico`, el formulario en una tarjeta y la salida de llamar con el teléfono de `restaurant.config.ts` (antes estaba escrito en la página).
- **Fallo corregido de paso:** la página y el panel cambiaban la `key` del formulario en `onSuccess`. El formulario se volvía a montar y la confirmación no llegaba a verse. Ahora la confirmación («Mesa reservada» y el mensaje del API) se ve y el formulario vuelve al primer paso. El payload no cambia.
- Fuera: «Cargando preferencias de reserva...», «¡Todo Listo!» con el check animado y los colores verdes literales.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `reservas.spec.ts` (nueva, Chromium contra `next start`, con el API simulado) y `landing.spec.ts`, que incluye el panel de la landing: 33/33. Comprueba:
  - los cuatro pasos, la mesa ocupada deshabilitada, la elegida con `aria-pressed`, el **payload idéntico** y la confirmación visible;
  - los errores por campo con los mensajes de siempre;
  - que el campo trampa rechaza sin llamar al API;
  - axe y que no desborda en el plano a 360 (al 125 %), 768 y 1440 px, en los dos temas;
  - que no hay `alert()`.
- La prueba completa espera 1 s antes de confirmar: Playwright recorre los cuatro pasos en menos tiempo y el envío protegido lo rechazaba, como corresponde.
- Revisión visual a 768 px en claro. Se corrigió «02:30 p.m..», con el punto doble, pasando a 24 h.
- **No verificado:** reservar con el backend real.
- Sin procesos abiertos.

### 4.15 · `/menu/pedido/checkout/exito` (2026-11-03) — D-17 y D-20

**Cambios:**
- **Lógica sin cambios:** busca la factura del pedido (`/facturas/{ordenId}`) y la descarga en PDF o XML en otra pestaña (`noopener,noreferrer`), con las mismas URL.
- **Interfaz:**
  - migas, el **sello de la casa** como firma, el filete doble y el `h1` en Fraunces;
  - las descargas con los botones del sistema y «Ver tu pedido» como acción principal.
- **Textos (D-17):** «Gracias, tu pedido está pagado» y «Ya lo estamos preparando. Puedes seguir su estado desde tu pedido.». Sustituyen a «¡Pago confirmado!» y a «Te avisaremos cuando salga a reparto», una promesa que nada en el código cumple.
- **Estados (D-20):** `CargadorMarca` mientras busca la factura y en el `Suspense`, en lugar de «Cargando...» y del giro.
- Error registrado con `registrarError`.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `checkout.spec.ts`, con la prueba nueva de la confirmación (con sesión de cliente: el proxy protege todo `/menu/pedido`): 9/9. Comprueba el título, la ausencia de «Cargando…», la URL exacta que abre la descarga del PDF, el enlace a tu pedido y axe sin violaciones.
- Sin procesos abiertos.

### 4.14 · `/menu/pedido/checkout` (2026-11-03)

**Lógica sin cambios:**
- La misma carga: sesión (o login con `callbackUrl`), pedido, direcciones y métodos guardados, con su preselección.
- Las mismas llamadas y payloads: `/direcciones`, `/metodos-pago/setup-intent`, `/metodos-pago`, `/pagos/crear-intento` y `/facturas`.
- Las mismas llamadas a Stripe: `confirmCardSetup` y `confirmCardPayment`, salvo si el backend devuelve `succeeded`.
- La misma redirección al éxito y los cinco pasos.

**Interfaz nueva:**
- `EncabezadoPublico` («Inicio › Pedir › Tu pedido › Pago», «Volver a tu pedido»).
- Pasos en una lista con `aria-current="step"`. Por debajo de 640 px, solo los filetes y «Paso 2 de 5 · Entrega».
- Cada paso con su título en Fraunces.
- Direcciones y tarjetas guardadas como **radios nativos** en una etiqueta de 56 px.
- **Campos del sistema con etiqueta**, `autocomplete` (`address-line1`, `address-line2`, `address-level1` a `address-level3`, `postal-code`, `organization`, `email`), `inputmode` numérico o de correo y `codigo` en RFC y códigos postales. Casillas del sistema.
- **Validación con los esquemas del 3.1** (`esquemaDireccionEnvio`, `esquemaDatosFiscales`): los mismos mensajes, ahora **por campo** (`aria-invalid`) y con un resumen. El correo fiscal se comprueba si se escribe (decisión del usuario del 2026-11-01).
- **`CardElement` con los tokens del tema:** Stripe pinta dentro de su iframe y no lee variables CSS, así que los colores se leen en el navegador y se vuelven a leer al cambiar de tema. Sin los hex de antes. Fuente del sistema: la propia no carga dentro del iframe de Stripe.
- **Redacción (D-20):** errores del servidor cálidos y sin su mensaje. Los de Stripe sí se muestran porque son para la persona («Tu tarjeta fue rechazada»).
- Una nota de confianza: «Los datos de tu tarjeta los recibe Stripe directamente…».
- Estados: esqueletos al cargar; si falla, `EstadoError` con «Reintentar»; si no hay pedido, salida a tu pedido.

**`solo-lectores` pasa a `@utility`** en `styles/componentes.css`. Como clase del bloque de componentes, Tailwind v4 no generaba sus variantes:
- `max-sm:solo-lectores` (los nombres de los pasos) se veía en móvil;
- `max-xl:solo-lectores` (el «Iniciar sesión» de la cabecera desde el 3.11) seguía visible por debajo de 1280 px.

Comprobado en el CSS compilado.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `checkout.spec.ts` (nueva, Chromium contra `next start`, con sesión de cliente y el API simulado): 8/8. Comprueba:
  - los cinco pasos con la dirección y la tarjeta guardadas, el **payload idéntico** de `/pagos/crear-intento` y la redirección;
  - la dirección nueva (etiquetas, `autocomplete`, `inputmode`, errores por campo y el payload de `/direcciones`);
  - la factura (RFC y correo fiscal inválidos marcados; el correo vacío vale);
  - el pedido inexistente;
  - axe y que no desborda a 360 (al 125 %) y 1440 px, en los dos temas;
  - que no hay `alert()` ni `confirm()`.
- Con `landing.spec.ts` y `marca.spec.ts`: 40/40.
- Revisión visual a 360 px en oscuro, que mostró los nombres de los pasos cortados (el problema de `solo-lectores`), y a 1440 px en claro.
- **No verificado:** pagar con tarjeta nueva, guardarla, 3-D Secure y el `CardElement` real con sus colores. Hace falta una clave de prueba de Stripe y backend (ver el 2.5).
- Sin procesos abiertos.

### 4.13 · `/menu/pedido` (2026-11-03) — D-20

**Lógica sin cambios:**
- Los mismos endpoints: `GET /pedidos/usuario` con mesa y con `tipo=domicilio` (con el `Authorization` que ya enviaba), `PATCH /pedidos/cancelar/{id}`, `DELETE /pedidos/item/{id}` y `POST /pedidos/confirmar/{id}`.
- La mesa sigue en `?mesaQuery` y en `num_mesa`, y «Liberar la mesa» la borra.
- La ventana de 2 minutos para cancelar.
- El paso al checkout con `?orderId=`.
- El proxy sigue exigiendo sesión (2.10).

**Interfaz nueva:**
- `EncabezadoPublico` («Inicio › Pedir › Tu pedido», «Volver a «Pedir»») con «Liberar la mesa» como acción.
- **`Pestanas`** del sistema («En mesa» y «A domicilio»), con la pestaña en `?tab=`, como antes.
- **`TarjetaPedido`:**
  - título («Lo que llevas» o «Pedido ABCD1234»);
  - el estado **con palabras e insignia**: «Por confirmar», «En cocina», «En preparación», «En camino», «Entregado» y «Cancelado». Antes se mostraba el valor crudo (`pendiente`, `abierta`);
  - las líneas con foto o respaldo, «2 × $ 120» y subtotal tabular;
  - el total en Fraunces;
  - «Quitar {plato}» con nombre accesible.
- **`confirm()` → diálogo de confirmación** del sistema, con pregunta y verbos claros: «¿Quitar Croquetas de jamón de tu pedido?» con «Quitar» o «Dejarlo»; «¿Enviar tu pedido a cocina?»; «¿Cancelar este pedido?», destructiva.
- **`alert()` → notificaciones** con redacción cálida («Tu pedido va a cocina», «No pudimos cancelarlo. Puede que ya esté en preparación. Pregunta en sala.»). Nunca el mensaje del servidor.
- «Actualizar» (antes un icono sin nombre), esqueletos mientras se comprueba la sesión o se cargan los pedidos, y vacíos del sistema que llevan a la carta.
- Una comanda que ya no se puede cancelar lo dice con texto («Ya está en cocina: para cambiarlo, avisa en sala.»), en lugar de un botón gris «En preparación».
- Los errores se registran con `registrarError` (2.8).

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `pedido.spec.ts` (nueva, Chromium contra `next start`, con sesión de cliente y el API simulado): 10/10. Comprueba:
  - el carrito, la comanda, los precios, los estados con palabras y la mesa;
  - quitar, enviar a cocina y cancelar con el diálogo, incluido «Dejarlo», que no llama al API, y las llamadas exactas a cada endpoint;
  - que la página nunca abre `alert()` ni `confirm()`;
  - la pestaña de domicilio desde la URL y «Continuar al pago» con el mismo enlace;
  - el paso a `/login` sin sesión;
  - axe y que no desborda a 360 (al 125 %), 768 y 1440 px, en los dos temas.
- `almacenamiento.spec.ts` (claves de sesión y `num_mesa`): verde en la misma tanda.
- Revisión visual a 768 px en oscuro. El título del carrito repetía «Por confirmar» junto a la insignia y pasó a «Lo que llevas».
- **No verificado:** con el backend real.
- Sin procesos abiertos.

### 4.12 · `/menu/producto/[id]` (2026-11-03) — D-20 y D-21

**Lógica sin cambios:**
- Los mismos endpoints: `/menu/items/{id}`, `/recommendations/combo/{id}`, `/mesas` y `POST /pedidos/mesa`.
- Los mismos payloads: con mesa o sin ella, y con combo.
- Las mismas redirecciones: login con `callbackUrl`, `/menu/pedido?mesaQuery=…&tab=mesa` y `?tab=domicilio`.
- El límite de 20 unidades.
- La confirmación del enlace `autoExecute` (2.13). Su título dice ahora «plato» en lugar de «platillo», con su prueba actualizada.
- El efecto de `autoExecute` se movió detrás de la función que llama, por la regla de lint `react-hooks/immutability`. Sus dependencias son las mismas.

**Interfaz nueva:**
- Migas («Inicio › La carta › {plato}») y «Volver a la carta».
- Foto 4:5 fija al desplazar en escritorio, con `preload`.
- `h1` en Fraunces con el filete doble.
- Insignias sin emoji: «Agotado», «Nuevo» y «De los más pedidos» (antes «★ Nuevo» y «🔥 Popular»).
- Contraetiqueta con la sección, el precio con «IVA incluido» y los alérgenos.
- **Selector de cantidad** accesible: botones de 44 px «Quitar uno» y «Añadir uno», y el valor en un `output` que se anuncia.
- «Pedir en mesa» como acción principal y «Para domicilio» como secundaria.
- **Elegir mesa:** un `Dialogo` con las mesas como opciones (`radio` en una etiqueta de 56 px). Mientras busca, `CargadorMarca`; si falla, un aviso.
- **Sin `alert()`:**
  - el éxito es una **notificación** («Añadido a tu pedido»), que sobrevive a la navegación;
  - el fallo es un **aviso en línea** cálido: «No pudimos añadirlo a tu pedido…». Ya no se muestra el mensaje del servidor, que podía ser técnico.
- **Estados (D-20 y D-21):**
  - Cargando: esqueletos, en lugar de «Cargando experiencia gastronómica…».
  - Error: cálido, con «Reintentar».
  - Plato inexistente: `PaginaEstado` («Este plato ya no está en la carta»), en lugar de `notFound()`.
- Los errores se registran con `registrarError` y no con `console.error` del objeto (2.8).
- **`ProveedorNotificaciones`** pasa a `AppProviders`, para todo el sitio. Hasta ahora solo existía en el catálogo y nadie podía sustituir `alert()` por una notificación.

**Pruebas:**
- `producto.spec.ts` (nueva, Chromium contra `next start`, con el API simulado): 12/12. Comprueba:
  - la contraetiqueta, las insignias, el combo y que no hay emoji;
  - el selector de cantidad;
  - pedir en mesa con el diálogo, el **payload idéntico** (`{ platilloId: 7, cantidad: 2, usuarioId: 41, mesa: "5" }`), la redirección y la notificación;
  - el fallo con aviso y sin `alert()` ni el mensaje del servidor;
  - el plato inexistente y el error de carga;
  - axe y que no desborda a 360 (al 125 %), 1024 y 1440 px, en los dos temas.
- `urls.spec.ts` (autoExecute) y `csp.spec.ts`: verdes en la misma tanda.
- **Artefacto de las pruebas corregido:** la simulación del API respondía también a las peticiones RSC de la navegación de Next. Next recibía un JSON, recargaba la página entera y la notificación se perdía. Ahora se excluyen las peticiones con cabecera `rsc`, también en el `simularApi` compartido; la batería completa lo comprobará al cerrar la fase.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- Revisión visual a 1440 px en claro.
- **No verificado:** el pedido real (sin backend).
- Sin procesos abiertos.

### 4.11 · `/menu/categoria/[slug]` (2026-11-03) — D-20 y D-21

**Cambios:**
- **`app/menu/categoria/[slug]/page.tsx`**, reescrita con la misma petición (`/menu/categories/with-products` del API), la misma búsqueda por `id`, los mismos enlaces a `/menu/producto/{id}` y la misma tolerancia a los nombres en español o en inglés.
  - `EncabezadoPublico` con las migas («Inicio › La carta › Arroces»), «Volver a la carta», el nombre y la descripción que envía el API.
  - Foto de la sección (21:9) solo si existe.
  - Rejilla de **`TarjetaPlato`** (nueva, `components/carta/`): foto 4:5 o respaldo, nombre en Fraunces, precio tabular y descripción. La tarjeta entera lleva al detalle con el patrón de `Tarjeta` (el enlace es el título, extendido, y el foco rodea la tarjeta). Agotado: insignia de aviso con el texto «Agotado».
  - Estados (D-20):
    - Cargando: esqueletos, sin «Cargando categoría…».
    - Error: «No pudimos traer esta sección», con «Reintentar» y «Llamar al restaurante».
    - Vacía: un estado honesto.
  - **Sección que no existe (D-21):** `PaginaEstado` con la ilustración del plato y su campana y el texto «Esta sección de la carta no existe», en lugar del 404 genérico.
  - Fuera: el «$0.00» inventado cuando faltaba el precio (ahora no se muestra), «Sin imagen», «Platillo sin nombre» y `BackButton`.
- **`estilos-boton.ts`** (botones de todo el sitio): sin `whitespace-nowrap`; con `max-w-full`, texto centrado y equilibrado.
  - Un rótulo largo pasa a dos líneas antes que desbordar a 360 px con texto al 125 % (WCAG 1.4.10). Lo detectó la prueba con «Ver todas las secciones», como antes «Pedir» en el 4.8.
  - En los anchos habituales no cambia nada: los rótulos son cortos.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `categoria.spec.ts` (nueva, Chromium contra `next start`, con el API simulado) junto con `carta.spec.ts` y `landing.spec.ts`: 49/49. Comprueba:
  - las migas, los platos, el precio, «Agotado», los nombres en inglés y el respaldo sin foto;
  - que un clic en la foto lleva al detalle;
  - la sección vacía;
  - la página de estado de una sección inexistente;
  - el error cálido sin texto técnico, y que «Reintentar» vuelve a pedirla;
  - axe y que no desborda a 360 (al 125 %), 768 y 1440 px, en los dos temas.
- Revisión visual a 1440 px en oscuro.
- Las pruebas del catálogo con el cambio de los botones se pasan al cerrar la fase.
- Sin procesos abiertos.

### 4.10 · `/menu` (2026-11-03) — D-17 y D-20

**Cambios:**
- **`app/menu/page.tsx`**, reescrita con los componentes del catálogo. Sigue siendo de cliente y pidiendo `/api/menu/categories`, y conserva los enlaces de categoría (`/menu/categoria/{id}?bg=…`) y de plato (`/menu/producto/{id}`).
  - **`EncabezadoPublico`** (nuevo, en `components/marca`): migas de pan, «Volver» a la sección de origen, el `h1` con el filete doble y la entradilla (D-17: «Recorre la carta por secciones o busca un plato por su nombre.»). Lo reutilizarán las demás páginas públicas.
  - **Búsqueda:** `Buscador` con `useFiltroLocal` (sin tildes ni mayúsculas, con el número de resultados anunciado).
    - El dictado por voz pasa a `hooks/useDictado.ts` y `components/pwa/BotonDictado.tsx`: `aria-pressed` y avisos en `role="status"`. Solo aparece si el navegador lo admite.
    - Sin resultados: `EstadoVacio` con «Ver toda la carta».
  - **Secciones:** navegación por anclas, foto de la sección (o del primer plato que la tenga, o el respaldo) en la columna estrecha, alternando de lado, hasta cuatro platos con precio tabular y «Ver toda la sección (n)».
  - **Estados (D-20):**
    - Cargando: esqueletos del tamaño de lo que viene, sin «Cargando menú…».
    - Error: «No pudimos traer la carta», con «Reintentar» que vuelve a pedirla y «Llamar al restaurante». Antes era «No se pudo cargar el menú. Intenta más tarde.».
    - Vacía: un estado honesto.
    - El error se registra con `registrarError` (2.8).
  - **Fuera:** la foto de portada repetida de la landing, el «MENÚ» en mayúsculas, la máscara en estilo en línea, el SVG a mano y el texto de relleno («Ya seas un amante…»).
- **`OnlineOnly`**, compartido por varias páginas: ahora es un `EstadoVacio` con `WifiOff` y otra salida. Su estado «ya montado» se deriva durante el render, sin efecto, que daba un error de lint que ya existía.
- **Landing:** la portada y las secciones sin datos ya **no esperan al API**.
  - La página empieza las dos peticiones en paralelo y cada sección con datos (Nosotros, Menú y Promociones) espera en su `Suspense`, con esqueletos (`EsqueletoTarjetas`).
  - Antes, la precarga de la foto de portada y todo el HTML esperaban hasta 8 s a la carta y las promociones, y la precarga caía fuera del `<head>`. Lo detectó la prueba de imágenes.
- **«Volver» desde la carta:** «Volver a «Menú»», como las demás secciones.
- **Retirado:** `components/pwa/VoiceSearch.tsx`, sustituido por `useDictado` y `BotonDictado`.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `carta.spec.ts` (nueva, Chromium contra `next start`, con `/api/menu/categories` simulado): 15/15. Comprueba:
  - las secciones, los precios, los enlaces de siempre, las migas, «Volver» y el respaldo de la foto que no existe;
  - la búsqueda y su anuncio;
  - los esqueletos sin texto de proceso;
  - el error cálido sin texto técnico, y que «Reintentar» vuelve a pedirla;
  - la carta vacía;
  - axe y que no desborda en los 5 anchos, en los dos temas, con texto al 125 % en 360 y 1024.
- Con `landing.spec.ts` e `imagenes.spec.ts`: 46/46. La precarga de la portada vuelve a estar en el `<head>`, con el recorte.
- Revisión visual a 1440 px en claro y a 360 px con texto al 125 % en oscuro. Se corrigieron:
  - la foto de la sección alterna, que ocupaba la columna ancha;
  - el subrayado grueso de los nombres de plato, que ahora es fino y solo al pasar.
- Sin procesos abiertos.

### 4.9 · Visítanos (`#visitanos`) (2026-11-03) — D-19

**Cambios:**
- **`components/landing/secciones/Visitanos.tsx`:**
  - En contraetiqueta, la dirección, el horario y el teléfono de `restaurant.config.ts`.
  - **«Cómo llegar»** enlaza el mapa de la configuración en otra pestaña (`noopener noreferrer`) y lo dice a los lectores. **Sin iframe**: no carga terceros hasta que la persona lo pide.
  - **Redes** (Facebook e Instagram): iconos de Lucide, el nombre visible y «… de El Quijote (abre en otra pestaña)» para lectores.
  - Título y entradilla (D-17) sacados de la dirección («En la plazuela Hidalgo…»), sin inventar distancias ni referencias.
- **Landing:** las seis secciones ya son componentes propios. `page.tsx` solo pide los datos y los reparte.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas, tras quitar un import que dejó de usarse.
- Build: correcto.
- `landing.spec.ts` (Chromium contra `next start`): 24/24. Prueba nueva: los tres datos, el mapa enlazado con `target` y `rel`, ningún `iframe` en la página y las redes con su nombre accesible.
- Sin procesos abiertos.

### 4.8 · Pedir (`#pedir`) (2026-11-03) — D-19

**Cambios:**
- **`components/landing/secciones/Pedir.tsx`:** los dos modos que ya existen, cada uno con su icono de Lucide, título en Fraunces, una frase y un enlace a su página:
  - **En tu mesa:** «Pedir desde la carta» (`/menu`). El número de mesa ya viaja en la URL hasta el pedido.
  - **A domicilio:** «Ver mis pedidos a domicilio» (`/menu/pedido?tab=domicilio`, la pestaña que ya admite esa página), con pago en línea.
  - Debajo, en contraetiqueta a dos columnas, el horario y el teléfono de `restaurant.config.ts`.
  - No se prometen tiempos, zonas de reparto ni costes: no están en ningún dato (D-17).
- Los botones de las tarjetas pasan a dos líneas si no caben: a 360 px con texto al 125 %, «Ver mis pedidos a domicilio» desbordaba la página. Lo detectó la prueba.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `landing.spec.ts` (Chromium contra `next start`): 23/23.
  - La primera tanda falló a 360 px con texto al 125 % por el desbordamiento; ya está corregido.
  - Prueba nueva: los dos modos con sus enlaces, el horario y el teléfono.
- Sin procesos abiertos.

### 4.7 · Reservas (`#reservas`) (2026-11-03) — D-19

**Cambios:**
- **`components/landing/secciones/Reservas.tsx`:** banda café centrada con el **sello de la casa** (su única aparición en la página), el horario y el teléfono de `restaurant.config.ts` en contraetiqueta, y dos salidas:
  - **«Reservar mesa»** (`ReservarEnPanel`) abre el **flujo real**, `ReservationSidebar`, en un `PanelLateral` amplio dentro de la misma página (D-19). **No se cambian su lógica ni su payload**: se monta igual que en `/reservations`, con la misma `key` que se reinicia en `onSuccess` y el mismo `OnlineOnly` con la salida de llamar.
    - El formulario se carga con `next/dynamic` al abrir el panel; mientras llega, `CargadorMarca` («Preparando tu reserva…»).
    - Su interior conserva el estilo antiguo hasta el 4.16, que lo rehace.
  - «Abrir en su propia página» lleva a `/reservations`, que sigue existiendo (D-08).
- **`PanelLateral`:** nueva opción `ancho="amplio"` (`min(40rem, 100vw − 3rem)`) para un formulario con plano. El catálogo sigue usando el ancho normal.
- **Retirado** `landing/ReservationSection.tsx`, el formulario simulado que confirmaba sin llamar al API (PLAN 4.7).
- **Alternancia de fondos:** DESIGN.md quiere la reserva en banda café. Quedan así: Nosotros fondo, Menú café, Promociones fondo, Reservas café, Pedir fondo y Visítanos café.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `landing.spec.ts` (Chromium contra `next start`): 22/22. Las pruebas nuevas, a 360 y 1440 px:
  - el panel se abre con el formulario real (primer paso: datos de contacto) y, a 1440 px, mide más de 500 px sin pasarse de la pantalla;
  - el marco del panel no añade violaciones de axe;
  - Esc lo cierra y el foco vuelve a «Reservar mesa».
- Revisión visual: la página entera a 768 px en oscuro.
- **No verificado:** reservar de verdad desde el panel (sin backend). El payload es el mismo porque el componente no cambia.
- Sin procesos abiertos.

### 4.6 · Promociones (`#promociones`) (2026-11-03) — D-19

**Cambios:**
- **`components/landing/secciones/PromocionesLanding.tsx`:**
  - Muestra como mucho tres promociones **vigentes** del API: activas, con título y dentro de sus fechas (`promocionesVigentes`, 4.2).
  - `TarjetaPromocion` lleva la foto si la hay (decorativa), la insignia que pone el admin (tono acento), el título en Fraunces y la descripción. En contraetiqueta van «Antes» tachado, «Precio» y «Hasta el», cada uno solo si existe.
  - Desaparecen el emoji y el degradado de color del diseño anterior.
  - Enlace «Ver todas las promociones» a `/promociones` (D-08).
  - Sin datos: el error cálido con «Reintentar». Sin vigentes: «Ahora mismo no hay promociones vigentes.», sin enlace.
  - `TarjetaPromocion` se exporta para que `/promociones` la reutilice en el 4.21.
- **`lib/formato/fecha.ts`:** «30 de noviembre». Una fecha sin hora se lee como ese día, sin desplazarse por la zona horaria.
- **Catálogo:** dos promociones de ejemplo (una con precio y vigencia, otra con foto) y el caso sin vigentes.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- `pnpm test:unidad`: 49/49, con el formato de la fecha.
- `landing-catalogo.spec.ts`, Chromium contra `next dev`: 8/8. Comprueba:
  - las tarjetas, la contraetiqueta («$ 480» tachado, «$ 390», «30 de noviembre»), el enlace y la ausencia de emoji;
  - el caso sin vigentes;
  - axe y que no desborda a 360 y 1440 px en los dos temas.
- Build: correcto. `landing.spec.ts` contra `next start`: 20/20.
- Revisión visual: el catálogo a 1440 px en oscuro.
- Sin procesos abiertos.

### 4.5 · Menú (`#menu`) (2026-11-03) — D-19 y D-20

**Cambios:**
- **`components/landing/secciones/MenuLanding.tsx`:** hasta cuatro platos reales del API, uno por categoría y primero los que tienen foto (`seleccionarPlatos`).
  - Cada tarjeta lleva la foto 4:5 (o el respaldo), el nombre en Fraunces, la descripción y una contraetiqueta con la sección y el precio. Sin emoji.
  - **Un único botón**, «Ver la carta completa», hacia `/menu` (D-19). Las tarjetas no enlazan a otra parte.
  - Sin datos: el error cálido con «Reintentar» y «Llamar al restaurante». Con la carta vacía: «Todavía no hay platos publicados en la carta.», sin inventar nada.
- **`lib/formato/precio.ts`:** `$` con espacio duro y sin decimales si es entero. Devuelve `null` si el precio no es válido: nunca se muestra «$ 0» en lugar de un precio que falta.
- **Sección activa de la cabecera:** se calcula en cada desplazamiento con la sección que cruza la línea media de la pantalla. Con `IntersectionObserver` dependía de cómo se agrupaban los avisos en un desplazamiento suave: la prueba de navegación falló una vez al crecer la sección.
- **Retirados por quedarse sin uso:** `landing/MenuSection.tsx` y `landing/CategoriesSection.tsx`.
- **Catálogo:** «Menú» con tres platos de ejemplo (uno sin foto) y con la carta vacía.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 errores. El único aviso es de `PromosSection.tsx`, que no se tocó y rehace el 4.6.
- `pnpm test:unidad`: 48/48, con el formato del precio.
- `landing-catalogo.spec.ts`, Chromium contra `next dev`: 7/7. Comprueba:
  - las tarjetas, el precio «$ 420» con espacio duro y el respaldo del plato sin foto;
  - que no hay enlaces en las tarjetas y que el único botón lleva a `/menu`;
  - el texto con la carta vacía;
  - axe y que no desborda a 360 y 1440 px en los dos temas.
- Build: correcto. `landing.spec.ts` y `navegacion.spec.ts` contra `next start`: 20/20, 5 omitidas (solo en `dev`).
- Revisión visual: el catálogo a 360 px en oscuro; las tarjetas se apilan.
- Sin procesos abiertos.

### 4.4 · Nosotros (`#nosotros`) (2026-11-03) — D-17, D-18 y D-19

**Cambios:**
- **`components/landing/secciones/Nosotros.tsx`:**
  - El contenido de `/about` reescrito con D-17: la propuesta de PRODUCT.md, sin misión ni visión de plantilla, sin «líder de la región» y sin las opiniones inventadas.
  - El molino de la casa.
  - El enlace «Conoce la casa» a `/about`.
  - Una **galería** con fotos de platos que envía el API, con su nombre como pie y, como mucho, tres. Sin fotos no se pinta.
- **Decisión conservadora (D-18):** no hay fotos propias de sala, fachada ni bodega.
  - La portada es de IA (NP-33).
  - La fachada de `/about` es de Google y queda excluida.
  - Las de fondo de login y registro parecen de banco por su nombre (Pixabay).
  - Así que la galería no presenta ninguna foto como «la casa»: usa fotos de platos subidas por el restaurante. Anotado en NP-43 §4.
- **`lib/publico/seleccion-platos.ts`:** reparte los platos reales entre «Menú» (4.5) y la galería sin repetir. En el menú va uno por categoría y primero los que tienen foto.
- **`components/marca/MolinoAnimado.tsx`** (D-21: conversión de `landing/MolinoAnimado.jsx` a TSX con tokens):
  - El relleno es el fondo sobre el que va.
  - El giro pasa de SMIL (`animateTransform`, que ignora `prefers-reduced-motion`) a CSS: dos vueltas y se para. Sin movimiento con movimiento reducido.
  - Las aspas y el pasto se dibujan sin `<use>`, porque los estilos del documento no llegaban a sus copias y las aspas salían negras.
  - Duraciones en tokens (`--duracion-molino-aspas`, `--duracion-molino-viento`).
  - `/about` usa la versión nueva.
- **Retirados por quedarse sin uso:** `landing/Hero.tsx`, `landing/Plato.jsx` (D-21: el plato ya no se usa y sus estilos `.plato-boceto` salen de `globals.css`), `landing/MolinoAnimado.jsx` y `landing/AboutSection.tsx`.
- **Catálogo:** nueva sección «Secciones de la landing», con «Nosotros» y datos de ejemplo. Allí se prueban las secciones con datos, que en el build no hay backend. Las pruebas unitarias no pueden renderizar componentes con `next/link`.

**Verificación:**
- Typecheck: 0 errores.
- Lint: limpio en los archivos nuevos. `/about` mantiene sus 4 errores previos, comparado con `HEAD`.
- `pnpm test:unidad`: 47/47, con la selección de platos.
- `landing-catalogo.spec.ts` (nueva, Chromium contra `next dev`): 6/6. Comprueba:
  - la galería, sus pies, fotos de la nube de la casa y el respaldo sin foto;
  - que el molino gira dos veces y se para con movimiento reducido;
  - axe sin violaciones y sin desbordar a 360 (texto al 125 %) y 1440 px, en los dos temas.
- Build: correcto. Landing, portada y recorrido de `/` y `/about` contra `next start`: 30/30.
- Revisión visual a 1440 px en claro:
  - la primera versión pintaba las aspas en negro (el problema de `<use>`) y el respaldo se perdía sobre la banda café; ya corregido;
  - las fotos son diferidas y en la captura aún no habían cargado; la prueba comprueba sus URL.
- Sin procesos abiertos.

### 4.3 · Portada (`#inicio`) (2026-11-03)

**Cambios:**
- **`components/landing/secciones/Portada.tsx`:**
  - Fotografía a sangre de la nube de la casa (D-18): `Gemini_Generated_Image_2mv3…`, la que fija el PLAN. Se comprobó con `curl -I` (200).
  - El velo `--velo-portada`, con uno lateral desde 768 px, el titular en Fraunces (`--texto-portada`), el lema y dos anclas de la propia página: «Reservar mesa» (`#reservas`) y «Ver la carta» (`#menu`).
  - **Marca de agua:** se recorta en la entrega con `c_crop,w_0.9,h_0.9,g_north_west`, sin tocar el recurso. La foto (unos 1426 px tras el recorte) nunca se amplía (`c_limit`).
  - **LCP:** `preload` (el `priority` de Next 16), `fetchPriority="high"` y `sizes="100vw"`. Es la única imagen precargada de la página.
- **`cargadorConRecorte()`** y la prop `recorte` de `Imagen`: un recorte de Cloudinary encadenado antes del ancho, validado con la misma expresión que las transformaciones.
- **Cabecera transparente sobre la portada** (aplazada del 3.11):
  - `MarcoCabecera` sabe si la foto sigue bajo la cabecera y entonces pone `data-sobre-portada` y `.sobre-fotografia`, sin fondo y con `--velo-cabecera`.
  - En el servidor ya sale así en `/`, sin parpadeo.
  - Al pasar la portada vuelve el fondo y la sombra.
- **Tokens:**
  - `--velo-portada`, `--velo-portada-lateral` y `--velo-cabecera`;
  - `.sobre-fotografia`, que redefine en su subárbol los tokens de texto, acento y foco con los valores del tema oscuro: el fondo es siempre la foto bajo un velo oscuro, también en el tema claro.
  - Bajo el texto pequeño el velo cubre al menos un 64 %, lo que garantiza 4,5:1 sobre cualquier píxel.
- **DESIGN.md:** la cabecera sobre la portada, el corte de 1280 px y cómo se comprueba el texto sobre fotografía.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `landing.spec.ts`, `marca.spec.ts` e `imagenes.spec.ts` (Chromium contra `next start`): 35/35. Lo nuevo:
  - **Contraste medido sobre la foto real** a 360, 768 y 1440 px, en los dos temas. La prueba espera a que la foto cargue, oculta el texto (sin transiciones), captura la pantalla y, en un lienzo, busca el píxel más claro bajo cada línea de la portada y de la cabecera. Exige 4,5:1, o 3:1 en texto grande. Axe no puede medirlo sobre imágenes.
  - La URL de la foto lleva el recorte.
  - La cabecera deja de ser transparente al pasar la portada.
- Revisión visual: la página completa a 1440 px en el tema claro, con la portada oscura y el texto claro.
- **Intermitente:** en una tanda, `imagenes.spec.ts` encontró dos `<img>` iguales del fondo del login. En la siguiente tanda pasó y no se volvió a reproducir. Se vigila en el 4.17, que rehace esa página.
- **No verificado:** el LCP en móvil (< 2,5 s). La medición la lanza el usuario.
- Sin procesos abiertos.

### 4.2 · Estructura de la landing de una sola página (2026-11-03) — D-19

**Cambios:**
- **`app/(public)/page.tsx`**, ahora **de servidor**:
  - Pide la carta y las promociones con `Promise.all`, sin caché.
  - Monta las siete secciones con sus anclas: `#inicio`, `#nosotros`, `#menu`, `#promociones`, `#reservas`, `#pedir` y `#visitanos`.
  - Las seis secciones tras la portada llevan `EtiquetaSeccion` con su lote (Nº 01 a 06) y bandas café alternas.
  - Desaparecen el componente de cliente con sus seis `useFetch` (a endpoints que no existen: NP-17), los handlers vacíos y el carrito simulado.
- **`lib/publico/datos-landing.ts`** (`server-only`):
  - Usa los endpoints que ya usaban `/menu` (`/menu/categories/with-products`) y `/promociones`, con un tiempo máximo de 8 s.
  - Exige respuesta JSON y normaliza los datos.
  - Nunca lanza: devuelve `{ estado: "error" }` y la sección muestra su error.
  - El filtro de promociones vigentes (activas, con título y dentro de sus fechas; una fecha de fin sin hora vale todo el día) está en `lib/publico/promociones-vigentes.ts`, que se puede probar sin servidor.
- **`SeccionLanding`:** etiqueta, ancla con `scroll-margin` para la cabecera fija y fondo alterno.
- **`ReintentarSeccion`:** `EstadoError` cálido con «Reintentar», que hace `router.refresh()`, y una segunda salida («Llamar al restaurante»).
- **Navegación (D-19):**
  - La cabecera enlaza solo anclas: Inicio, Nosotros, Menú, Promociones, Reservas, Pedir y Visítanos.
  - «Reservar» lleva a `#reservas`.
  - Con siete secciones, la barra se ve desde 1280 px; por debajo, en el menú lateral. Con texto al 125 % no cabían a 1024 junto a la cuenta y «Reservar».
  - `SECCIONES_LANDING`, el origen de las migas y de «Volver», y el pie se renombran: «La casa» pasa a «Nosotros» y «La carta» a «Menú» como sección. La página `/menu` sigue siendo «La carta».
- **Metadatos (D-17):**
  - el título y la descripción de la portada;
  - la descripción y las palabras clave globales («cocina española», «carta de vinos»). Retiran «Sistema de gestión», «Cocina nacional e internacional» y «comida mexicana»; la contradicción está en NP-43.
- **Textos de las secciones (D-17):** sobrios, sin cifras, años ni premios. La dirección sale de `restaurant.config.ts`.
- **El contenido de cada sección** llega en los pasos siguientes: portada (4.3), Nosotros (4.4), Menú (4.5), Promociones (4.6), Reservas (4.7), Pedir (4.8) y Visítanos (4.9).

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- Build: correcto.
- `pnpm test:unidad`: 46/46, con la nueva `promociones.spec.ts`.
- `landing.spec.ts` (nueva) y `marca.spec.ts`, Chromium contra `next start`: 21/21. Comprueban:
  - que las siete secciones llegan en el HTML del servidor, en orden y con un solo `h1`;
  - que la navegación es de anclas, marca la sección visible y la cabecera no tapa su título;
  - que sin backend la carta y las promociones muestran el error cálido con «Reintentar» y ningún texto técnico;
  - axe sin violaciones y sin desbordar a 360 (texto al 125 %), 390, 768, 1024 (al 125 %) y 1440 px, en los dos temas.
- Revisión visual: la página completa a 1440 px en oscuro.
- Las pruebas del catálogo (`sitio.spec.ts`) y la unitaria de navegación se actualizan a los nombres y al corte de 1280 px; se pasan en el cierre de la fase.
- Sin procesos abiertos.

### 4.1 · Layout público en el servidor (2026-11-03)

**Cambios:**
- **`components/marca/MarcoSitio.tsx`** (nuevo, de servidor): «Saltar al contenido», `CabeceraSitio`, `<main id="contenido" tabIndex={-1}>` y `PieSitio`.
  - Lo usan los layouts nuevos de `app/(public)`, `app/menu` y `app/(auth)`. Este último era un componente de cliente con su propio `<main>`.
  - `.marco-sitio-contenido` deja sitio a la cabecera fija y su zona segura. `.saltar-contenido` está oculto hasta recibir el foco y entonces aparece sobre la cabecera.
- **`app/page.tsx` → `app/(public)/page.tsx`** (`git mv`): la URL `/` no cambia y la landing entra en el grupo con el marco. Su `<main>` pasa a `<div>` para que haya un único `main`. El 4.2 la rehace.
- **`app/layout.tsx`:** sin `ClientLayoutWrapper` (que cargaba la barra y el pie con `ssr:false`).
- **Retirados:** `ClientLayoutWrapper`, `ConditionalNavbar`, `Navbar`, `landing/Footer` y `dropdown`, que se quedaban sin uso. Los cinco están versionados.
- **Cuenta de la cabecera:** sus islas leen el usuario del store (PLAN 2.15) cuando la cabecera no recibe uno, así que el layout no consulta la sesión y no se queda desfasado al navegar. El catálogo sigue fijándolo.
- **NP-42 resuelta:** el menú móvil ofrece «Cerrar sesión» con el cierre único.
- **Pie (D-17):**
  - una línea de identidad en Fraunces («Cocina española de alta gama y carta de vinos.»);
  - «Conócenos» pasa a «Nosotros»;
  - el aviso de derechos pasa a «© {año} El Quijote. Todos los derechos reservados.». Quita el «1996» y el «Inc. o sus afiliados» de una plantilla ajena: no son datos del restaurante.

**Transitorio hasta el 4.23:** el 404 de la raíz y las páginas `/forbidden`, `/unauthorized`, `/maintenance` y `/offline` quedan sin cabecera. Antes las cubría el envoltorio de cliente; el 4.23 las rehace con `PaginaEstado` dentro del marco. No se movieron ahora porque importan sus módulos CSS por ruta relativa y desaparecen en ese paso.

**Verificación:**
- Typecheck: 0 errores, tras regenerar los tipos de `.next`, que aún apuntaban a `app/page.tsx`. Lint de los archivos tocados: 0 problemas.
- Build: correcto, con las mismas rutas.
- Chromium contra `next start`:
  - batería sin el recorrido: 109 pasan y 2 fallan, ambas pruebas escritas para la barra antigua. Las dos se adaptan a la cabecera nueva:
    - `almacenamiento.spec.ts`: el cierre desde la cuenta ahora es «Tu cuenta, Prueba» → «Cerrar sesión»;
    - `marca.spec.ts`: el logo de la cabecera sigue al tema, como el del pie (el blanco sobre la foto es del 4.3).
  - pruebas nuevas:
    - en `/`, `/menu`, `/about` y `/login`, el HTML del servidor trae la cabecera, «Saltar al contenido», un único `main#contenido` y el pie;
    - «Saltar al contenido» es lo primero del tabulador y lleva el foco al `main`;
    - los paneles no llevan la cabecera pública;
    - NP-42: «Cerrar sesión» desde el menú móvil a 360 px limpia la sesión.
  - `marca` y `almacenamiento` con los cambios: 21/21.
  - recorrido: 95/95.
- Revisión visual: `/menu` a 1440 px con la cabecera y el pie nuevos. El texto técnico de la página es del 4.10.
- Sin procesos abiertos.

### Excepción NP-41 · El cierre de sesión caduca siempre las cookies (2026-11-03)

Autorizada por el usuario fuera del PLAN, en su propio commit. Toca una ruta de servidor, `app/api/auth/logout/route.ts`, solo en lo que pide la nota:

- `caducarCookiesDeSesion()` caduca `access_token` y `session` (`maxAge: 0`, `path: "/"`) en la salida correcta y en el `catch`. Antes, si la llamada a `/auth/sign-out` lanzaba, la respuesta 500 salía **sin** caducarlas.
- El endpoint, el método, el payload enviado al backend y los cuerpos de respuesta no cambian.
- De paso, y por la regla del 2.16:
  - el respaldo `http://localhost:10000` pasa a `?? ""`;
  - el registro del error solo escribe el tipo de la excepción, no su contenido (regla del 2.8).

**Verificación:**

| Comprobación | Resultado |
|---|---|
| Typecheck | 0 errores |
| Lint de los dos archivos | 0 problemas |
| Build | Correcto |
| `proteccion.spec.ts` y `almacenamiento.spec.ts` (Chromium contra `next start`) | 28/28 |
| Procesos abiertos | Ninguno |

La prueba nueva de `proteccion.spec.ts` comprueba que, sin backend real, la respuesta trae `Set-Cookie` con las dos cookies vacías y caducadas, y que el cuerpo no expone trazas.

**No verificado:** con el backend encendido.

### Excepción NP-38 · Retirar `firebase-admin` (2026-11-03)

Autorizada por el usuario fuera del PLAN, en su propio commit.

- **Comprobación:** ningún archivo de `app`, `components`, `features`, `hooks`, `lib`, `config` ni `scripts` importa `firebase-admin`. Solo aparece en `package.json`; `/reset` y `/frm_reset` tienen un import comentado de un `lib/firebaseConfig` que no existe.
- **Cambio:** `pnpm remove firebase-admin`, que toca `package.json` y `pnpm-lock.yaml`.

**Verificación:**

| Comprobación | Resultado |
|---|---|
| Typecheck | 0 errores |
| Build | Correcto, con las mismas rutas |
| `pnpm audit` | 0 críticas / 19 altas / 13 moderadas / 0 bajas (antes 3 / 45 / 31 / 6) |
| Chromium contra `next start` (`recorrido` y `cabeceras`) | 113/113 |
| Procesos abiertos | Ninguno |

### 4.0.2 · Ilustraciones de marca y `PaginaEstado` (2026-11-03) — D-21

**Cambios:**
- **`components/marca/ilustraciones/`** (nuevo): siete ilustraciones de línea sobre un `Lienzo` común (160 × 120, `currentColor`, trazo de 1,5 px que no escala, `aria-hidden`), en el estilo de `MolinoAnimado` y `Plato`, con un solo detalle en acento.

  | Ilustración | Uso | Gesto |
  |---|---|---|
  | `PlatoCloche`: plato con la campana levantada | 404, plato y categoría no encontrados | Flota |
  | `LlaveBodega`: llave con su etiqueta | 401 | Se mece |
  | `PuertaCandado`: puerta con candado bajo un arco | 403 | El candado se mece |
  | `OllaHumeante` | 500 | El vapor respira |
  | `CopaVolcada` | error de segmento y global | La gota cae |
  | `MesaReloj`: mesa con reloj de arena | mantenimiento | La arena cae |
  | `MolinoQuieto` | sin conexión | Un hilo de viento que se va |

  - Pesan entre 860 y 1340 bytes renderizadas.
  - Cada gesto se repite dos o tres veces y vuelve a su sitio (`--duracion-ilustracion`, token nuevo). Con movimiento reducido no se mueve nada.
- **`components/marca/PaginaEstado.tsx`** (nuevo): ilustración, código en Fraunces itálica de acento con «Código» para lectores, filete doble, título, texto y acciones. Va a pantalla completa o dentro de un límite de error (`pantallaCompleta={false}`, `nivelTitulo={2}`).
- **`components/marca/textos-estado.ts`:** los textos de las nueve páginas (D-17), sin datos inventados. «Sin conexión» no promete conservar el pedido, porque no se ha comprobado.
- **Tokens:** `--duracion-vuelta-cargador` (el cargador del 4.0.1 deja de llevar la duración escrita a mano) y `--duracion-ilustracion`.
- **Catálogo:** nueva sección «Páginas de estado» con los nueve casos y sus salidas reales (inicio, carta, iniciar sesión, reintentar, llamar con el teléfono de la configuración).
- **DESIGN.md:** `PaginaEstado`, las ilustraciones y los dos tokens de duración.

**Revisión visual** (SVG renderizados en los dos temas y la sección a 360 y 1440 px):
- La primera versión de la puerta parecía una jaula: se añadieron el arco de piedra, el escalón y los clavos de los herrajes.
- La copa era pequeña: se escaló.
- La llave llevaba unos rayos que sobraban: se cambiaron por la etiqueta de bodega.
- A 360 px la captura de la sección entera es demasiado estrecha para juzgar el detalle; lo cubren axe y la prueba de desbordamiento.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: 0 problemas.
- `paginas-estado.spec.ts` (nueva) y `estados.spec.ts`, Chromium contra `next dev`: 18/18. Comprueban:
  - que cada ilustración está oculta a los lectores, pesa menos de 4 KB y no lleva colores literales;
  - la estructura (código con su nombre para lectores, título, salida, nada técnico);
  - los gestos, y que no hay ninguno con movimiento reducido;
  - axe sin violaciones y sin desbordar a 360 px (texto al 125 %) y a 1440 px en los dos temas, con el contraste medido de cada muestra en AA.
- Dos fallos de la primera tanda eran de las pruebas: un `data-prueba` del catálogo coincidía con el de los estados, y volver a la misma URL con ancla no recarga la página.
- Sin procesos abiertos.

### 4.0.1 · `CargadorMarca` y estados de carga y de error (2026-11-03) — D-20

**Cambios:**
- **`components/marca/CargadorMarca.tsx`** (nuevo, de servidor):
  - Un plato visto desde arriba (ala y fondo en acento, el fondo al 60 %) con un molino de trazo fino en `currentColor`, en el estilo de línea de `MolinoAnimado`. Trazos de 1,5 px a cualquier tamaño.
  - Las aspas giran una vuelta cada 4,8 s (`.cargador-marca__aspas` en `styles/componentes.css`) y se detienen con `prefers-reduced-motion` y con «Movimiento: reducido» del panel, igual que el esqueleto.
  - `role="status"` con el texto solo para lectores; el SVG lleva `aria-hidden`.
  - Tamaños `compacto`, `normal` y `amplio`; `pagina` lo centra en la pantalla menos la cabecera, para `loading.tsx` y las redirecciones (4.23).
- **`EstadoError`:** los textos por defecto pasan a «No pudimos mostrar esta parte» y «Suele arreglarse al volver a intentarlo.», sin jerga de red.
- **Catálogo (`#estados`):** el cargador en sus tres tamaños, sobre la banda café y como página; el error con redacción cálida y una segunda salida humana («Llamar al restaurante», con el teléfono de `restaurant.config.ts` en lugar del número ficticio de antes).
- **DESIGN.md:** `CargadorMarca`, la redacción de los errores (D-20) y la única excepción a «sin bucles» de § Motion.

**Revisión visual:** el SVG renderizado a 40, 64 y 112 px en los dos temas. La primera versión tenía el molino pequeño y las aspas amontonadas; se agrandaron la torre y las aspas, y se rehízo la captura.

**Inventario de textos técnicos (D-20)**, para sustituirlos al rehacer cada página. Una búsqueda de «Cargando», «Redirigiendo», «Intenta más tarde», «Error al…» y mensajes de red los encuentra en:
- **Parte pública:** `/menu`, la categoría, el producto, el pedido, el checkout y su confirmación, login y perfil.
- **Paneles:** inventario y proveedores, rendimiento de BD, reservas, promociones, nómina, carta, `RecentOrdersTable`, `HourBarsChart`, `ExportModal` e `Importpreviewmodal`.
- Además, varias pantallas pintan `err.message` del API: se sustituye por la redacción del sistema en su paso.

**Verificación:**
- Typecheck: 0 errores. Lint de los cuatro archivos: 0 problemas.
- `estados.spec.ts` y `catalogo.spec.ts` (Chromium contra `next dev`): 23/23 con la primera versión y 10/10 en `estados.spec.ts` tras el retoque. Comprueban:
  - `role="status"`, el texto oculto a la vista y el SVG con `aria-hidden`;
  - el giro de las aspas, que se detienen con «Movimiento: reducido» y con `reducedMotion: "reduce"` del sistema;
  - un contraste de 3:1 o más entre el plato y el molino y su fondo, en el fondo y en la banda café, en los dos temas;
  - axe sin violaciones a 360 px con texto al 125 % en los dos temas.
- Sin procesos abiertos.

### Decisiones D-17 a D-21 y pasos 4.0.1 y 4.0.2 (2026-11-03)

El usuario aprueba el catálogo completo como referencia de estilo y añade cinco decisiones, registradas en el PLAN:

- **D-17:** se reescriben los textos estáticos públicos (landing, `/about`, `/promociones`, introducciones de `/menu` y `/reservations`, login, registro, pie, páginas de sistema y metadatos) sin inventar datos. La regla 6 del PLAN se actualiza en consecuencia.
- **D-18:** solo imágenes propias (nube `dcb1tspbj` y archivos locales).
- **D-19:** landing de una sola página con anclas y contenido real en cada sección.
- **D-20:** sin textos técnicos; `CargadorMarca`, `Esqueleto` y `EstadoError` cálido; `error.tsx` y `not-found` por segmento.
- **D-21:** `PaginaEstado` con ilustraciones propias para cada página de sistema.

Se añaden los pasos 4.0.1 y 4.0.2 al inicio de la fase 4 y la nota **NP-43** (contradicción «cocina mexicana» frente a «cocina española» y datos por confirmar). `CLAUDE.md` (local) recoge las mismas reglas.

**Cambio ajeno en la copia de trabajo:** `PRODUCT.md` llega modificado (quita «según el encargo del rediseño: cocina española» de Positioning). No es del agente: no se toca ni se versiona, y se anota en NP-43.

## Fase 2 · Cabeceras y medidas de seguridad del front

### Cierre de la fase 2 (2026-11-02): resumen para leer al volver

La fase 2 está cerrada en `feature/rediseno-web-seguridad`, salvo el **2.5**, que no se ejecuta y espera tu aprobación. No se ha empezado la fase 4, no se ha hecho push y el árbol queda limpio. El PR lo gestionas tú.

**Lo hecho, paso a paso:**

| Paso | Commit | Resumen |
|---|---|---|
| 2.1 | `7577c79` | Next 16.4.3, React 19.2.9 y `eslint-config-next` 16.4.3 (D-01) |
| 2.2 | `eaccb56` | Cabeceras base; sin `X-Powered-By` ni mapas de código |
| 2.3 | `4a89df9` | CSP con nonce, **solo en modo informe** (D-02) |
| 2.4 | `dbb6eae` | Sin scripts ni estilos en línea que la CSP bloquearía |
| 2.5 | `44a4109` | **No ejecutado.** Nota de lo que falta, pendiente de tu aprobación |
| 2.6 | `9191b75` | `no-store` en datos y páginas privadas |
| 2.7 | `056216c` | Sin service worker, y limpieza de instalaciones previas |
| 2.8 | `b0e29db` | Registro de errores sin datos sensibles |
| 2.9 | `c30fa35` | Secreto JWT sin respaldos: falla cerrado |
| 2.10 | `ff805e9` | Proxy: token en `/api` salvo las rutas públicas documentadas |
| 2.11 | `23d2999` | DAL de sesión con `server-only` y DTO mínimo |
| 2.12 | `1912c04` | Sin `dangerouslySetInnerHTML`: texto enriquecido con lista blanca |
| 2.13 | `d6194af` | Redirecciones, enlaces y parámetros validados |
| 2.14 | `3aff22c` | Cierre de sesión único que limpia todo |
| 2.15 | `ed3885d` | Datos del usuario solo en memoria; `/api/auth/me` una vez por carga |
| 2.16 | `d5bf2a6` | Variables públicas validadas en el build |
| 2.17 | `e776aa1` | Límites de error por segmento, sin trazas |
| 2.18 | `1638fee` | Revisión automática del bundle |

**Bloqueado:** ningún paso. El 2.5 no está bloqueado: espera tu aprobación.

**Verificación del cierre** (build de `1638fee`, contra `next start` salvo el catálogo):

| Comprobación | Resultado |
|---|---|
| Typecheck | 0 errores |
| Lint global | 302 problemas (200 errores y 102 avisos). Al empezar la fase eran 310: **no sube**. |
| Build | Correcto |
| Chromium, batería completa | 110 + 95 = **205/205** |
| Firefox, batería completa | 82 + 24 + 95 = **201/201** |
| WebKit, batería completa | 29 + 54 + 24 + 95 = **202/202**, tras los dos ajustes de las pruebas de abajo |
| Pruebas omitidas | Las del catálogo (solo existen en `next dev`) y las que son de un solo motor |
| Catálogo (`next dev`), 14 archivos (los 13 de la fase 3 más `limites-error`) | Chromium **115/115**, Firefox **115/115**, WebKit **115/115** |
| `pnpm test:unidad` | 45/45 |
| `pnpm revisar:invisibles` | 367 archivos sin caracteres prohibidos |
| `node scripts/revisar-bundle.mjs` | 661 archivos; 0 coincidencias de secretos, 0 mapas de código y nada de desarrollo |
| `pnpm audit` | 3 críticas, 45 altas, 31 moderadas y 6 bajas. Al cerrar la fase 3 eran 7 / 66 / 53 / 10. Las 3 críticas llegan por `firebase-admin` (NP-38). |
| Procesos | Ninguno abierto tras cada tanda |

**Dos ajustes de las pruebas en WebKit.** Son avisos que solo da WebKit; ninguno es un fallo de la página:
1. **El aviso de la CSP solo de informe.** WebKit avisa en consola de que la política no tiene efecto porque no lleva `report-to`. Es el modo que pediste hasta aprobar el 2.5. Va a `excepciones.ts`, enlazado al 2.5, y desaparece al aplicar la política.
2. **Las capturas del recorrido.**
   - Cualquier captura de Playwright en WebKit inyecta un estilo sin nonce, y la CSP lo anota. Se comprobó con una sonda temporal: 0 avisos antes de capturar y 1 por cada captura.
   - `recorrido.spec.ts` ahora evalúa los hallazgos antes de la captura.
   - El primer intento, `caret: "initial"`, no bastó y se deshizo con `git restore`.

**No verificado** (detalle en cada paso):
- El checkout con Stripe y todo lo que lista el 2.5 (iframe de pago, 3-D Secure, widget de Cloudinary, mapa de `/about` y fotos de Supabase): no hay claves ni backend.
- El backend en general:
  - el login de punta a punta (2.13 y 2.15);
  - que `POST /auth/sign-out` invalide la sesión (2.14);
  - que el API envíe sus propias cabeceras de caché (2.6).
- Lo que muestran los paneles con un usuario real (2.15): sin backend se ven los nombres por defecto.
- El entorno de despliegue (2.16): si define `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y si `NEXT_PUBLIC_API_URL` es `https:`.
- `removeConsole` en el código de servidor con Turbopack (2.8, NP-40).
- La limpieza del service worker en navegadores reales que tuvieran el antiguo (2.7).
- La geolocalización y la búsqueda por voz con permisos reales (2.2).
- `AboutSection`, que no se monta en ninguna página (2.12 y 2.13).
- Los límites de error con un error real de producción, y `global-error` en el navegador (2.17).
- Los proyectos móviles (`movil-ios` y `movil-android`): este cierre corrió Chromium, Firefox y WebKit, como pediste.
- Lighthouse y la medición de rendimiento: los lanzas tú.

**Decisiones pendientes tuyas:**
1. **Aprobar el 2.5** (aplicar la CSP). Antes, comprobar lo que lista su entrada con claves de prueba de Stripe y el backend.
2. **NP-36:** las fotos de muestra de Unsplash en `/dashboard/admin/about` (única violación justificada de la CSP). Se sustituyen por fotos de la casa o se añade `images.unsplash.com` a `hosts-permitidos.ts`.
3. **Clave de Stripe en el entorno (2.16).** El `.env.local` y el `.env` no definen `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (no se leyeron: lo delató el build), y desde el 2.16 `pnpm build` falla sin ella. Hay que añadirla en local y en el despliegue.
4. **NP-02:** rotar el `JWT_SECRET` si alguna vez coincidió con el que estaba incrustado en `proxy.ts`, que sigue en el historial de git.
5. **NP-38:** las 3 dependencias críticas que llegan por `firebase-admin` (servidor, fuera del alcance).
6. **`/api/public/*` y `/api/mesas` exigen token desde el 2.10.** Si alguna aplicación externa los usa sin token, dejará de funcionar.
7. **NP-41:** la ruta `app/api/auth/logout` no caduca las cookies si el backend falla (backend).
8. **`AGENTS.md`:** Next 16.4 lo crea al arrancar `next dev`. Está excluido en local; versionarlo es decisión tuya.
9. **Otros avisos de la fase:**
   - NP-39: idea para `revisar:invisibles`.
   - NP-40: `console.log` del servidor.
   - NP-42: «Cerrar sesión» en el menú móvil de la cabecera nueva, para la fase 4.
   - En el 2.11, el DTO añade `apellidos` para conservar las iniciales.

### 2.18 · Revisión del bundle (2026-11-02)

**Cambios:**
- **`scripts/revisar-bundle.mjs`:** existía desde el 3.0 (catálogo fuera del build). Ahora hace las dos revisiones:
  1. **Contenido de desarrollo** en `.next/server/app` y `.next/static`: el catálogo, como antes, y también las páginas de prueba del 2.17 (`prueba-limites` en nombres de archivo y el texto `detalle-interno`).
  2. **Secretos en `.next/static`:** `sk_live_`, `sk_test_`, `-----BEGIN`, `service_role`, `postgres://` (y `postgresql://`) y `eyJhbGci`, más cualquier archivo `.map`.
  - Informa del archivo, el tipo y el número de coincidencias, **nunca del valor**. Sale con código 1 si hay hallazgos y con 2 si falta el build.
- **`settingsMock.tsx`:** el marcador `sk_live_••••…2H4k` pasa a `••••…2H4k`, texto neutro. La pasarela sigue mostrando la clave enmascarada.

**Verificación:**
- Con el build anterior, el script detectó **1** coincidencia («clave secreta de Stripe (live) × 1» en un chunk), sin imprimir el valor: era el marcador.
- Tras el cambio y un build nuevo: «Build limpio: 661 archivos revisados; sin contenido de desarrollo, 0 coincidencias de secretos y 0 mapas de código».
- Lint de los dos archivos: 0 problemas.
- Chromium, recorrido de las rutas (incluye `/dashboard/admin/settings`): 95/95.
- Sin procesos abiertos.
- Typecheck: 0 errores.

### 2.17 · Límites de error sin trazas (2026-11-02)

**Cambios:**
- **`components/errores/LimiteError.tsx`** (nuevo), sobre `EstadoError` (3.7):
  - «Algo salió mal», una frase genérica, «Reintentar» (`router.refresh()` y `reset()` en una transición), un enlace de salida y, si existe, «Código para soporte: `digest`».
  - **Nunca** muestra `error.message` ni la pila.
  - Registra con `registrarError` (2.8).
- **`components/errores/NoEncontrado.tsx`** (nuevo), sobre `EstadoVacio`: «No encontramos esta página», una frase y una salida. No repite la ruta pedida.
- **`error.tsx` y `not-found.tsx` nuevos en cuatro segmentos:**

  | Segmento | Salida |
  |---|---|
  | `app/(auth)` | «Ir al inicio» |
  | `app/(public)` | «Ir al inicio» |
  | `app/menu` | «Ver el menú» |
  | `app/dashboard` | «Ir al panel» |

  El límite queda dentro del layout del segmento: el panel conserva su barra lateral.
- **`app/global-error.tsx`** (nuevo):
  - importa los estilos y usa `components/errores/ErrorGlobal.tsx`, que pone su propio `<html lang="es">` y `<body>`;
  - no depende del router ni de los proveedores, porque es el layout raíz el que falló;
  - lleva «Reintentar», un enlace normal al inicio (recarga completa) y el `digest`.
- **`app/error.tsx`** (raíz):
  - conserva su diseño, que rehace el 4.23;
  - «Intentar de nuevo» también hace `router.refresh()`;
  - añade «Ir al inicio» y el `digest`.
- **Páginas de prueba, solo en `next dev`** (`page.dev.tsx`, fuera del build):
  - rutas: `/menu/prueba-limites`, `/prueba-limites-publico`, `/prueba-limites-auth` y `/dashboard/admin/prueba-limites`;
  - la del panel va bajo `admin` porque el proxy manda a `/forbidden` cualquier ruta del panel que no sea de un rol;
  - fallan en el servidor o en el cliente con mensajes que no deben verse, o llaman a `notFound()`;
  - el código común está en `app/(dev)/_limites/`.

**Verificación:**
- Typecheck: 0 errores.
- Lint: 0 problemas en los archivos nuevos y en `app/error.tsx`.
- `pnpm test:unidad`: 45/45. `error-global.spec.tsx` (nueva) renderiza `ErrorGlobal` con un error que trae mensaje, pila y `digest`: aparece el `digest` y no aparecen el mensaje, `SELECT`, `<pre` ni la primera línea de la pila.
- `limites-error.spec.ts` (nueva, Chromium contra `next dev`). En cada segmento:
  - error de servidor y de cliente: el límite aparece con su encabezado, «Reintentar» y la salida correcta;
  - en el DOM de la página no hay ningún `<pre>` ni texto de la pila (`at …`), ni el mensaje interno (`detalle-interno`, `SELECT`, `token=`, `/api/privado`, `.tsx:`);
  - el `digest`, si aparece, es un código corto;
  - `notFound()` muestra la página «no encontrada» del segmento.
  - Resultado: 12/12 (9 en la primera tanda y las 3 del panel tras moverlo bajo `admin`).
- Build: correcto. Las páginas de prueba no están entre las rutas y `detalle-interno` no aparece en `.next/static` ni en `.next/server`.
- Chromium contra `next start`, en dos tandas: 110 + 95 = **205/205**.
- Sin procesos abiertos.

**No verificado:**
- El límite con un error real de producción, donde Next sustituye el mensaje del servidor. Las páginas de prueba solo existen en `next dev`, donde el mensaje llega completo al cliente, y aun así no se muestra.
- `global-error.tsx` en el navegador: no se puede hacer fallar el layout raíz desde una página. Lo cubre la prueba unitaria.
- La revisión visual en las cinco anchuras y los dos temas: el límite usa `EstadoError` y `EstadoVacio`, ya revisados en el 3.7.

### 2.16 · Variables públicas validadas en el build (2026-11-02)

**Cambios:**
- **`lib/config/entorno-publico.ts`** (nuevo). `problemasEntornoPublico()` y `validarEntornoPublico()`:
  - **Exige** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
  - **API:** URL válida, sin credenciales y `https:` en producción. **Decisión conservadora:** `http:` solo se acepta con un host local (`localhost`, `127.0.0.1`, `::1`), porque el build de las pruebas sirve la API simulada en el mismo equipo.
  - **Stripe:** la clave debe empezar por `pk_`.
  - **Rechaza** cualquier `NEXT_PUBLIC_*` cuyo nombre contenga `SECRET`, `PRIVATE`, `SERVICE_ROLE` o `PASSWORD`.
  - Los mensajes nombran las variables, **nunca sus valores**.
- **`next.config.ts`:** valida solo en `PHASE_PRODUCTION_BUILD`. `next dev` y `next start` no cambian.
- **Sin respaldo `localhost:10000` en el código del cliente:**
  - `lib/api.ts`, `reservations.service.ts`, `menu/categoria/[slug]`, `dashboard/admin/page.tsx`, `HourBarsChart`, `RecentOrdersTable` y `lib/sesion/dal.ts` usan `process.env.NEXT_PUBLIC_API_URL ?? ""`; el build garantiza que exista.
  - `ExportModal` tenía `http://localhost:10000` **fijo**, no como respaldo. Ahora usa la misma variable. La ruta (`/export`) no cambia.
- **Entornos de prueba y medición:** `playwright.config.ts` y `scripts/comparar-rendimiento.mjs` añaden una clave publicable ficticia (`pk_test_…`).
- **Quedan con respaldo `localhost:10000`** las rutas de `app/api/*` (servidor, NP-01 y NP-17). No llegan a `.next/static`.

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo cambia su cuenta y los nuevos están limpios.
- `pnpm test:unidad`: 44/44. `entorno-publico.spec.ts` (nueva) comprueba:
  - entorno completo y `http://localhost`;
  - variables que faltan;
  - `http:` remoto en producción, URL inválida, `ftp:` y credenciales;
  - `sk_`;
  - cuatro nombres de secreto;
  - que el mensaje no contenga los valores.
- **Build sin `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y con una `NEXT_PUBLIC_SERVICE_ROLE_PRUEBA` ficticia:** falla al cargar `next.config.ts` con «Variables públicas no válidas (PLAN 2.16)» y los dos problemas. El registro no contiene ninguno de los valores (0 coincidencias).
- Build con el entorno de pruebas: correcto. `localhost:10000` en `.next/static`: **0 archivos**.
- Chromium contra `next start`, en dos tandas: 110 + 95 = **205/205**.
- Sin procesos abiertos.

**Decisión pendiente del usuario:**
- El build de prueba sin la clave de Stripe cargó `.env.local` y `.env` (no se leyeron) y aun así faltaba la clave. Así que **el entorno local no define `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**, y desde este paso `pnpm build` falla sin ella.
- Hay que añadirla al `.env.local` y al entorno del despliegue, y comprobar que allí `NEXT_PUBLIC_API_URL` sea `https:`.
- No verificado: no hay acceso al entorno de despliegue.

### 2.15 · Datos del usuario solo en memoria (2026-11-02)

**Cambios:**
- **`lib/sesion/sesion-cliente.ts`** (nuevo):
  - `pedirSesion()` hace **una sola** petición a `/api/auth/me` por carga de página y la comparte con todos los que la piden.
  - Devuelve `ok`, `status` y `json()`, la misma forma que usaban las páginas, así que su lógica no cambia.
  - Un fallo de red no se guarda.
  - `olvidarSesion()` lo descarta. Lo llaman el login y el cierre de sesión.
- **El usuario sale del store:**
  - `hydrateSession` usa `pedirSesion()`.
  - `ConditionalNavbar` ya no pide la sesión en cada cambio de ruta: lee `state.auth.user`. Lo actualizan el login (`setUser`) y el cierre (`sesionCerrada`).
  - Los paneles de mesero, cocina y cajero leen el usuario del store, no de `localStorage.user`.
  - `AuthProvider` ya no consulta `/auth/me` del backend con el `authToken`: toma usuario y estado de carga del store. `useAuth` no lo usa nadie, pero se conserva.
- **Login:** ya no escribe `localStorage.user`. Solo `setUser` en el store, y antes `olvidarSesion()`.
- **Lectura al cargar compartida:** detalle de producto, pedido, checkout, perfil y `ReservationSidebar` usan `pedirSesion()`.
  - **Fuera de la lista de archivos del PLAN**, pero sin ellos no se cumple su aceptación («una vez por carga»). El cambio es mecánico: `fetch("/api/auth/me", …)` → `pedirSesion()`.
  - En el perfil, la lectura de «Guardar» (acción del usuario) sigue preguntando de nuevo.
- **Aviso de instalación (`InstallPrompt`):** cerrarlo dura lo que la visita (variable en memoria). La clave antigua `pwa-install-dismissed` se borra al cargar.
- **Pruebas:**
  - `global-setup` ya no siembra `user`, porque la aplicación no lo escribe.
  - En `almacenamiento.spec.ts`, las excepciones quedan en `authToken` (D-03, NP-04) y `num_mesa` (NP-12). Las claves de `dataService` (NP-12) solo aparecen en los paneles.

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo sube su cuenta; cajero, cocina, mesero y `ConditionalNavbar` bajan uno cada uno; el nuevo está limpio.
- `pnpm test:unidad`: 38/38.
- `almacenamiento.spec.ts`, «datos del usuario» (nuevas):
  - Iniciar sesión, con `/api/auth/login` simulado, lleva a `/menu` sin `localStorage.user`, y `authToken` sigue como excepción. El formulario antiguo no asocia sus etiquetas (lo rehace el 4.17), así que la prueba usa `#email` y `#password`.
  - En 11 cargas (inicio, menú, producto, pedido, checkout, reservas, perfil y los cuatro paneles, cada una con su rol), `/api/auth/me` se pide **como máximo una vez** y `localStorage.user` es `null`.
- Build: correcto.
- Chromium contra `next start`, en dos tandas: 110 + 95 = **205/205**.
- Sin procesos abiertos.

**No verificado:**
- El login de punta a punta con el backend real.
- Lo que muestran los paneles con un usuario real: sin backend, `/api/auth/me` responde sin usuario y se ven los nombres por defecto («Cajero», «Mesero»).

**Comportamiento a tener en cuenta:** dentro de una misma carga, las páginas comparten la primera respuesta. Si la sesión caduca a mitad de la visita, se nota en la siguiente carga o en la siguiente llamada al API, no al cambiar de ruta en el cliente. Antes, `ConditionalNavbar` volvía a preguntar en cada ruta.

### 2.14 · Cierre de sesión único (2026-11-02)

**Cambios:**
- **`lib/sesion/cerrar-sesion.ts`** (nuevo):
  - `limpiarSesionDelNavegador()`:
    1. `POST /api/auth/logout` con `cache: "no-store"` (y el `authToken` como `Authorization` si existe, para que el backend pueda invalidarlo).
    2. Caduca las cookies `session` y `access_token` desde el cliente y borra `authToken`, `user` y `num_mesa`, aunque la llamada falle o no haya red.
    3. Borra todas las cachés de Cache Storage, como defensa (D-11).
  - `useCerrarSesion()`: lo anterior, más `dispatch(sesionCerrada())` y `router.replace("/login")`.
- **Store:**
  - `authSlice`: acción `sesionCerrada`, que devuelve el estado inicial.
  - `store/index.ts`: un reductor raíz que, con `sesionCerrada`, devuelve **todos** los slices a su estado inicial, y `crearStore()` para la prueba unitaria.
  - `hydrateSession` llama a `/api/auth/me` con `cache: "no-store"`: al 2.6 se le pasó `store/`.
- **Implementaciones sustituidas:**
  - `AdminSidebar` (la barra de todos los paneles) y `ConditionalNavbar` (menú desplegable) usan el cierre único. `ConditionalNavbar` ya no recarga ni manda al inicio según la ruta: siempre `/login`, como dice el PLAN.
  - `Navbar` y `admin/reservations`: sus copias no las llamaba ningún botón, así que se retiran.
  - **Fuera de la lista del PLAN:** `app/dashboard/mesero/page.tsx` tenía una quinta implementación (solo borraba `user`). Se encontró en las pruebas y también usa el cierre único. Es el mismo objetivo del paso; no amplía su alcance.
- **Cabecera nueva:**
  - `MenuCuentaConSesion` en `islas.tsx` conecta `MenuCuenta` con el cierre único. `CabeceraSitio` es de servidor y no puede pasar la función.
  - En el catálogo, `BarraSuperiorPanel` lo recibe como `alCerrarSesion`. Pulsarlo allí cierra de verdad la sesión de desarrollo.
- **NP-41:** según su código, sin backend la ruta `app/api/auth/logout` devuelve 500 y no caduca las cookies (backend, fuera de alcance). El cliente las caduca igualmente.
- **NP-42:** `MenuMovil` no ofrece «Cerrar sesión» (el PLAN solo pide `MenuCuenta`).

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo sube su cuenta; `Navbar` (1→0) y `admin/reservations` (6→5) bajan; los nuevos están limpios.
- `pnpm test:unidad`: 38/38. `sesion.spec.ts` (nueva): tras `setUser` y `setError`, `sesionCerrada` deja el store igual que recién creado.
- `almacenamiento.spec.ts`, «cierre de sesión» (nuevas, una por rol):
  - **admin, cajero, mesero y cocina** desde su panel, con el botón propio del mesero incluido; **cliente** desde el menú de la cabecera, con `/api/auth/me` simulado.
  - Antes de cerrar se siembran `num_mesa` y una caché.
  - Después: URL `/login`, sin `authToken`, `user` ni `num_mesa`, sin cachés y sin cookies `session` ni `access_token`.
  - Volver atrás no devuelve la página privada, y entrar de nuevo en ella lleva a `/login`.
- `sitio.spec.ts` y `paneles.spec.ts` (catálogo, `next dev`): «Cerrar sesión» ya aparece en `MenuCuenta` y en `BarraSuperiorPanel`. 16/16.
- Build: correcto.
- Chromium contra `next start`, en dos tandas: 108 + 95 = **203/203**.
- Sin procesos abiertos.

**No verificado:**
- Que el backend invalide la sesión con `POST /auth/sign-out`: no hay backend.
- El estado del store en el navegador tras el cierre: la aplicación no expone el store y no se añadió un acceso solo para pruebas. Lo cubre la prueba unitaria del reductor.

### 2.13 · URLs seguras (2026-11-02)

**Cambios:**
- **`lib/seguridad/urls.ts`** (nuevo):
  - **`esRutaInternaSegura`:** empieza por `/`, no por `//` ni por `/\`, sin esquema ni caracteres de control, y al resolverse se queda en el mismo origen.
  - **`urlExternaPermitida`:** solo `https:`, un host de la lista y sin credenciales. Devuelve la URL normalizada o `null`.
  - **`rutaConParametros`:** usa `URLSearchParams`, suma los parámetros a los que ya tuviera la ruta y omite los vacíos.
  - **`cantidadSegura`:** entero entre 1 y 20.
  - **`destinoTrasLogin`:** junta la decisión del login para poder probarla sin backend.
- **`config/seguridad/hosts-permitidos.ts`:** `HOSTS_ENLACE` (Facebook, Instagram y Google Maps), los destinos a los que se puede enlazar desde datos del API.
- **Login (`app/(auth)/login/page.tsx`):**
  - el destino tras iniciar sesión sale de `destinoTrasLogin`;
  - un `callbackUrl` que no sea interno y seguro lleva al inicio (`/`);
  - `action` solo acepta `pedir_mesa`, y la cantidad se limita;
  - el enlace al registro se construye con `rutaConParametros` y solo conserva un `callbackUrl` seguro.
- **Registro:** no usaba `callbackUrl` ni sus parámetros (tras registrarse va a `/login`). No cambia.
- **`AboutSection`:** Facebook y el mapa solo se pintan como enlace si `urlExternaPermitida` los acepta.
- **Página de éxito del pedido:** `encodeURIComponent(ordenId)` en la consulta y en la descarga, y `window.open(…, "_blank", "noopener,noreferrer")`.
- **Detalle de producto:**
  - con `autoExecute`, **pide confirmación** con `useConfirmacion` (3.5) antes de crear el pedido: «¿Añadir este platillo a tu pedido?», «20 × Mole de olla, mesa 4.», «Añadir al pedido» o «Ahora no»;
  - `qty` pasa por `cantidadSegura`;
  - la llamada al API es la misma.

**Lint:** al aplicar los dos cambios del login, el compilador de React empezó a marcar el `document.cookie = …`, que ya estaba (lo retira el 2.15). Cada cambio por separado no lo provocaba. Se resolvió calculando la URL del registro en una constante antes del JSX, y el archivo vuelve a sus 2 problemas previos.

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo tocado cambia su cuenta y el nuevo está limpio.
- `pnpm test:unidad`: 37/37. `urls.spec.ts` (nueva) comprueba:
  - rutas buenas y malas, incluidas `//ejemplo.org`, `/\ejemplo.org`, `https://ejemplo.org`, `javascript:` y un salto de línea;
  - enlaces `http:`, `javascript:`, de otro host y con credenciales;
  - parámetros codificados y sumados;
  - la cantidad;
  - el destino tras el login: `callbackUrl=https://ejemplo.org` y `//ejemplo.org` llevan a `/`, una acción desconocida se ignora y el personal va a su panel.
- `urls.spec.ts` (nueva, navegador, sesión de cliente y API simulada): con `autoExecute`, la confirmación aparece con la cantidad limitada a 20 y la URL se limpia. Con «Ahora no», **0 pedidos**. Al confirmar, 1 `POST /pedidos/mesa`.
- Build: correcto.
- Chromium contra `next start`, en dos tandas: 103 + 95 = **198/198**.
- Sin procesos abiertos.

**No verificado:**
- El inicio de sesión de punta a punta con `callbackUrl` malicioso: necesita el backend. Se cubre la decisión con la prueba unitaria de `destinoTrasLogin`.
- Los enlaces de `AboutSection` en el navegador: la sección no se monta (ver 2.12).

### 2.12 · Eliminar todo `dangerouslySetInnerHTML` (2026-11-02) — condición de D-03

**Dependencia:** `html-react-parser@6.1.9` (2026-10-20), la que nombra el PLAN. `pnpm` la fija en versión exacta.

**Cambios:**
- **`lib/texto/texto-enriquecido.tsx`** (nuevo): `textoEnriquecido(html)` convierte el marcado del API en elementos de React con una lista blanca.
  - Se conservan `<br>`, `<em>` y `<strong>`, y `<span>` pasa a `<em class="resaltado">`.
  - Cualquier otra etiqueta se reduce a su texto, y `script`, `style`, `iframe`, `svg` y similares se descartan enteras.
  - Se descartan todos los atributos, y el texto lo escapa React.
- **`components/landing/Hero.tsx`** (título) y **`AboutSection.tsx`** (descripción): usan `textoEnriquecido` en lugar de `dangerouslySetInnerHTML`.
- **`styles/globals.css`:** `.resaltado` reproduce el aspecto del `<span>` por defecto del título (degradado de acento a amarillo recortado al texto, mayúsculas) y quita la cursiva de `<em>`.
  - Se escribió primero con `@apply` de las mismas utilidades, pero esa regla no llegaba al CSS compilado, y el build no daba ningún aviso. Se detectó midiendo el estilo calculado y quedó en CSS explícito con las mismas variables.
- `/offline` ya se resolvió en el 2.4. Dos comentarios que nombraban la API (`ScriptPreferencias`, `RecargarAlConectar`) se reescriben, para que la búsqueda de la aceptación quede limpia.
- **`tests/unidad/react-dom-server.d.ts`:** tipo mínimo de `renderToStaticMarkup` para la prueba unitaria. El proyecto no tiene `@types/react-dom`, y añadirlo sería una dependencia fuera del PLAN.

**Verificación:**
- `rg dangerouslySetInnerHTML app components features`: sin resultados.
- `pnpm test:unidad`: 32/32. `texto-enriquecido.spec.tsx` (nueva) comprueba:
  - que el título por defecto da `SABORES QUE <br/> <em class="resaltado">Trascienden</em>`;
  - que las cargas `<img onerror>`, `<script>`, `<a href="javascript:">`, `<span onclick style>`, `<svg onload>`, `<em onmouseover>` e `<iframe>`/`<style>` quedan como texto o se descartan, sin atributos;
  - que el texto plano se escapa.
- `texto-enriquecido.spec.ts` (nueva, navegador): la portada con un título malicioso en el API simulado muestra «Cocina honesta» con el resaltado, sin `img`, `script` ni manejadores, con **0 diálogos y 0 errores**.
- El resaltado se ve igual: estilo calculado (color transparente, `background-clip: text`, degradado, mayúsculas, sin cursiva) y captura del título revisada.
- Typecheck: 0 errores. Lint: los archivos tocados no cambian su cuenta y los nuevos están limpios.
- Build: correcto.
- Chromium: texto enriquecido, recorrido público y CSP, **101/101**.
- Sin procesos abiertos.

**No verificado:**
- **La descripción de «La casa» en el navegador:** `AboutSection` está **comentada en `app/page.tsx`** y no se monta en ninguna parte. Su conversión la cubre la prueba unitaria.
- **Con datos reales:** si el API enviara párrafos `<p>` en la descripción, la lista blanca del PLAN los reduce a texto y se unirían en uno.

### 2.11 · Capa de acceso a datos de sesión (DAL) (2026-11-02)

**Cambios:**
- **`lib/sesion/dal.ts`** (nuevo):
  - empieza con `import "server-only"`, que Next ya trae en `next/dist/compiled`, así que no se añade dependencia;
  - `verificarSesion = cache(async () => …)` verifica la cookie con `getSession` y devuelve un DTO mínimo `{ id, nombre, apellidos, rol }`, nunca el payload del token ni el usuario del API;
  - un fallo al pedir el nombre no invalida la sesión y se registra con `registrarError` (2.8).
- **`app/dashboard/layout.tsx`:** usa la DAL. `AdminSidebar` recibe solo `{ name, lastname }`, lo que pinta. Antes recibía también el id, el correo y el rol, que no usaba.
- **`app/dashboard/page.tsx`:** reparte por rol con el DTO, en lugar del `roleId` del payload.
- Son los dos únicos segmentos de servidor que leían la sesión.

**Decisión:** el DTO del PLAN es `{ id, nombre, rol }`. Se añade `apellidos` porque la barra lateral muestra las iniciales de nombre y apellido; sin él, pasarían de dos letras a una y cambiaría lo que se ve.

**Verificación:**
- `rg "server-only" lib/sesion`: lo encuentra.
- Typecheck: 0 errores.
- Lint: los archivos tocados no cambian su cuenta y el nuevo está limpio.
- Build: correcto.
- Chromium contra `next start`:
  - protección, línea base (42 rutas de panel con sesión), cabeceras y CSP: 75/75;
  - `proteccion.spec.ts` con 5 pruebas nuevas, en las que `/dashboard` lleva a cada rol a su panel: 15/15.
- Sin procesos abiertos.

**Nota:** `/dashboard` responde 200 y redirige en el navegador. Su `redirect()` ocurre durante el render, cuando el layout ya se está enviando, y por eso se prueba con un navegador. El cliente acaba en `/dashboard/cliente`, que no existe (NP-19, sin cambios).

### 2.10 · Protección de rutas en el proxy (2026-11-02) — D-15

**Cambios:**
- **`config/seguridad/rutas-api-publicas.ts`** (nuevo):
  - `RUTAS_API_PUBLICAS`, con ruta, métodos y motivo de cada una, como la tabla del PLAN: login, registro, logout, `me`, carta pública y la excepción temporal del cron (NP-10);
  - `esApiPublica(ruta, método)`: ruta exacta y método de la lista; `HEAD` y `OPTIONS` cuentan como `GET`;
  - `esApiSoloAdmin`: `/api/admin/**` y `/api/backups/**`.
- **`proxy.ts`:**
  - **API:** todo `/api/*` exige un token válido (cookie `session` o `Authorization: Bearer`), salvo la lista. Sin token o con uno inválido, responde `401` con `{"error":"No autorizado"}` y `Cache-Control: no-store`. `/api/admin/**` y `/api/backups/**` exigen además el rol de administrador (`403`, `{"error":"Acceso denegado"}`). Comprobación optimista: firma y caducidad con `jose`, sin base de datos.
  - **Páginas:** `/profile` y `/menu/pedido/**` exigen sesión. Sin ella, redirigen a `/login` con un `callbackUrl` que solo se escribe si es una ruta interna (empieza por `/` y no por `//` ni `/\`). Los paneles usan la misma redirección.
  - **`matcher`:** sin cambios. Ya excluía `_next/static`, `_next/image`, `icons/` y los archivos de imagen (incluido `icon.svg`).
- `config/roles.config.ts` no cambia: el proxy usa su `ROLES.ADMIN`.
- `/api/public/combos`, `/api/public/cupones` y `/api/mesas` no se llaman desde el front y **pasan a exigir token**, como decide el PLAN. La autorización por rol y por propietario del resto de endpoints sigue en NP-32.

**Verificación:**
- Typecheck: 0 errores. Lint de los archivos tocados: limpio.
- Build: correcto.
- `proteccion.spec.ts` (nueva, sin navegador, contra `next start`): **10/10**.
  - Las 18 rutas de `app/api` con todos sus métodos: sin token, 401 en JSON y `no-store`, salvo las públicas. Ninguna pública responde 401 por culpa del proxy; `/api/auth/me` lo hace por sí misma.
  - Una ruta pública con otro método exige token, y un token inválido equivale a no tenerlo.
  - Cliente, caja, mesero y cocina reciben 403 en `/api/admin/users` y `/api/backups`; el administrador pasa el proxy.
  - Matriz de páginas × 6 sujetos (anónimo, cliente, caja, mesero, cocina y admin). Portada, login, registro, carta y detalle de producto funcionan sin sesión. Perfil y pedido redirigen a `/login?callbackUrl=…` sin sesión y responden con sesión. Cada panel responde a su rol, manda a `/forbidden` al resto y a `/login` al anónimo.
- Chromium contra `next start`, batería completa en dos tandas: 96 + 95 = **191/191**, incluida la línea base con sesión de cliente en perfil y pedido.
- Sin procesos abiertos.

**No verificado:** clientes externos que llamaran a `/api/public/*` o `/api/mesas` sin token. El inventario solo cubre el front; si los usa otra aplicación, dejarán de funcionar hasta que envíe token.

### 2.9 · Secreto JWT: fallar cerrado (2026-11-02)

El usuario pidió, a mitad del 2.8, seguir en automático y avanzar todo lo posible del PLAN sin esperar validaciones, con las mismas reglas.

**Cambios:**
- **`lib/seguridad/secreto-jwt.ts`** (nuevo): `claveJwt()` devuelve la clave a partir de `JWT_SECRET`, o `null` si falta. Registra una sola vez «[configuración] Falta JWT_SECRET…», sin el valor.
- **`proxy.ts` y `lib/session.ts`:** usan `claveJwt()`; sin clave, no hay sesión válida. Se eliminan los valores de respaldo:
  - en `proxy.ts`, un secreto de 64 caracteres hexadecimales incrustado en el código;
  - en `lib/session.ts`, `"fallback_secret_key_for_development"`.

**Aviso para el usuario:** el secreto que estaba incrustado en `proxy.ts` sigue en el historial de git. Si alguna vez coincidió con el `JWT_SECRET` real, hay que **rotarlo** (NP-02).

**Verificación:**
- `rg "fallback_|JWT_SECRET \|\|" proxy.ts lib`: sin resultados.
- Typecheck: 0 errores.
- Lint: los archivos tocados no cambian su cuenta (`lib/session.ts` conserva 1 previo) y el nuevo está limpio.
- Build: correcto.
- **Sin `JWT_SECRET`** (servidor arrancado sin la variable), con un token de admin válido firmado con el secreto de pruebas: `/dashboard/admin` responde `307` hacia `/login?callbackUrl=%2Fdashboard%2Fadmin`. El error de configuración aparece una vez en el registro y el token no aparece.
- **Con el secreto**, Chromium contra `next start`:
  - batería salvo el recorrido público: 86/86, incluida la línea base con las 42 rutas de panel y su sesión;
  - recorrido público: 95/95.
- Sin procesos abiertos.

### 2.8 · Logger del cliente sin datos sensibles (2026-11-02)

**Cambios:**
- **`lib/registro/registrar-error.ts`** (nuevo):
  - `esControlDeNext` reconoce los errores de control de `notFound()` y `redirect()` por su `digest` (`NEXT_HTTP_ERROR_FALLBACK…`, `NEXT_REDIRECT…`, `NEXT_NOT_FOUND`);
  - `registrarError` escribe solo el contexto, el mensaje (cortado a 200 caracteres) y el `digest`: nunca el objeto, la pila, cuerpos, tokens ni datos personales.
- **`app/error.tsx`:** usa `registrarError` en lugar de `console.error(error)`, que volcaba el objeto entero.
- **`app/page.tsx`:** se quitan los dos `console.log` de los manejadores de prueba de la portada, que registraban el plato completo. Los manejadores siguen vacíos, como estaban en la práctica.
- **`next.config.ts`:** `compiler.removeConsole` en producción, excepto `error`.

**Alcance:** `rg "console\.log" app components features hooks lib` aún encuentra 2: `app/api/cron/backups/route.ts` y `lib/db.ts`. Son backend (NP-01) y no se tocan; anotado en **NP-40**. Los dos escriben mensajes fijos («CRON: …») sin datos.

**Verificación:**
- Typecheck: 0 errores.
- Lint: ningún archivo tocado cambia su cuenta (`app/page.tsx` conserva sus 18 previos) y el nuevo está limpio.
- `pnpm test:unidad`: 29/29. `registro.spec.ts` (nueva) comprueba:
  - que reconoce los controles de Next y no los registra;
  - que, con un error que lleva token y correo, solo se escribe `[prueba] · mensaje · digest=…`.
- `csp.spec.ts`: un producto inexistente (`/menu/producto/999999`) no deja en la consola ningún error de `notFound()`.
- Build: correcto.
- Chromium contra `next start`, en dos tandas: 44 + 137 = **181/181**.
- Sin procesos abiertos.

**No verificado:**
- Que `removeConsole` actúe con el compilador de Next 16 (Turbopack). En el código de servidor no lo hace: el texto del `console.log` de `lib/db.ts` sigue en `.next/server`. En el cliente no queda ningún `console` propio salvo `console.error`, que se conserva a propósito, así que no hay nada que comprobar. La protección real es no tener `console.log` en el código del front.

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
