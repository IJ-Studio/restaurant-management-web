


VII. Procedimientos por tipos de usuario
7.1. Procedimientos para Clientes (Portal Web)
7.1.1. Proceso: Registro y gestión de cuenta
● Registrar cuenta (opción con redes sociales).
● Gestionar direcciones de entrega y métodos de pago guardados.
7.1.2. Proceso: Inicio de sesión
● Acceder al sistema con credenciales (Clientes).
● Recuperación de contraseña.
7.1.3. Proceso: Consulta de menú interactivo
● Visualizar menú con filtros (precio, categorías, etiquetas).
7.1.4. Proceso: Gestión de Reservas Web
● Consultar disponibilidad y solicitar reserva.
● Recibir confirmación automática (Email).
7.1.5. Proceso: Realización de pedidos a domicilio
● Seleccionar productos y personalizar orden.
● Realizar pago en línea (Pasarela de pagos).
7.1.7. Proceso: Auto-facturación
● Ingresar datos del ticket y datos fiscales para generar factura propia.
7.1.8. Historial de pedidos y facturas
● Permite a cada cliente visualizar de manera centralizada todos los pedidos
realizados así como descargar o solicitar facturas
7.1.9. Gestión de direcciones de entrega y métodos de pago guardados por el
cliente
● Gestiona direcciones de entrega del cliente
● Visualización de métodos de pago guardados

7.2. Procedimientos para personal operativo por roles
Rol: Hostess / Recepción
7.2.1. Proceso: Gestión de Flujo de Clientes
● Gestionar solicitudes de reservas y asignar mesas en el mapa.
● Gestionar lista de espera digital para clientes sin reserva (Walk-ins).
7.2.2. Gestión de lista de espera digital para clientes sin reserva
● Registra a los clientes en orden de hora de llegada
● Notifica cuando una mesa se encuentre libre
7.2.3. Envío automático de confirmaciones y recordatorios de reserva
● Enviar automáticamente mensajes al cliente vía email cuando realiza
modificaciones o se acerca la fecha de una reserva.
7.2.4. Confirmación de pedidos en mesa con selección de modificadores
● El cliente puede confirmar un pedido directamente desde la mesa, eligiendo
todas las personalizaciones necesarias antes de enviarlo a cocina
7.2.5. Visualización del mapa de mesas en tiempo real con estados
● Mapa interactivo del restaurante donde cada mesa aparece con su estado
actualizado en tiempo real

Rol: Cajero
7.2.2. Proceso: Apertura y Cierre de Caja
● Realizar apertura de turno.
● Ejecutar comprobación de cierre de caja
7.2.3. Proceso: Cobro y Facturación en sitio
● Procesar cobros con múltiples métodos (Efectivo, Tarjeta, Transferencia).
● Emitir facturas fiscales solicitadas en caja.
● Controlar ingresos y egresos de caja chica (Gastos menores).
7.2.4. División de cuentas por productos o por montos entre comensales
● Permite dividir la cuenta de una mesa entre varios comensales de forma
flexible
● El sistema recalcula impuestos, descuentos y propinas según la división
seleccionada
7.2.5. Gestión de propinas
● Permite registrar, calcular y administrar las propinas asociadas a una cuenta o
a un pedido.
● Registra la propina dentro de la cuenta, la refleja en el cierre de caja y permite
su posterior reparto o control administrativo.

Rol: Mesero
7.2.4. Proceso: Toma de órdenes en Mesa
● Seleccionar mesa en el mapa en tiempo real
● Registrar orden con selección de modificadores (términos, sin ingredientes,
extras).
● Dividir cuentas por producto o montos.
7.2.5. Proceso: Gestión de Servicio
● Monitorear el estado de la mesa (Libre, Ocupada, Sucia, Cuenta pedida).
● Gestionar propinas asociadas a la cuenta.
Rol: Cocina y Barra
7.2.6. Proceso: Producción de Pedidos (KDS)
● Visualizar pedidos en pantallas ordenados por tiempo.
● Gestionar rutas de impresión de pedidos de acuerdo a su interfaz
correspondiente.
● Cambiar estado de orden
7.2.7. Proceso: Gestión de Disponibilidad
● Marcar productos como "Agotados" (86'd) para bloquear venta en POS/Web.
Rol: Repartidor
7.2.8. Proceso: Gestión de Envíos
● Visualizar pedidos a domicilio listos para entrega.
● Actualizar estado de entrega (En camino -> Entregado).
7.3. Procedimientos para Administrador (Back-Office)
7.3.1. Proceso: Gestión de Inventarios y Abastecimiento
● Registrar altas de inventario mediante Órdenes de Compra y Proveedores.
● Registrar mermas (desperdicios) justificadas.
● Supervisar actualización automática de insumos basada en ventas.
7.3.2. Proceso: Ingeniería de Menú y Recetas
● Configurar Recetas y Escandallos (vincular ingredientes a platillos).
● Gestionar estructura de precios, descuentos y promociones.
● Configurar modificadores y guarniciones.
7.3.3. Proceso: Gestión de Personal y Seguridad
● Administrar datos laborales, horarios y asistencia (Reloj checador).
● Definir niveles de acceso (Roles).
7.3.4. Proceso: Análisis de Negocio (Dashboard)
● Visualizar reportes de ventas (por día, hora, mesero, categoría).
● Analizar rentabilidad de productos (Costo vs Precio).
● Analizar encuestas de satisfacción de clientes.
7.4. Procedimientos del Sistema
7.4.1. Proceso: Continuidad Operativa
● Ejecutar modo offline y sincronización posterior de datos.
● Realizar backups de datos automáticos.
7.4.2. Proceso: Integraciones y Notificaciones
● Procesar transacciones con pasarelas de pago.
● Enviar notificaciones automáticas (Recordatorios de reserva, Alertas de
cocina).
7.4.3. Filtrado de búsqueda por texto plano, o filtros estáticos
● Permite que los clientes puedan buscar y filtrar productos del menú de manera
rápida y precisa.
● El usuario puede aplicar filtros predefinidos como:
● Precio (menor a mayor, rango de precios)
● Ingredientes (incluir o excluir ingredientes)
● Categorías (entradas, bebidas, postres, etc.)
● Etiquetas (vegano, sin lactosa, recomendado, popular)


8.1. Módulo de Acceso

RF: Creación de una cuenta en la plataforma del restaurante para que los clientes
puedan interactuar de manera más completa con el restaurante
Descripción: El proceso de registro permite a los clientes crear una cuenta en la plataforma
del restaurante para realizar reservas, gestionar pedidos, acceder a promociones y solicitar
facturas electrónicas.
Entradas:
● Nombre
● Apellido
● Género
● Fecha de nacimiento
● Correo electrónico o Teléfono
● Contraseña
● Confirmación de contraseña
● Aceptación de términos y condiciones
Datos a calcularse:
● MayorEdad
Datos utilizados:
● Fecha de nacimiento del usuario
● Fecha actual del sistema
Operación:
Edad = AñoActual - AñoNacimiento
Procedimiento:
1. El cliente accede al formulario de registro desde la página principal
2. El usuario completa los datos: nombre, apellido, género, fecha de nacimiento, correo,
(teléfono si aplica), contraseña, confirmación de contraseña, aceptación de términos.
3. El sistema recibe todos los datos.
4. Se valida que la contraseña cumpla con todos los requisitos para la construcción de
una contraseña
5. El sistema consulta en la base si existe un correo igual.
● Datos usados: correo ingresado, correos almacenados en la base.
6. El sistema verifica si la contraseña coincide con la confirmación.
● Datos usados: contraseña ingresada, confirmación ingresada.
7. El sistema revisará que la contraseña no contenga datos personales.
● Datos comparados: contraseña vs (nombre, apellido, fecha de nacimiento,
correo, teléfono.)
8. Si todo es correcto, el sistema crea un registro de usuario con los datos recibidos.
9. El sistema arma el correo de confirmación usando los datos del usuario mas un token
10. Se envía un correo de confirmación para validar la cuenta
11. El sistema obtiene el token y busca el usuario asociado.
12. Se verifica el token.
13. Si es válido, el sistema cambia el estado del usuario a “verificado”.
14. Se redirige al usuario a la página de inicio de sesión.
Reglas:
● Todos los campos son obligatorios
● El usuario debe aceptar los términos y condiciones para continuar.
● El correo electrónico debe tener formato válido y no estar registrado anteriormente en
el sistema
● La contraseña debe tener al menos de ocho a doce caracteres, una combinación de
letras, números y símbolos,Utiliza al menos una letra mayúscula, una minúscula, un
número y un carácter especial
● La fecha de nacimiento deberá determinar si el usuario es mayor de edad.
Salidas:
● Una vez el usuario se registra, se guardan los siguientes datos:
○ ID de usuario
○ Nombre
○ Apellido
○ Género
○ Fecha de nacimiento
○ Correo electrónico
○ Teléfono (si aplica)
○ Contraseña encriptada
○ Estado de la cuenta (“Pendiente de verificación”)
○ Fecha y hora de registro
○ Token de verificación
○ Fecha y hora de generación del token
● Correo electrónico de confirmación enviado al usuario
● Mensaje de éxito en pantalla: “Cuenta creada exitosamente. Revisa tu correo para
verificar tu cuenta”
● Mensaje de error
○ “Correo ya registrado.”
○ “Las contraseñas no coinciden.”
○ “La contraseña contiene datos personales no permitidos.”
○ “Faltan datos obligatorios.”
○ “Debes aceptar los términos.”
○ “Ocurrió un error al crear la cuenta.”
Requerimientos específicos no funcionales:
● Las contraseñas se almacenan con encriptación, incluyendo caracteres especiales
● Los datos enviados entre cliente y servidor deben estar protegidos para que no se
visualicen en tránsito.
● Los datos personales (nombre, correo, teléfono) no deben ser expuestos en mensajes o
logs internos.
● Los mensajes que se muestran deben utilizar los datos exactos necesarios para
explicar el error (por ejemplo, “El correo ingresado ya existe”).
● El formulario debe mostrar en tiempo real si los datos ingresados tienen problemas,
basándose únicamente en los datos proporcionados por el usuario.





RF: Inicio de sesión de usuarios registrados
Descripción: Permite a los usuarios registrados acceder a su cuenta personal para realizar
movimientos del sistema que requiera que el usuario se identifique como:
● gestionar reservas
● Realizar compras de productos
● ver historial de pedidos
● solicitar facturas.
Entrada:
● Correo electrónico o teléfono
● Contraseña
Datos a calcularse:
● CuentaBloqueada
Datos utilizados:
● ntentos fallidos actuales: IntentosFallidos
● Límite permitido antes de bloqueo: 8
● Factor incremental de bloqueo: depende del número previo de bloqueos
Operación:
Si IntentosFallidos > LimiteIntentos → CuentaBloqueada = Verdadero
Si IntentosFallidos ≤ LimiteIntentos → CuentaBloqueada =
Falso
Procedimiento:
1. El usuario accede al formulario de inicio de sesión desde la página principal
2. El usuario ingresa su correo y contraseña en el formulario de login
3. El sistema verifica la existencia del correo electrónico
4. El sistema consulta en la base:
● Correo almacenado
● Teléfono almacenado
● Contraseña almacenada
● Estado de usuario
● Intentos fallidos
● Método de verificación
5. Se determina si el correo o teléfono ingresado existe en la base de datos.
6. Si existe, se compara la contraseña ingresada con la almacenada
7. Si las credenciales no son válidas:
● Se incrementa el dato IntentosFallidos
● Se verifica si CuentaBloqueada pasa a Verdadero
Si se bloquea:
● Se cambia en la base el dato EstadoCuenta a “Bloqueada parcialmente”
● Se genera correo de notificación de bloqueo
8. Si el usuario tiene un método de verificación activo:
● Se redirige al formulario del método correspondiente
● Se solicita el dato adicional de verificación.
9. Si la verificación es correcta (según el método), se continúa.
10. Se almacena la sesión del usuario
11. El usuario es redirigido al dashboard principal
Reglas:
● El correo electrónico o teléfono ingresado debe estar registrado en el sistema
● La contraseña debe coincidir estrictamente con la registrada en la base de datos
● Si se alcanza el máximo de intentos fallidos, el sistema debe bloquear parcialmente la
cuenta.
● El bloqueo se vuelve incremental si el usuario sigue fallando después de desbloqueos
anteriores.
● Si el usuario tiene un método de verificación activo, debe completarlo para iniciar
sesión.
● Si la verificación adicional falla, la sesión no se genera.
Salida:
● Mensaje de éxito en pantalla: “Inicio de sesión exitoso”
● Mensaje de error:
○ “Credenciales inválidas.”
○ “Correo o teléfono no encontrado.”
○ “Campos faltantes.”
○ “Cuenta bloqueada por intentos fallidos.”
○ “Error al verificar la identidad.”
○ “Error interno al crear sesión.”
● Notificación por correo electrónico de cuenta bloqueada por intentos fallidos
● En caso de un acceso exitoso al sistema el usuario será redirigido al dashboard
principal
● Se redirecciona al formulario de verificación adicional (si corresponde).
● Se redirecciona al usuario al dashboard principal (si todo es correcto)
Requerimientos específicos no funcionales:
● “Recordar sesión” genera un token de expiración extendido (dato adicional en sesión).


RF: Recuperación de contraseña un usuario
Descripción: Permite a los usuarios que han olvidado su contraseña restablecer de manera
segura mediante un enlace temporal enviado a su correo electrónico.
Entrada:
● Correo electrónico
Procedimiento:
1. Usuario ingresa su correo electrónico registrado en el formulario de recuperación
2. Sistema consulta que el correo exista en la base de datos
3. Si existe:
● el sistema crea RequestID
● genera Token
● construye URLRecuperacion
● registra FechaSolicitudRecuperación
4. El sistema envía por correo el URLRecuperacion.
5. Usuario hace clic en el enlace
6. El usuario es redirigido al formulario de restablecimiento de contraseña
7. El usuario establece una nueva contraseña
8. El sistema compara NuevaContraseña con ConfirmacionNuevaContraseña
9. El sistema verifica que NuevaContraseña cumple la política de contraseña
10. Si todo es correcto, el sistema actualiza el dato Contraseña del usuario y registra
FechaActualizacionContra.
11. El sistema envía confirmación (pantalla y correo)
12. El usuario es redirigido a la página de inicio de sesión
Reglas:
● El correo electrónico debe estar registrado previamente
● El enlace de recuperación expira después de haber sido abierto
● La contraseña debe tener al menos de ocho a doce caracteres, una combinación de
letras, números y símbolos,Utiliza al menos una letra mayúscula, una minúscula, un
número y un carácter especial
● La nueva contraseña no puede contener parcial ni totalmente los datos del mismo
formulario de registro: nombre, apellido, fecha de nacimiento, correo, teléfono.
● Se registran RequestID y FechaActualizacionContra para auditoría.
Salida:
● Correo electrónico con enlace de recuperación enviado al usuario
● Mensaje de éxito en pantalla: “Correo enviado con instrucciones para restablecer
contraseña.”, “Contraseña restablecida exitosamente”
● Actualización del dato Contraseña (nuevo valor reemplaza al anterior) en la base de
datos además de registro de FechaActualizacionContra.
● correo confirmando cambio de contraseña.
● Mensaje de error:
○ “Correo no encontrado.”
○ “Campos faltantes.”
○ “Token inválido / ya usado / expirado”
○ “NuevaContraseña y Confirmación no coinciden ”
○ “NuevaContraseña contiene dato personal ”
○ “Error interno”
Requerimientos específicos no funcionales:
● Debe cumplirse estrictamente la Política de contraseñas durante el cambio de
contraseña:
● La nueva contraseña debe guardarse usando un algoritmo seguro con sal: aleatoria
bcrypt.
● El flujo debe estar separado en dos pantallas:
○ Formulario de solicitud de recuperación (solo Correo).
○ Formulario de restablecimiento (NuevaContraseña y
ConfirmacionNuevaContraseña).

RF Dashboard principal como punto de entrada al sistema
Descripción: La página de inicio es el dashboard principal que sirve como punto de entrada
al sistema, proporcionando acceso rápido a todas las funcionalidades, información relevante y
notificaciones importantes tanto para clientes como para el personal del restaurante.
Entrada:
● rol de usuario (predeterminado “cliente”)
● credenciales válidas de la sesión del UsuarioID
● Preferencias del UsuarioID
● permisos del usuario (Lista de permisos otorgados al UsuarioID según su Rol:)
● Datos de sesión activa (IPSesion)
● Información en tiempo real del restaurante
○ EstadoMesas (ocupadas, libres, reservadas)
○ Pedidos
○ Reservas
○ NotificacionesPendientes
○ Alertas (inventario, sistema, cocina)
○ PromocionesActivas (para clientes)
Procedimiento:
1. El usuario ingresa con UsuarioID autenticado.
2. El sistema obtiene los datos del usuario:
● Rol
● Permisos
3. El sistema consulta la información en tiempo real relevante para ese rol:
● Si Rol = Cliente → carga PromocionesActivas, HistorialPedidos, Reservas,
NotificacionesUsuario.
● Si Rol = Personal (cualquier rol interno) → carga PedidosEnCurso,
ReservasDelDía, EstadoMesas, Alertas.
4. El sistema selecciona qué módulos mostrar
5. El sistema renderiza el dashboard según:
● Rol
● Permisos
● Preferencias
● InformaciónTiempoReal
6. El sistema mantiene una conexión SSE para actualizar en tiempo real:
● EstadoMesas
● PedidosEnCurso
● Alertas
● Notificaciones
7. Usuario navega entre las diferentes secciones del sistema
Reglas:
● El sistema solo carga dashboard si SesionActiva = true
● Si SesionActiva = false, se redirige a inicio de sesión.
● Si Rol = Cliente:
○ Mostrar solo módulos de cliente (por ejemplo: Reservas, Pedidos,
Promociones, HistorialPedidos).
● Si Rol != Cliente:
○ Mostrar módulos según Permisos.
○ Datos mostrados cambiarán según el rol:
■ Mesero → pedidos asignados, mesas atendidas.
■ Cocinero → pedidos pendientes por preparar.
■ Cajero → pagos, facturación.
■ Administrador → estadísticas, ventas, reportes.
● Los datos deben refrescarse sin recargar la página cuando alguno de los siguientes
cambia:
○ PedidosEnCurso
○ ReservasDelDía
○ EstadoMesas
○ Alertas
○ Notificaciones
● Actualización permitida solo si SesionID activa
● Solo los módulos cuyo identificador esté contenido en PermisosUsuario pueden
aparecer interactivos.
● Los módulos sin permiso deben ocultarse
● Si un dato de preferencia no existe, se usa el valor por defecto del sistema.
Salida:
● Dashboard personalizado según perfil de usuario:
○ ListaModulosPermitidos
○ DatosTiempoReal según rol
● Notificaciones del usuario
● URLs o rutas habilitadas según permisos.
● Información visible en pantalla (dependiendo del rol)
Requerimientos específicos no funcionales:
● Los datos críticos deben actualizarse mediante un canal persistente (SSE)
● La conexión debe reintentar automáticamente en caso de pérdida
● Mostrar iconografía clara para cada módulo (sin ambigüedades).
● Mostrar notificaciones con indicadores visuales (ej.: badge numérico)
● Mantener una estructura uniforme:
○ Barra lateral o superior con módulos
○ Indicadores en tiempo real en lugares consistentes
● El dashboard solo se puede cargar si el token de sesión es válido.
● Cada actualización en tiempo real debe verificar UsuarioID y permisos antes de
enviar información.
● Los módulos en tiempo real no deben saturar el cliente
● El sistema debe soportar múltiples roles simultáneos sin degradación, con un mínimo
de 200 usuarios activos en tiempo real conectados al canal de actualización.


8.2. Módulo de Catálogo de servicios y productos

RF: visualización del menú completo del restaurante
Descripción: Permite a los clientes visualizar el menú completo del restaurante accesible
mediante código QR en las mesas mostrando para cada producto los datos:
● precio
● descripción del producto
● categoría
● imágen
● disponibilidad en tiempo real
Entrada:
● Código QR que contiene:
○ MesaID
○ URLAccesoMenu
● Número de mesa (MesaID)
● preferencias del cliente: PreferenciasDeFiltro (vegetariano, sin gluten, etc., si
existieran)
Datos a calcularse:
● PrecioConIVA
Datos utilizados:
● PrecioBase
● IVA (porcentaje aplicado)
Operación:
PrecioConIVA = PrecioBase + (PrecioBase * IVA/100)
● PrecioFinal (si hay descuento)
Datos utilizados:
● PrecioConIVA
● PorcentajeDescuento
Operación:
● PrecioFinal = PrecioConIVA - (PrecioConIVA * PorcentajeDescuento/100)
Procedimiento:
1. Cliente accede a sección “menú” mediante la pagina principal o código QR en la mesa
desde menú principal
● El cliente escanea el CódigoQR.
● El sistema identifica MesaID.
2. Sistema consulta productos activos en base de datos
3. Obtiene:
● Categorías
● Productos con datos completos
● Disponibilidad en tiempo real
● Descuentos activos si aplican
4. Aplicación de preferencias del cliente (si existen):
5. Construcción del panel del menú:
● Se agrupan los productos por CategoriaID.
● Se muestran tarjetas de producto con:
● Nombre
● Imagen
● PrecioConIVA
● Indicador "No disponible" si corresponde
● Indicador de descuento si corresponde
6. El cliente selecciona un producto.
7. El sistema abre ventana emergente con:
● Nombre
● DescripciónCompleta
● Imagen
● PrecioBase
● IVA aplicado (mostrar porcentaje y valor calculado)
● PrecioConIVA
● Descuento si aplica (mostrar porcentaje y valor descontado)
● PrecioFinal
● Disponibilidad
Reglas:
● Al abrir la ventana emergente del producto deben mostrarse todos los campos listados
en la sección de datos.
● Si Disponibilidad = No disponible mostrar leyenda “No disponible” e Impedir
interacción relacionada con pedido.
● Cambios en Disponibilidad deben reflejarse en pantalla
● La descripción del producto debe ser detallada
● En detalles, se debe mostrar:
○ PrecioBase
○ IVA (%)
○ PrecioConIVA
○ Si hay descuento indicar “–X% de descuento”
○ PrecioFinal.
● Si DescuentoActivo = true debe mostrarse un indicador visual (etiqueta o ícono).
● Si un producto cambia: disponibilidad, precio o descuento, se actualiza
automáticamente la tarjeta correspondiente.
Salida:
● Panel de menú organizado por categorías
● Indicadores gráficos (IconoDescuento (si aplica), EtiquetaNoDisponible)
● Ventana emergente con detalles del producto
● Vista actualizada en tiempo real
○ DisponibilidadActualizada
○ DescuentosActualizados
○ PreciosActualizados
Requerimientos específicos no funcionales:
● Las imágenes deben escalar proporcionalmente sin corte.
● El buscador debe filtrar productos en tiempo real mientras el usuario escribe.
● Las categorías deben permanecer accesibles mediante barra fija o menú desplegable.
● Debe existir indicador visual claro para descuentos y disponibilidad.

8.2. Muestra las promociones y ofertas especiales vigentes en el restaurante
Descripción: Muestra las promociones y ofertas especiales vigentes en el restaurante, con
capacidad de filtrado por tipo de promoción.
Entrada:
● Filtro de promoción aplicado
○ TipoPromocionSeleccionada
○ TextoBusquedaPromociones
● Perfil del cliente:
○ ClienteID (si está logueado)
○ TipoCliente (registrado / invitado)
○ HistorialUsoPromociones (si aplica)
● datos del cliente
○ PreferenciasCliente
○ MétodosDeContacto (correo para notificaciones)
● fecha y hora actual
Datos a calcularse:
● PrecioConIVA
Datos utilizados:
● PrecioBase
● IVA (porcentaje aplicado)
Operación:
PrecioConIVA = PrecioBase + (PrecioBase * IVA/100)
● PrecioFinal (si hay descuento)
Datos utilizados:
● PrecioConIVA
● PorcentajeDescuento
Operación:
● PrecioFinal = PrecioConIVA - (PrecioConIVA * PorcentajeDescuento/100)
Procedimiento:
1. El sistema consulta todas las promociones
2. Excluye promociones expiradas automáticamente.
3. Aplica TipoPromocionSeleccionada (si existe)
4. Aplica TextoBusquedaPromociones sobre NombrePromocion
5. Si el cliente está logueado, se valida: UsosAcumuladosCliente < LimiteUsoPorCliente
6. Se muestran las promociones vigentes agrupadas por TipoPromocion
7. El cliente selecciona una promoción.
8. El sistema abre ventana emergente con:
● Nombre
● DescripciónCompleta
● Imagen
● Fechas y horas válidas
● PrecioBase
● IVA aplicado (mostrar porcentaje y valor calculado)
● PrecioConIVA
● Descuento si aplica (mostrar porcentaje y valor descontado)
● PrecioFinal
● Términos y condiciones
● Límite de uso
9. El sistema verifica en tiempo real cambios en:
● Estado de la promoción
● Disponibilidad
● Fechas de expiración
● Descuentos
10. Actualiza la vista sin recargar la página.
11. Cuando una promoción está por expirar (ej. < 24 h), se genera notificación:
● En el sistema
● (si MétodosDeContacto.Correo existe)
Reglas:
● Visualiza detalles completos al seleccionar una promoción
● Una promoción no debe mostrarse si:
○ FechaActual > FechaFin
○ Estado != 'Activa'
● Si UsosAcumuladosCliente >= LimiteUsoPorCliente, la promoción debe marcarse
como “Límite alcanzado” y no ser aplicable.
● Cambios en Disponibilidad deben reflejarse en pantalla
● En detalles, se debe mostrar:
○ PrecioBase
○ IVA (%)
○ PrecioConIVA
○ Si hay descuento indicar “–X% de descuento”
○ PrecioFinal.
● Si un producto cambia: disponibilidad, precio o descuento, se actualiza
automáticamente la tarjeta correspondiente.
● Promociones expiradas no se muestran
Salida:
● Lista filtrada de promociones activas.
● Ventana emergente de las promociones con sus respectivos detalles de términos y
condiciones
● Indicadores gráficos
○ IconoPromocionExclusiva
○ EtiquetaLímiteAlcanzado (si aplica)
● Notificaciones por correo electrónico y en el sistema de promociones por expirar
Requerimientos específicos no funcionales:
● Indicadores visuales claros para exclusividad y expiración cercana
● Términos y condiciones accesibles sin necesidad de scroll horizontal.

RF: Organizar el menú en categorías
Descripción: Organiza el menú en categorías lógicas para facilitar la navegación y búsqueda
de productos por parte de los clientes.
Entrada:
● CategoriaSeleccionadaID
● NombreCategoriaSeleccionada
● Filtros aplicados por el cliente:
○ FiltroTextoBusqueda
○ FiltroRangoPrecio
○ FiltroDescuentos
Datos a calcularse:
● TotalProductos
Datos utilizados:
● BD
Operación:
TotalProductos = Contar(Productos WHERE CategoriaID = CategoriaID AND
EstadoProducto = 'Activo')
Procedimiento:
1. Se consulta la lista de categorías activas
2. Se ordenan por relevancia
3. Para cada CategoriaID, calcular TotalProductos.
4. Si TotalProductos = 0, la categoría no se muestra (solo para clientes).
5. Se presentan tarjetas de categorías:
● Nombre
● Imagen (si existe)
● Conteo de productos
6. Sistema divide productos por categorías
7. El usuario selecciona una categoría CategoriaSeleccionadaID.
8. El sistema obtiene todos los productos con:Producto.CategoriaID =
CategoriaSeleccionadaID AND EstadoProducto = 'Activo'
9. Luego aplica los filtros adicionales:
● FiltroTextoBusqueda
● FiltroRangoPrecio
● FiltroDescuentos
10. El sistema mantiene el historial para permitir volver atrás fácilmente.
Reglas:
● El sistema debe mantener historial de navegación entre categorías
● Mínimo 4 categorías principales deben existir
● Cada producto debe pertenecer al menos a una categoría Producto.CategoriaID !=
NULL
● Categorías con TotalProductos = 0 no se muestran al cliente.
● El orden está definido por el administrador y debe respetarse en el panel.
● El sistema debe registrar cada categoría visitada:
○ ID
○ Fecha/hora
○ Secuencia de navegación
Salida:
● panel de categorías organizado visualmente
● Lista de categorías activas con:
○ CategoriaID
○ NombreCategoria
○ ImagenCategoriaURL
○ TotalProductos
● TotalProductos mostrado como contador.
● Registro de visitas a categorías, guardado en sesión.
Requerimientos específicos no funcionales
● Transición entre categorías sin recarga completa de la página.
● Panel ordenado visualmente según importancia y uso.
● Conteo de productos precalculado o almacenado en caché para reducir consultas.
● Si cambia la disponibilidad de productos, los conteos de categorías deben actualizarse


RF: Organizar el menú en categorías
Descripción: Organiza el menú en categorías lógicas para facilitar la navegación y búsqueda
de productos por parte de los clientes.
Entrada:
● CategoriaSeleccionadaID
● NombreCategoriaSeleccionada
● Filtros aplicados por el cliente:
○ FiltroTextoBusqueda
○ FiltroRangoPrecio
○ FiltroDescuentos
Datos a calcularse:
● TotalProductos
Datos utilizados:
● BD
Operación:
TotalProductos = Contar(Productos WHERE CategoriaID = CategoriaID AND
EstadoProducto = 'Activo')
Procedimiento:
1. Se consulta la lista de categorías activas
2. Se ordenan por relevancia
3. Para cada CategoriaID, calcular TotalProductos.
4. Si TotalProductos = 0, la categoría no se muestra (solo para clientes).
5. Se presentan tarjetas de categorías:
● Nombre
● Imagen (si existe)
● Conteo de productos
6. Sistema divide productos por categorías
7. El usuario selecciona una categoría CategoriaSeleccionadaID.
8. El sistema obtiene todos los productos con:Producto.CategoriaID =
CategoriaSeleccionadaID AND EstadoProducto = 'Activo'
9. Luego aplica los filtros adicionales:
● FiltroTextoBusqueda
● FiltroRangoPrecio
● FiltroDescuentos
10. El sistema mantiene el historial para permitir volver atrás fácilmente.
Reglas:
● El sistema debe mantener historial de navegación entre categorías
● Mínimo 4 categorías principales deben existir
● Cada producto debe pertenecer al menos a una categoría Producto.CategoriaID !=
NULL
● Categorías con TotalProductos = 0 no se muestran al cliente.
● El orden está definido por el administrador y debe respetarse en el panel.
● El sistema debe registrar cada categoría visitada:
○ ID
○ Fecha/hora
○ Secuencia de navegación
Salida:
● panel de categorías organizado visualmente
● Lista de categorías activas con:
○ CategoriaID
○ NombreCategoria
○ ImagenCategoriaURL
○ TotalProductos
● TotalProductos mostrado como contador.
● Registro de visitas a categorías, guardado en sesión.
Requerimientos específicos no funcionales
● Transición entre categorías sin recarga completa de la página.
● Panel ordenado visualmente según importancia y uso.
● Conteo de productos precalculado o almacenado en caché para reducir consultas.
● Si cambia la disponibilidad de productos, los conteos de categorías deben actualizarse

RF: Visualización del catálogo de bebidas
Descripción: Permite a los clientes visualizar el catálogo de bebidas mostrando para cada
producto los datos:
● precio
● descripción del producto
● categoría
● imágen
● disponibilidad en tiempo real
Entrada:
● FechaActual
● HoraActual
● CategoriaBebidaSeleccionada
● Búsqueda por nombre o ingrediente
● Búsqueda por nombre o ingrediente
○ TextoBusqueda
○ IngredienteBuscado
Datos a calcularse:
● DisponibilidadVentaAlcohol
Datos utilizados:
● TipoBebida
● HoraActual
● HorarioPermitidoInicio
● HorarioPermitidoFin
Operación:
if TipoBebida = 'alcohólica' AND
 (HoraActual < HorarioPermitidoInicio OR HoraActual > HorarioPermitidoFin):
 BebidaDisponibleParaVenta = false
else
 BebidaDisponibleParaVenta = DisponibilidadVentaAlcohol
Procedimiento:
1. Cliente accede a sección de bebidas desde menú principal
2. El sistema obtiene todas las bebidas con estado activo en la base de datos
3. Luego aplica los filtros adicionales:
● FiltroTextoBusqueda
● FiltroRangoPrecio
● FiltroDescuentos
4. El sistema mantiene el historial para permitir volver atrás fácilmente.
5. El sistema revisa si la bebida alcohólica puede mostrarse como disponible en ese
horario.
6. Si no cumple horario → mostrar la bebida, pero marcada como “No disponible por
horario”.
7. Las bebidas se agrupan por categoría:
8. Cada bebida muestra:
● Imagen
● Nombre
● PrecioFinal
● Indicador de descuento (si aplica)
● Disponibilidad
● Indicador 18+ (si aplica)
9. Al seleccionar una bebida se abre una ventana con:
10. Cada bebida muestra:
● Nombre
● Descripción
● PrecioBase
● IVA (%)
● PrecioConIVA
● Si hay descuento indicar “–X% de descuento”
● PrecioFinal
● Restricción de edad
11. Si una bebida se agota, la tarjeta cambia inmediatamente a “No disponible”.
12. Muestra información actualizada de cada producto
Reglas:
● La descripción Incluye ingredientes
● Las bebidas alcohólicas deben respetar el horario estipulado en legislación local, Si
no cumple horario → marcar como “No disponible por horario”.
● La disponibilidad debe actualizarse en tiempo real según el inventario.
● Bebidas alcohólicas solo para mayores de 18 años
● Todos los precios deben mostrarse con IVA incluido.
● En detalle, deben aparecer:
● PrecioBase
● Porcentaje de IVA
● Monto del IVA
● PrecioConIVA
● Indicador de descuento
● PrecioFinal
● Si TieneDescuento = true, mostrar etiqueta gráfica.
Salida:
● Lista agrupada por categoría
● Indicadores gráficos de productos con descuentos
○ IconoDescuent
○ EtiquetaPorcentajeDescuento
● Indicadores de restricciones de edad


8.2. Modulo “Acerca de”

RF: Proporcionar a los clientes información fundamental sobre el restaurante
Descripción: Proporciona a los clientes información fundamental sobre el restaurante
reforzando la identidad de marca y generando confianza, incluyendo:
● historia
● misión
● valores
Entrada:
● Solicitud de acceso a sección "Acerca de"
Procedimiento:
1. Cliente selecciona "Acerca de" en el menú principal
2. El sistema consulta:
● Información institucional
● Información de contacto
● Galerías de imágenes
3. Secciones visuales generadas
● Historia
● Misión
● Visión
● Valores
● Contacto
● Ubicación
● Galería de imágenes del restaurante
4. Ofrece navegación entre subsecciones internas
5. El sistema carga imágenes optimizadas en diferentes resoluciones según dispositivo.
6. Se habilitan botones para contactar al restaurante
Reglas:
● Las imágenes deben ser de alta calidad y estar optimizadas para evitar carga lenta.
● Accesos directos a contacto y ubicación
● La sección debe estar disponible para todos los usuarios sin necesidad de inicio de
sesión.
Salida:
● Página corporativa estructurada
● Secciones organizadas
● Elementos visuales
● Accesos directos
Requerimientos específicos no funcionales:
● Interfaz coherente con la identidad visual del restaurante:
○ Paleta de colores institucional.
○ Tipografía corporativa.
○ Espaciados y jerarquías visuales definidas.
● Optimización de imágenes
● Texto legible (mínimo 16px).
● Etiquetas ALT en imágenes para usuarios con discapacidad visual

RF: Información esencial sobre ubicación, horarios y contacto
Descripción: Proporciona información esencial sobre ubicación exacta, horarios de
operación y datos de contacto, facilitando la visita de clientes al restaurante.
Entrada:
● Acceso a sección "Horarios y Ubicación"
● Solicitud de información de contacto
Procedimiento:
1. El cliente selecciona la sección “Horarios y Ubicación”.
2. Consultar ubicación:
3. Consultar horarios:
4. Consultar datos de contacto:
5. Consultar redes sociales activas:
6. Mostrar mapa interactivo con marcador de la ubicación del restaurante.
7. Renderizar tabla de horarios por día.
8. Mostrar números de teléfono, correos y enlaces a redes sociales.
9. Proporcionar botones de accion
Reglas:
● Horarios actualizados según temporada y festivos
● El mapa debe mostrar
○ punto exacto de ubicación
○ zoom recomendado según dispositivo
● La dirección debe coincidir con la registrada oficialmente.
● Solo se muestran redes sociales activas
● Enlaces de navegación a apps deben abrirse en una nueva pestaña.
Salida:
● Mapa interactivo con marcador de ubicación
● Tabla de horarios organizada por días
● Datos de contacto completos y accesibles
○ Telefono
○ CorreoContacto
○ Enlaces a redes sociales con iconos oficiales
● Enlaces a aplicaciones de navegación
Requerimientos específicos no funcionales:
● Texto legible en pantallas pequeñas.
● ALT en iconos.

8.2. Módulo de Gestión de Reservas

RF: Gestiona las solicitudes de reservas a través de la plataforma web
Descripción: Gestiona las solicitudes de reservas recibidas a través de la plataforma web en
el rol de administrador, permitiendo:
● confirmación de reservas
● modificación de reservas
● cancelación de reservas
Entrada:
Datos obligatorios para identificar la reserva
● NumeroReserva
● NombreCliente
● TelefonoCliente
● CorreoCliente
Datos de la solicitud
● AccionSolicitada
Valores posibles:
● "Confirmar"
● "Modificar"
● "Cancelar"
● Datos operativos de la reserva
● FechaSolicitada
● HoraSolicitada
● NumeroComensales
● MesasSolicitadas[]
● MontoPagoAnticipado
● Datos opcionales
● RequerimientosEspeciales

Procedimiento de asignación:
1. Administrador recibe la solicitud (AccionSolicitada = Confirmar).
2. Administrador consulta calendario de disponibilidad
3. Si hay disponibilidad
● asignar mesa específica o bloque de mesas.
● Actualizar estado:
● EstadoReserva = Confirmada
● Registrar asignación en historial.
● Enviar correo de confirmación al cliente.
4. Si no hay disponibilidad:
● proponer alternativas de horario o otra fecha disponible.
● Esperar la aceptación del cliente antes de confirmar o rechazar.
Procedimiento de gestión de modificaciones:
1. Administrador recibe solicitud (AccionSolicitada = Modificar).
2. Validar los datos a modificar:
● Fecha
● Hora
● Comensales
● Requerimientos especiales
3. Administrador consulta calendario de disponibilidad
4. Si hay disponibilidad:
● Actualizar:
● Fecha
● Hora
● Mesa asignada (si es necesario)
● Datos modificados
● Registrar cambio en HistorialCambios.
● Cambiar estado:
EstadoReserva = Modificada
● Enviar correo de actualización.
5. Si no hay disponibilidad:
● Proponer alternativas y esperar aceptación.
Procedimiento de gestión de cancelaciones:
1. Administrador recibe solicitud (AccionSolicitada = Cancelar).
2. Registrar la solicitud.
3. Cambiar estado:
● EstadoReserva = Cancelada
4. Actualizar CalendarioDisponibilidad liberando MesasAsignadas
5. Registrar cancelación en historial.
6. Enviar correo de cancelación al cliente.
Reglas:
● Reservas deben confirmarse en un máximo de 2 horas desde su recepción:
Si TiempoActual - TiempoCreacionReserva > 2h → Sugerir cancelar o contactar
cliente.
● Se debe impedir sobrerreserva:

Si MesasDisponibles < MesasSolicitadas → No permitir confirmación.
● Detectar solicitudes múltiples del mismo cliente
Si más de una coincidencia → marcar como posible duplicado.
● Anticipos requeridos para eventos especiales
El sistema debe validar antes de confirmar.
● Cada cambio debe quedar registrado en:
HistorialCambios (con marca temporal y responsable)
● Actualizaciones, confirmaciones y cancelaciones deben siempre generar correo:
Salida:
● Estado de la Reservas
○ ReservaConfirmada
○ ReservaModificada
○ cReservaCancelada
● ComprobanteReserva
● correo electronico
● Comprobantes de reserva generados
● Recordatorios automáticos programados (ej. 24 horas y 2 horas antes del horario
reservado)
● CalendarioDisponibilidad
● HistorialCambios
● EstadoReserva
Requerimientos específicos no funcionales:
● Notificaciones automáticas al cliente vía Email
● Sincronización obligatoria con sistema de mesas:
○ Estado de mesas
○ Bloques de tiempo ocupados
○ Eventos especiales
● Calendario visual para administradores.
● Alertas claras en caso de sobrerreserva o duplicidades.
● Todos los cambios deben tener:
○ fecha
○ hora
○ ID de administrador
○ acción realizada
○ datos previos y nuevos

8.2. Calendario interactivo para visualizar y gestionar la disponibilidad de mesas
Descripción: Permite al administrador visualizar y gestionar la disponibilidad de mesas en un
calendario interactivo, mostrando horarios ocupados y libres para optimizar la capacidad del
restaurante.
Entrada:
● FechaConsulta
● HoraConsulta o RangoHorarioConsulta
● NumeroPersonas
● Preferencias de mesa
Valores posibles:
○ Interior
○ Exterior
○ Cerca de ventana
Procedimiento:
1. El Administrador accede al módulo “Calendario de Disponibilidad”.
2. Selecciona FechaConsulta y RangoHorarioConsulta.
3. El sistema consulta:
MesasDisponibles = Filtrar Mesas donde:
 Mesa no esté en ReservasExistentes para ese rango
 Mesa no esté en MesasBloqueadas por eventos
4. Sistema muestra con códigos de color.
● Mesas libres
● Mesas ocupadas
● Mesas bloqueadas
5. Visualiza detalles de reservas confirmadas
Gestión de disponibilidad
6. El Administrador selecciona una mesa del calendario.
7. Sistema despliega detalles:
● Estado actual
● Reservas asociadas
● Capacidad
● Turnos disponibles
8. Administrador puede:
● Bloquear mesa para mantenimiento o evento
● Desbloquear mesa previamente marcada
● Ajustar capacidad del día (sin exceder límites físicos)
9. Cambios afectan inmediatamente:
● ReservasExistentes
● Mesas
● EventosEspeciales
Visualización de reservas confirmadas
1. El sistema muestra cada reserva existente en la vista del calendario.
2. Para cada reserva:
● NombreCliente
● Horario
● NumeroPersonas
● MesaID
Bloqueo por eventos especiales
1. Administrador selecciona fecha.
2. Indica un evento especial.
3. Selecciona mesas a bloquear.
4. Sistema asigna:
EstadoMesa = Bloqueada
5. Se impide la asignación de reservas en esas mesas.
Reglas:
● Una mesa no puede superar su capacidad máxima
● El sistema debe aplicar un tiempo fijo de separación entre reservas:
HoraFinReserva + TiempoLimpieza → Próxima disponibilidad real
● Si una mesa está incluida en un evento especial:
○ Toda solicitud de reserva sobre esa mesa queda prohibida.
○ No pueden asignarse reservas que se superpongan en horario.
● Cualquier cambio debe reflejarse inmediatamente en el calendario:
○ Bloqueos
○ Confirmaciones
○ Cancelaciones
● Si HoraInicio de una reserva se superpone con otra:
○ Generar alerta de conflicto
○ Bloquear acción hasta resolución
Salida:
● CalendarioInteractivo con:
○ Mesas libres (color A)
○ Mesas ocupadas (color B)
○ Mesas bloqueadas (color C)
● Indicadores de ocupación por mesa
○ PorcentajeOcupacion
○ CapacidadUtilizada
○ MesasDisponibles
○ MesasBloqueadas
● Alertas automáticas
○ AlertaConflictoHorario
○ AlertaCapacidadExcedida
○ AlertaMesaBloqueada
● Reporte de capacidad utilizada:
○ ReporteCapacidadDiaria
○ ReporteMesasOcupadas
○ ReporteEventosBloqueo


Requerimientos específicos no funcionales:
● Cada acción del administrador debe reflejarse en el calendario

RF. visualizar asignación de mesas específicas a reservas confirmadas a través de
un mapa de mesas
Descripción: Asigna mesas específicas a reservas confirmadas, optimizando la distribución
en el salón según número de comensales y preferencias.
Entrada:
● Datos de reservas confirmadas
Cada reserva contiene:
○ ReservaID
○ NombreCliente
○ Fecha
○ HoraInicio
○ HoraFin
○ NumeroComensales
○ PreferenciasCliente
● Datos del mapa de mesas del restaurante
Mesas[ ] con:
○ MesaID
○ CapacidadMaxima
○ Ubicacion (zona)
○ Estado (Disponible / Ocupada / Bloqueada)
○ MeseroAsignado (opcional)
○ Preferencias de clientes
● CapacidadPorZona
● Zonas[] con distribución física
● Meseros[] con zonas a cargo
Procedimiento:
1. Administrador visualiza mapa de mesas disponible
2. Sistema carga:
● Plano interactivo del restaurante.
● Mesas con su estado actual.
● Reservas confirmadas del día.
Asignación de mesas
3. El Administrador selecciona una reserva confirmada.
4. El sistema resalta mesas compatibles:
Mesa.CapacidadMaxima ≥ NumeroComensales
Mesa.Estado = Disponible
PreferenciasCliente coinciden con Zona
5. Si la mesa pertenece a una zona atendida por un mesero:
Asignación de meseros
6. Sistema muestra distribución del personal por zona.
7. Sistema valida balance de carga:
● Misma cantidad aproximada de mesas por mesero.
● No sobrecargar un mismo tramo horario.
8. Administrador genera:
● Distribución por zonas para meseros, Documentos incluyen:
○ MesaID, ReservaID, NombreCliente, Horario
○ Mesero asignada
○ Zona
Reglas:
● La mesa debe permitir el tamaño del grupo:
NumeroComensales ≤ CapacidadMaxima
● No se permite asignar más del límite predefinido de mesas por mesero por turno.
● Sistema debe alertar cuando:
○ Dos reservas intentan usar la misma mesa en el mismo horario.
○ Una mesa está bloqueada por evento.
○ La capacidad no coincide.
● Mesas en mantenimiento o eventos no pueden ser asignadas.
Salida:
● Vista visual clara con:
○ Mesas libres
○ Mesas asignadas
○ Mesas bloqueadas
○ Mesas con conflictos
● Lista de distribución por turno
Incluye:
○ Horario
○ Mesa asignada
○ Cliente
○ Mesero responsable
○ Zona
● Hoja de asignación para hostess
Incluye
● Orden de llegada por horario
● Mesas asignadas
● Alertas de conflictos en asignaciones
○ AlertaMesaNoCompatible
○ AlertaMesaYaReservada
○ AlertaCapacidadInsuficiente
○ AlertaSobrecargaMesero
Requerimientos específicos no funcionales:
● Mapa completamente interactivo con colores diferenciados para estados
● Reasignación de mesas sin recargar pantalla.
● Cambios aplicados inmediatamente a:
○ Calendario de reservas
○ Lista operativa del día
○ Mapa visual

RF: Administración de reservas para eventos que requieren preparación
adicional.
Descripción: Administra reservas para eventos especiales, grupos grandes y ocasiones
particulares que requieren preparación adicional.
Entrada:
1. Solicitud del evento
● Tipo de evento
● Fecha propuesta
● Hora propuesta
● Numero de invitados
● Duración del evento
2. Requerimientos específicos del evento
● Decoración
● Montaje especial (mesas largas, forma "U", escenario, etc.)
● Equipo adicional (audio, proyector, iluminación)
● Requerimientos del cliente u organizador
3. Menú especial y servicios adicionales
● Selección de menú especial
● Opciones personalizadas
● Servicios adicionales (barra, meseros extra, coordinador de evento)
4. Información del organizador
● Nombre del responsable
● Teléfono
● Correo electrónico
● Empresa / Grupo (opcional)
Procedimiento:
a) Gestión inicial de la solicitud
1. El Administrador recibe la solicitud del evento.
2. Validar información básica (fecha, número de invitados, tipo de
evento).
3. Consultar disponibilidad de:
● Salón o área del restaurante
● Personal necesario
● Capacidad máxima
b) Cotización del evento
1. Elaborar cotización considerando:
● Menú especial
● Servicios adicionales
● Requerimientos específicos del cliente
2. Confirmar costos adicionales por montaje o equipo.
3. Enviar cotización formal al organizador.
Reglas:
● Eventos requieren 50% de anticipo para confirmación
● Mínimo 3 días de anticipación para eventos grandes
● Menú especial debe confirmarse 5 días antes
● Cancelaciones con menos de 48 horas generan cargo
Salida:
● Contratos de evento generados
● Confirmación con detalles específicos
● Lista de preparativos y asignaciones
● Facturación proforma para anticipos
Requerimientos específicos no funcionales:
● Documentación: Generación automática de contratos
● Seguimiento: Checklist de preparativos por evento


RF: Gestión de lista de espera digital para clientes sin reserva
Descripción:
Gestiona el registro y control de clientes que llegan sin reserva mediante una lista de espera
digital. Permite organizar turnos, estimar tiempos, notificar disponibilidad de mesas y
optimizar el flujo del restaurante sin necesidad de listas en papel.
Entrada:
● Nombre o identificación del cliente
● Número de comensales
● Tipo de mesa requerida (si aplica)
● Hora de llegada
● Estado actual de cada mesa del restaurante
● Tiempo estimado de espera calculado por el sistema
● Solicitudes de edición o cancelación en la lista
Procedimiento:
1. El cliente llega al restaurante y solicita mesa sin reserva.
2. El personal (o el cliente vía QR en la entrada) ingresa sus datos en la lista digital.
3. El sistema calcula el tiempo estimado de espera según:
○ Mesas disponibles
○ Ocupación actual
○ Promedio histórico de permanencia
4. El cliente es agregado a la lista de espera en orden cronológico.
5. El sistema actualiza continuamente el tiempo estimado conforme cambian los estados
de las mesas.
6. Cuando una mesa se libera:
○ El sistema identifica al siguiente cliente que cumple los requisitos.
○ Envía notificación al cliente (SMS, app, o pantalla en recepción).
7. El cliente confirma su disponibilidad.
8. El personal asigna la mesa y el sistema marca la entrada del cliente.
9. Si el cliente no responde o se retira, el personal puede marcarlo como “saltado” o
“cancelado”.
Reglas:
● Los clientes se atienden en orden de llegada, salvo mesas específicas (ej.: para grupos
grandes).
● Si un cliente no responde a la notificación en un tiempo determinado (2–5 min), se
pasa al siguiente en la lista.
● No se puede agregar a un cliente sin especificar el número de comensales.
● No se pueden asignar mesas con capacidad insuficiente.
● El sistema debe recalcular tiempos cada vez que una mesa cambia de estado.
● Un cliente solo puede aparecer una vez en la lista de espera.
● La lista debe mostrar el estado del cliente (En espera, Notificado, Atendido,
Cancelado).
Salida:
● Lista de espera ordenada y actualizada en tiempo real
● Tiempo estimado restante para cada cliente
● Estado actual de cada cliente en la lista
● Notificación de mesa disponible
● Confirmación o rechazo de cliente notificado
● Actualización del mapa de mesas al asignar una mesa
● Reporte de tiempos promedio de espera (opcional)

8.2. Modulo de Usuarios

RF: Administración de datos laborales del personal operativo
Descripción: Administra toda la información del personal operativo, incluyendo datos
laborales, horarios, permisos y desempeño.
Entrada:
● Datos laborales de empleados
○ EmpleadoID
○ Nombre
○ Apellido
○ DocumentoIdentidad
○ FechaNacimiento
○ FechaIngreso
○ Cargo
○ Área (cocina, salón, barra, limpieza, administración)
○ TipoContrato (tiempo completo, medio tiempo, eventual)
○ CorreoCorporativo
○ Teléfono
○ EstadoEmpleado (Activo / Inactivo / Suspendido)
● Horarios y turnos asignados
○ TurnoID
○ Fecha
○ HoraInicio
○ HoraFin
○ ZonaAsignada
○ EmpleadoID
○ TipoTurno
● Permisos del sistema por rol
○ RolID
○ NombreRol
○ Permisos[] (acceso a módulos específicos)

Procedimiento:
Gestión de empleados (altas, bajas, modificaciones)
1. Administrador ingresa al módulo “Gestión Laboral”.
2. Para alta:
○ Completa todos los datos laborales obligatorios.
○ Asigna cargo, rol del sistema y área laboral.
○ Registra fecha de inicio y tipo de contrato.
○ Guarda registro → se crea el EmpleadoID.
3. Para modificación:
○ Selecciona empleados existentes.
○ Edita datos laborales
○ Guarda cambios.
4. Para baja:
○ Cambia EstadoEmpleado a Inactivo.
○ Fecha de desvinculación queda registrada.
Asignación de roles y permisos
1. Administrador selecciona empleado.
2. Selecciona RolID.
3. El sistema asigna automáticamente los permisos establecidos para ese rol.

Configuración de horarios y turnos
1. Administrador abre calendario laboral.
2. Selecciona empleado y fecha.
3. Crea turno con:
○ HoraInicio
○ HoraFin
○ TipoTurno
4. Sistema valida:
○ No superposición de turnos del mismo empleado.
○ Cumplimiento de horas máximas según contrato.
5. Sistema guarda asignación.
6. Notificación automática enviada al empleado:
○ app interna
Registro de incidencias y observaciones
1. Administrador registra:
a. Incidencias operativas
b. Observaciones de rendimiento
2. Cada incidencia se asocia a:
a. EmpleadoID
b. Fecha y hora
c. Tipo de incidencia
d. Descripción
Generación de reportes
Sistema genera reportes bajo demanda o periódicos:
● Nómina:
○ Salario base
○ Horas extra
○ Bonos
○ Deducciones
● Asistencia:
○ Turnos completados
○ Ausencias
○ Llegadas tarde
● Rendimiento:
○ Tendencias trimestrales
○ Incidencias
Los reportes pueden exportarse en PDF o Excel.
Reglas:
● Todo empleado activo debe tener:
● Documento de identidad
● Cargo asignado
● Área
● Tipo de contrato
● Salario base
● Rol del sistema
● Roles definen accesos a módulos como:
● Permisos escalonados por nivel de acceso
● Cada nivel jerárquico tiene límites preestablecidos
● Cambios de turno requieren notificación obligatoria:
Salida:
● Directorio completo de empleados
● Pantalla detallada con permisos por rol
● Calendario de turnos
○ Vista semanal
● Reportes de información laboral
○ Nómina detallada
○ Incidencias registradas
Requerimientos específicos no funcionales:
● Accesos sensibles requieren doble autenticación.
● Solo los administradores tienen acceso a nómina y salarios.
● Sincronización automática con:
○ Sistema de control de asistencia biométrica
○ Sistema de nómina externo
RF: Definición y gestión de niveles de acceso al sistema para cada tipo de usuario
Descripción: Define y gestiona los niveles de acceso al sistema para cada tipo de usuario,
controlando qué funcionalidades puede utilizar cada rol.
Entrada:
● Lista inicial de roles del sistema:
● Administrador
● Mesero
● Cajero
● Hostess
● Cocinero
● Jefe de Cocina
● Gerente
● Repartidor
● Cliente (si interviene en la plataforma)
● Permisos específicos por módulo
○ Permisos específicos por módulo
Cada permiso corresponde a una acción del sistema:
● ModuloID
● NombreModulo (reservas, mesas, inventario, pedidos, nómina,
reportes, etc.)
● PermisoID
● AccionesPermitidas[]
● Usuarios a asignar
○ UsuarioID
○ RolActual
○ Estado (activo / inactivo)
Procedimiento:
Acceder a gestión de roles
1. Administrador abre módulo “Control de Accesos”.
2. Sistema carga la matriz de permisos actual
Asignar roles a usuarios
3. Administrador selecciona un usuario.
4. Visualiza su RolActual y permisos derivados.
5. Selecciona nuevo rol en caso necesario.
6. Sistema actualiza:
● Usuario.RolID = NuevoRolID
7. Se registran los cambios en el log de auditoría.
Modificación de permisos por rol
8. Administrador selecciona un rol de la matriz.
9. Visualiza permisos asignados al rol:
● Acciones permitidas por módulo
10. Admin agrega o elimina permisos específicos
11. El sistema valida:
● Que los permisos no excedan funciones del puesto.
● Que el administrador que modifica tenga nivel de acceso suficiente.
12. Se guarda la modificación.
Creación de roles personalizados
1. Administrador selecciona “Crear Rol”.
2. Ingresa
● Nombre del rol
● Descripción
● Permisos iniciales
3. Sistema crea:
● NuevoRolID
4. Rol aparece en la matriz para futuras asignaciones
Auditoría de accesos
1. Administrador visualiza historial:
● Fecha / hora de cambios
● Usuario que realizó el cambio
● Permisos alterados
● Usuarios afectados
1. Auditoría se filtra por:
● Usuario
● Rol
● Módulo
● Fecha
Reglas:
● Existencia obligatoria de un administrador
● Límites de permisos según responsabilidades
Los permisos asignables están restringidos según rol:
○ Mesero no puede acceder a nómina ni reportes financieros.
○ Cajero no puede eliminar pedidos confirmados sin autorización.
○ Hostess no puede modificar inventario.
○ Cliente no accede a módulo administrativo.
● Toda modificación en permisos requiere:
○ Confirmación manual del administrador
○ Registro en log de auditoría
● Si un rol es eliminado:
○ Sistema identifica usuarios asociados
○ Debe elegir nuevo rol para cada usuario antes de continuar.
○ Eliminación solo se ejecuta cuando todos los usuarios han sido reasignados
● Cada vez que un usuario ejecuta una acción:
○ El sistema valida permisos asignados al rol
○ Si no coincide, se bloquea la acción y se genera alerta:
■ PermisoDenegado
Salida:

● Matriz de permisos
○ Vista completa de roles vs. módulos
○ Botones de edición por rol
○ Indicadores visuales por tipo de permiso
● Confirmación de asignaciones
○ Mensaje en pantalla confirmando rol asignado al usuario
○ Registro agregado al historial del usuario
● Alertas de conflicto de permisos
○ Accesos no autorizados
○ Permisos duplicados
Requerimientos específicos no funcionales:
● Validación de permisos en cada acción del sistema.
● Roles y permisos no se almacenan en cliente.
● Log de cambios en roles
○ Quién modificó
○ Qué campo cambió
○ Antes / después
○ Fecha exacta

RF: Gestión de direcciones de entrega y métodos de pago guardados por el cliente
Descripción:
Gestiona el registro, actualización y administración de las direcciones de entrega y los
métodos de pago que el cliente decide guardar para agilizar futuros pedidos. Facilita compras
rápidas, reduce errores y mejora la experiencia en servicios de delivery o pick-up.
Entrada:
● ID del cliente autenticado
● Nuevas direcciones de entrega
● Métodos de pago (tarjetas, wallets, etc.)
● Datos de tarjetas (tokenizados)
● Indicaciones especiales (referencias, entre calles, horarios preferidos)
● Solicitudes de edición o eliminación
Procedimiento:
1. El cliente accede a su perfil o sección “Mis direcciones y pagos”.
2. Selecciona agregar, editar o eliminar una dirección guardada.
3. El sistema valida que la dirección sea completa (calle, colonia, ciudad, referencias).
4. Si es ubicación vía mapa, se registra geolocalización.
5. El cliente puede agregar un método de pago:
○ El sistema envía la tarjeta a un procesador que la tokeniza (no se almacena el
número real).
6. El cliente puede marcar una dirección o método de pago como predeterminado.
7. En cada pedido futuro, el sistema ofrece automáticamente las direcciones y métodos
guardados.
8. El cliente puede gestionar su lista en cualquier momento.
Reglas:
● Las direcciones deben incluir datos mínimos obligatorios (calle, número, ciudad).
● Los métodos de pago no pueden almacenarse en texto plano; deben ser tokenizados.
● Máximo de 10 direcciones activas por cliente.
● Máximo de 5 métodos de pago guardados.
● Solo un método de pago y una dirección pueden estar marcados como
predeterminados a la vez.
● No puede eliminarse un método de pago que esté vinculado a un pedido en proceso.
● El cliente debe estar autenticado para visualizar o modificar esta información.
Salida:
● Lista actualizada de direcciones de entrega
● Lista de métodos de pago guardados
● Confirmación de dirección o tarjeta agregada
● Confirmación de edición o eliminación
● Advertencias si la información es inválida o incompleta
● Notificación de método o dirección predeterminada actualizada

8.2. -Modulo de Cocina y producción
RF: Monitoreo en Tiempo Real de pedidos en cocina y bar
Descripción: Permite al personal de cocina y bar visualizar en tiempo real todos los pedidos
activos que deben preparar, mostrando su estado, prioridad y el tiempo transcurrido, con el
fin de optimizar la producción y evitar retrasos.
Entrada:
● Pedidos activos asignados a cocina y bar
○ ID del pedido
○ Área asignada (cocina/bar)
○ Hora de generación del pedido
○ Lista de productos
○ Estado del pedido y estado por producto
● Estado permitidos del pedido:
○ pendiente
○ en preparación
○ listo
Datos a calcularse:
TiempoTranscurridoPedido
● Datos utilizados
○ HoraActualSistema
○ HoraSolicitudPedido
● Operación:
tiempoTranscurrido = HoraActualSistema – HoraSolicitudPedido
Procedimiento:
1. El personal de cocina o bar accede al dashboard de pedidos desde su módulo
correspondiente.
2. El sistema obtiene la lista de pedidos activos asignados al área del usuario (cocina o
bar).
3. Pedidos se organizan por:
● Hora de solicitud
● Área asignada
4. Para cada pedido el sistema muestra:
● ID del pedido
● Hora de solicitud
● Tiempo transcurrido desde la solicitud
● Productos incluidos
● Estado del pedido y estado por producto
5. El personal puede realizar acciones sobre los pedidos:
● Cambiar el estado (pendiente → en preparación → listo)
● Marca productos como “listos”
● Indica retrasos o incidencias si aplica
6. Cada 30 segundos, el sistema refresca la vista automáticamente:
● Actualiza estados
● Muestra nuevas alertas
7. Los pedidos permanecen visibles hasta que sean marcados como “listos para entrega”.
Reglas:
● Todos los pedidos activos deben mostrarse obligatoriamente hasta ser marcados como
“listos para entrega”.
● Los pedidos deben ordenarse por hora de solicitud (del más antiguo al más reciente).
● Solo cocina puede modificar estados de productos o pedidos de comida.
Solo bar puede modificar estados de productos o pedidos de bebidas.
● Un pedido no puede marcarse como “listo” si algún producto permanece “pendiente”
o “en preparación”.
Salida:
● Lista en tiempo real de pedidos activos por área.
● Información visible por pedido:
○ ID
○ Productos
○ Estado (pendiente, en preparación, listo)
○ Tiempo transcurrido
○ Indicadores visuales de estado
● Métricas operativas por turno:
○ Tiempo promedio de preparación
○ Volumen total de pedidos gestionados por cocina y bar
● Confirmaciones y mensajes del sistema:
○ “Estado actualizado correctamente”
Requerimientos específicos no funcionales:
● La vista debe actualizarse automáticamente cada 30 segundos sin recargar la página.
● Los indicadores visuales deben usar códigos de color:
○ Amarillo: pendiente
○ Gris: en preparación
○ Verde: completado
● La actualización debe ejecutarse con consumo mínimo de recursos sin interrumpir las
acciones del usuario.
● El sistema no debe bloquear o interferir con las acciones del personal durante la
actualización automática.

RF: Gestión de rutas de impresión (Bebidas se imprimen en barra, Alimentos en
cocina)
Descripción: El sistema debe determinar automáticamente la ruta de visualización correcta
para cada pedido según el tipo de producto solicitado. Los productos clasificados como
bebidas deben mostrarse únicamente en la interfaz destinada al personal de bar, mientras que
los productos clasificados como alimentos deben visualizarse únicamente en la interfaz del
personal de cocina.
Entrada:
● Pedido generado por el sistema
○ ID del pedido
○ Lista de productos
○ Cantidad por producto
○ Hora de generación del pedido
● Clasificación de productos
○ Tipo de producto (bebida o alimento)
○ Categoría del producto
● Configuración de rutas de visualización
○ Interfaz de cocina
○ Interfaz de bar
Procedimiento:
8. El sistema recibe un pedido nuevo.
9. Para cada producto, consulta su clasificación (bebida o alimento).
10. El sistema agrupa los productos del pedido según su tipo:
● Grupo Cocina
● Grupo Bar
 11. El sistema identifica qué interfaces deben mostrar el pedido:
● Si contiene alimentos → enviar a interfaz de cocina
● Si contiene bebidas → enviar a interfaz de bar
11. El sistema envía los productos a su interfaz correspondiente.
Reglas:
● Las bebidas solo pueden mostrarse en la interfaz de bar.
● Los alimentos solo pueden mostrarse en la interfaz de cocina.
● La clasificación de productos debe provenir únicamente de la configuración oficial
del sistema.
Salida:
● Visualización del pedido en interfaz de bar (si contiene bebidas).
● Visualización del pedido en interfaz de cocina (si contiene alimentos).
● Mensajes del sistema:
○ “Pedido asignado a barra.”
○ “Pedido asignado a cocina.”
Requerimientos específicos no funcionales:
● La actualización de las interfaces debe ser automática, sin necesidad de recarga
manual.
● Las interfaces deben ser independientes

RF: Capacidad de marcar productos como agotados para bloquear su venta
Descripción: El sistema debe permitir al personal autorizado marcar productos como
“agotados” para evitar que puedan ser seleccionados, solicitados o vendidos mientras no haya
inventario disponible.
Entrada:
● Información del producto
○ ID del producto
○ Nombre del producto
○ Categoría (alimento / bebida / otro)
○ Estado actual (agotado)
● Acción del usuario
○ Solicitud de marcar como “agotado”
Procedimiento:
● El usuario autorizado accede al módulo de administración o gestión de inventario.
● El sistema muestra la lista completa de productos con su estado actual.
● El usuario selecciona el producto a modificar.
● El usuario elige la acción Marcar como “agotado”
● El sistema solicita confirmación de la acción.
● El sistema ejecuta el cambio de estado del producto.
● El sistema actualiza inmediatamente todas las interfaces donde el producto puede
aparecer:
○ Menú digital
○ Interfaces de toma de pedidos
○ POS o terminal de venta
● Si el producto queda marcado como “agotado”:
○ Se muestra indicador visual de indisponibilidad (si aplica)
● Si el producto vuelve a “disponible” Se habilita nuevamente su selección
Reglas:
● Solo usuarios con permisos configurados pueden modificar el estado de un producto.
● Un producto marcado como “agotado” no puede ser agregado a ningún pedido.
● Un producto agotado debe ocultarse o bloquearse en todas las interfaces de venta, sin
excepción.
● Los cambios de estado deben reflejarse en tiempo real para todos los usuarios activos.
● Un producto no puede tener simultáneamente el estado “agotado” y “disponible”.
Salida:
● Producto actualizado con estado “agotado”
● Actualización inmediata de interfaces
○ Producto bloqueado / oculto
Requerimientos específicos no funcionales:
● La acción debe propagarse en tiempo real sin necesidad de recargar pantallas.
● El sistema debe garantizar consistencia de disponibilidad incluso ante alto volumen de
transacciones.
● El sistema debe evitar condiciones de carrera: dos usuarios no pueden sobrescribir el
estado simultáneamente sin validación.

8.2. Modulo de Atención al cliente

RF: Creación, envío y análisis de encuestas de satisfacción
Descripción: Gestiona la creación, envío y análisis de encuestas de satisfacción para medir y
mejorar la experiencia del cliente.
Entrada:
● Plantillas de encuestas
● Listas de clientes a encuestar
● Respuestas recibidas
● Métricas de satisfacción
Procedimiento:
1. Administrador diseña encuestas personalizadas
2. Programa envío automático a clientes
3. Recopila y analiza respuestas
4. Identifica áreas de oportunidad
5. Genera reportes de satisfacción por período
6. Comparte resultados con el equipo
Reglas:
● Encuestas se envían máximo 24 horas después de la visita
● Tasa de respuesta mínima del 15% para validez estadística
● Preguntas escala 1-5 para medición cuantitativa
● Espacio para comentarios cualitativos obligatorio
Salida:
● Reportes de satisfacción del cliente
● Gráficos de tendencias de satisfacción
● Alertas de caídas significativas en puntuaciones
● Recomendaciones de mejora basadas en feedback
Requerimientos específicos no funcionales:
● Análisis: Procesamiento automático de respuestas
● Visualización: Dashboards intuitivos de métricas
RF: Historial de pedidos y facturas del cliente
Descripción:
Gestiona la visualización completa de los pedidos realizados por el cliente y el acceso a sus
facturas, permitiendo consultar detalles, descargar documentos fiscales y generar facturación
cuando sea necesario.
Entrada:
● ID del cliente autenticado
● Lista de pedidos históricos
● Datos fiscales del cliente (RFC, razón social, uso de CFDI)
● Facturas emitidas (PDF, XML)
● Filtros de búsqueda (fecha, monto, estado)
Procedimiento:
1. El cliente inicia sesión en su cuenta.
2. Accede al módulo “Historial de pedidos”.
3. El sistema consulta todos los pedidos asociados al cliente.
4. Se muestran los pedidos ordenados por fecha o filtros aplicados.
5. El cliente selecciona un pedido para ver el detalle del consumo.
6. Si la factura ya fue generada: puede descargarla en PDF/XML.
7. Si no existe factura:
○ El cliente ingresa sus datos fiscales.
○ El sistema valida RFC y datos completos.
○ Genera y timbra la factura (CFDI).
○ Se almacena y se envía automáticamente por correo.
8. El cliente puede solicitar reenvío de la factura o ver facturas anteriores.

Reglas:
● Solo se muestran pedidos asociados al cliente autenticado.
● No se puede facturar un pedido cancelado o pendiente de pago.
● Solo una factura por pedido (sin duplicados).
● Los datos fiscales deben cumplir formato oficial del SAT.
● Las facturas generadas no pueden modificarse; solo reenviarse.
● Los archivos PDF/XML deben permanecer almacenados legalmente por el periodo
correspondiente.
● Si el pedido está marcado como “facturado”, no puede generarse una nueva factura.
Salida:
● Listado completo de pedidos históricos
● Detalle de consumo por pedido
● Facturas disponibles en PDF y XML
● Confirmación de factura generada
● Mensajes de error en caso de datos fiscales inválidos
● Notificación de reenvío exitoso
● Estado actualizado de cada pedido (facturado / no facturado)

8.2. - Módulo de Personal Operativo

RF: Creación, asignación y modificación de horarios del personal operativo
Descripción: Permite al administrador crear, asignar y modificar los horarios y turnos del
personal operativo, optimizando la cobertura según necesidades del restaurante.
Entrada:
● Disponibilidad del personal
● Requerimientos por turno (meseros, cocina, bar)
● Horarios de operación del restaurante
● Días festivos y eventos especiales
Procedimiento:
1. Administrador accede al módulo de horarios
2. Crea calendario mensual de turnos
3. Asigna personal según habilidades y disponibilidad
4. Ajusta cobertura para horarios pico
5. Publica horarios con 7 días de anticipación
6. Gestiona cambios y suplencias
Reglas:
● Turnos publicados con mínimo 7 días de anticipación
● Máximo 8 horas continuas por turno
● Descansos obligatorios cada 4 horas
● Personal capacitado para cada área específica
Salida:
● Calendario de turnos mensual
● Notificaciones al personal
● Reporte de cobertura por turno
● Alertas de conflictos de horario
Requerimientos específicos no funcionales:
● Flexibilidad: Modificación fácil de turnos
● Notificaciones: Alertas automáticas al personal
RF: Registro y monitorea de asistencia del personal operativo
Descripción: Registra y monitorea la asistencia, puntualidad y horas trabajadas del personal
operativo para control de nómina y desempeño.
Entrada:
● Registro de entrada/salida
● Justificantes de ausencia
● Horas extras solicitadas
● Permisos especiales
Procedimiento:
1. Sistema registra automáticamente entradas y salidas
2. Administrador verifica registros diarios
3. Aprueba o rechaza justificantes de ausencia
4. Autoriza horas extras según necesidad
5. Genera reportes de asistencia por período
6. Identifica patrones de ausentismo
Reglas:
● Tolerancia de 5 minutos para entrada
● Ausencias no justificadas afectan evaluación
● Horas extras requieren autorización previa
● 3 retardos consecutivos generan amonestación
Salida:
● Reporte de asistencia semanal/mensual
● Control de horas trabajadas
● Alertas de incidencias
● Datos para cálculo de nómina
Requerimientos específicos no funcionales:
● Precisión: Registro exacto de horarios
● Integración: Conexión con sistema de nómina
RF: Visualización de métricas de productividad, calidad de servicio y
cumplimiento de estándares del personal operativo
Descripción: Gestiona el sistema de evaluación del personal operativo, midiendo métricas de
productividad, calidad de servicio y cumplimiento de estándares.
Entrada:
● Métricas de ventas por empleado
● Comentarios de clientes
● Observaciones de supervisores
● Cumplimiento de procedimientos
Procedimiento:
1. Administrador define criterios de evaluación
2. Recopila datos de desempeño mensual
3. Realiza evaluaciones periódicas
4. Identifica áreas de mejora por empleado
5. Establece planes de desarrollo
6. Comunica resultados al personal
Reglas:
● Evaluaciones trimestrales obligatorias
● Métricas cuantitativas y cualitativas balanceadas
● Retroalimentación constructiva y documentada
● Oportunidad de réplica del evaluado
Salida:
● Reportes individuales de desempeño
● Planes de desarrollo personalizado
● Identificación de talento
● Alertas de bajo desempeño
Requerimientos específicos no funcionales:
● Objetividad: Métricas medibles y consistentes
● Confidencialidad: Protección de evaluaciones individuales
RF: Envío automático de confirmaciones y recordatorios de reserva
Descripción:
Gestiona el envío automático de mensajes a los clientes relacionados con sus reservas.
Incluye confirmaciones inmediatas al crear una reserva, notificaciones por cambios y
recordatorios enviados antes de la fecha y hora programada. Su objetivo es reducir ausencias,
mejorar la puntualidad y mantener informado al cliente sin intervención del personal.
Entrada:
● Datos de la reserva (fecha, hora, número de personas, cliente)
● Canal preferido del cliente (correo, SMS, app)
● Plantillas de mensajes de confirmación y recordatorio
● Configuración de tiempos de envío (24h, 2h, etc.)
● Eventos del sistema (nueva reserva, modificación, cancelación)
Procedimiento:
1. El cliente crea una reserva desde la app, web o con el personal.
2. El sistema genera automáticamente un mensaje de confirmación con:
○ Datos de la reserva
○ Ubicación
○ Indicaciones especiales
3. Si la reserva es modificada, el sistema envía una actualización con los nuevos datos.
4. Antes del horario programado, el sistema programa y envía un recordatorio
automático usando los intervalos definidos (ej.: 24h antes y 1h antes).
5. Si un mensaje falla, el sistema intenta reenviar o marca el error para revisión.
6. El cliente puede confirmar asistencia desde el enlace del mensaje (opcional).
7. El sistema registra aperturas, respuestas o rebotes de notificación.
Reglas:
● La confirmación debe enviarse inmediatamente después de crear la reserva (máximo 1
minuto).
● Los recordatorios deben enviarse dentro de las ventanas definidas (24h, 12h o 2h).
● Si la reserva se crea con poca anticipación (ej.: 30 min antes), solo se envía
confirmación, no recordatorios.
● El cliente debe tener un canal válido (email o teléfono) para recibir notificaciones.
● No se deben enviar recordatorios a reservas canceladas.
● Las plantillas deben permitir personalización con datos del cliente.
● El sistema debe evitar envíos duplicados.
Salida:
● Mensajes enviados correctamente (confirmaciones y recordatorios)
● Registro de estado del envío (exitoso, fallido, reenviado)
● Alertas de fallos de notificación
● Confirmación de asistencia del cliente (si aplica)
● Métricas de notificaciones abiertas o ignoradas

RF: Confirmación de pedidos en mesa con selección de modificadores
Descripción:
Gestiona la toma y confirmación de pedidos directamente en la mesa, permitiendo al mesero
o al cliente (vía QR) seleccionar modificadores y personalizaciones antes de enviar el pedido
a cocina. Incluye opciones como términos de cocción, agregar o quitar ingredientes, elegir
guarniciones y añadir notas especiales.
Entrada:
● Número o identificador de mesa
● Productos seleccionados por el cliente
● Modificadores disponibles para cada producto
● Notas personalizadas (ej.: “sin cebolla”, “extra picante”)
● Cantidades
● Restricciones de menú (productos sin inventario, combos, etc.)
● Solicitudes de edición o eliminación del pedido antes de enviarlo
Procedimiento:
1. El mesero o cliente accede al menú desde la mesa.
2. Selecciona un producto.
3. El sistema muestra los modificadores aplicables:
○ Ingredientes opcionales
○ Términos de cocción
○ Extras con costo adicional
○ Sustituciones
4. El cliente/mesero elige los modificadores deseados.
5. El sistema actualiza automáticamente el subtotal según los modificadores
seleccionados.
6. El usuario confirma el pedido y lo añade al carrito o lista final.
7. Antes de enviar el pedido, puede revisarlo, editarlo o eliminarlo.
8. Se confirma el pedido final y el sistema lo envía automáticamente a:
○ Cocina (comandas)
○ Bar (bebidas)
9. El sistema marca el pedido como “En preparación”.
Reglas:
● Los modificadores dependen del producto (no todos aplican a todos los platillos).
● Si un modificador tiene costo adicional, debe sumarse automáticamente al total.
● Si un ingrediente está agotado, debe mostrarse como “no disponible”.
● El pedido no puede enviarse si no contiene productos válidos.
● Las notas deben ser breves y relacionadas con el consumo (no se aceptan mensajes
irrelevantes).
● Los términos de cocción aplican solo para cortes de carne o productos configurados.
● No se pueden combinar modificadores incompatibles (ej.: “muy cocido” + “término
rojo”).
Salida:
● Pedido final confirmado
● Lista de productos con sus modificadores aplicados
● Subtotal y total calculado
● Comanda enviada a cocina/bar
● Estado actualizado del pedido (En preparación / Enviado)
● Mensajes de error si un modificador no es válido o está agotado

RF: Visualización del mapa de mesas en tiempo real con estados (Libre, Ocupada,
Cuenta solicitada, Sucia)
Descripción:
Gestiona la visualización interactiva del plano del restaurante mostrando cada mesa con su estado
actualizado en tiempo real. Permite al personal ver disponibilidad, rotación, mesas en proceso de pago
y mesas que requieren limpieza, optimizando la asignación y operación general.
Entrada:
● Mapa o layout del restaurante (disposición de mesas)
● Lista de mesas y su estado actual
● Eventos generados por el sistema:
○ Mesa asignada
Pedido en curso
○ Cuenta solicitada
○ Mesa liberada
○ Mesa marcada como sucia o limpia
● Datos del personal con permisos para modificar estados
Información de grupos de clientes esperando (opcional)
Procedimiento:
1. El sistema carga el mapa del restaurante y las mesas configuradas.
2. Se muestran todas las mesas con su estado actual mediante colores o íconos:
○ Libre: disponible para asignar.
○ Ocupada: con clientes atendidos.
○ Cuenta solicitada: el cliente pidió la cuenta.
○ Sucia: requiere limpieza antes de reasignar.
3. Cuando ocurre un evento (pedido abierto, cambio de estado, liberación), el mapa se actualiza
automáticamente.
4. El personal puede seleccionar una mesa para:
○ Ver detalles del pedido
○ Cambiar estado manualmente (ej.: marcar como sucia o limpia)
○ Asignar mesa a un nuevo cliente
5. El sistema sincroniza cambios en tiempo real con:
○ Comandas
○ Meseros
○ Hostess
○ Sistema de reservas o lista de espera
6. Si una mesa pasa a “Cuenta solicitada”, se notifica al mesero o cajero correspondiente.
7. Si se marca como “Sucia”, se notifica al personal de limpieza.
8. Cuando se limpia la mesa, se actualiza a “Libre” automáticamente o manualmente.
Reglas:
● No se puede asignar una mesa en estado Ocupada o Sucia.
● “Cuenta solicitada” solo puede activarse si hay un pedido activo.
● Solo personal autorizado puede modificar estados manualmente.
● Los cambios deben reflejarse en tiempo real para todos los dispositivos conectados.
● La mesa solo puede pasar de “Ocupada” a “Libre” una vez que el pedido esté cerrado.
● El estado “Sucia” es obligatorio tras liberar una mesa, antes de poder asignarla nuevamente.
● El plano del restaurante debe coincidir con la configuración física instalada.
Salida:
● Mapa actualizado del restaurante con estados visibles
● Notificaciones al personal (cuenta solicitada, mesa liberada, mesa sucia)
● Información detallada de cada mesa (mesero asignado, pedido activo, tiempo ocupada)
● Indicadores de disponibilidad para hostess o asignación automática
● Registro histórico de cambios de estado (opcional)

RF: División de cuentas por productos o por montos entre comensales (Split Check)
Descripción:
Permite dividir la cuenta total de una mesa entre varios comensales, ya sea asignando productos
específicos a cada uno o repartiendo el monto total de forma equitativa o personalizada. Facilita el
proceso de pago individual, evita errores manuales y mejora la experiencia del cliente cuando cada
persona desea pagar por separado.
Entrada:
● Cuenta completa de la mesa
● Lista de productos consumidos (con precios e impuestos)
● Número de comensales que desean dividir la cuenta
● Método de división seleccionado:
○ Por productos
○ Por monto total
○ Por porcentajes personalizados
● Propinas sugeridas o personalizadas
● Solicitudes de edición o reasignación de productos
Procedimiento:
1. El mesero o cliente (vía QR) abre la cuenta de la mesa.
2. Selecciona el modo de división:
○ Por productos: cada comensal elige los artículos que consumió.
○ Por monto: el sistema divide el total entre los comensales.
○ Por porcentaje: cada comensal paga un porcentaje definido.
3. El sistema recalcula automáticamente:
○ Subtotales
○ Impuestos
○ Propinas proporcionales
4. El usuario revisa la división final y puede:
○ Mover productos entre comensales
○ Ajustar porcentajes
○ Aplicar propina diferente por cada persona
5. Una vez confirmada la división, se generan cuentas independientes.
6. El sistema envía las cuentas al módulo de cobro o terminal correspondiente.
7. Se marca cada cuenta como pagada conforme se procesa el pago.
8. Una vez cobradas todas las divisiones, la mesa cambia su estado a “Cuenta pagada” o “Lista
para limpiar”.
Reglas:
● No se puede dividir una cuenta que aún tenga productos en preparación.
● Cada producto solo puede asignarse a un comensal (evitar duplicación).
● Si se divide por monto, redondeos deben ajustarse automáticamente para que la suma final
coincida con el total.
● La propina debe redistribuirse de forma proporcional al subtotal de cada comensal, salvo que
se defina manualmente.
El sistema no permite finalizar división con asignaciones incompletas.
● No se puede dividir una cuenta ya liquidada.
● Cada cuenta generada debe tener su propio folio e historial.
Salida:
● Cuentas individuales separadas con sus subtotales, impuestos y propinas
● Vista clara de qué productos corresponde a cada persona
● Confirmación de división exitosa
● Folios independientes por comensal para pago
● Reporte de pagos completados por persona
● Actualización del estado de la mesa tras el pago total

8.2. - Módulo de Administración
RF: Gestión de Inventario (altas, bajas, modificaciones) de Productos
Descripción: Permite al administrador gestionar todo el inventario de productos, incluyendo:
● altas
● bajas
● modificaciones
● control de existencias en tiempo real.
Entrada:
● Datos del producto
○ Nombre
○ Descripción
○ Código interno o SKU
○ Unidad de medida
○ Categoría y subcategoría
○ Precio de costo
○ Precio de venta
● Inventario actual
○ Existencias disponibles
○ Stock mínimo definido
○ Historial de movimientos
● Clasificaciones adicionales
○ Temporada
○ Etiquetas o atributos
○ Estado del producto (activo, descontinuado)
● Información operativa
○ Proveedor (si aplica)
○ Fecha de recepción de mercancía
○ Cantidades recibidas o ajustadas
Procedimientos:
1. El administrador ingresa al módulo de inventario mediante permisos restringidos
Alta de productos
2. Registrar datos generales del producto.
3. Asignar categoría y precio.
4. Establecer stock inicial.
5. Guardar en el catálogo.
Modificaciones
6. Actualizar nombre, descripción o clasificación.
7. Ajustar precio de costo o venta
8. Cambiar estado del producto (activo/descontinuado).
Bajas o ajustes de inventario
9. Registrar salidas por desperdicio, daño, auditoria u otros motivos
10. Registrar entradas por compra, devolución o corrección de conteo.
11. Guardar cantidad ajustada.
Gestión de existencias
12. Registrar nuevas recepciones de mercancía.
13. Incrementar existencias en función de compra o producción.
14. Generar movimientos con folio y responsable.
Configuración de alertas
15. Definir stock mínimo por producto.
16. Activar alertas automáticas cuando las existencias lleguen al nivel mínimo.
Organización del catálogo
17. Clasificar productos por categoría, temporada o disponibilidad.
18. Generar vistas filtradas para análisis.
Reglas:
● El precio de venta debe ser mayor al precio de costo.
● Los productos descontinuados se archivan pero no se eliminan del sistema.
● Cada producto debe tener un stock mínimo definido.
● Los cambios en inventario actualizan automáticamente el valor total del inventario.
Salida:
● Catálogo actualizado de productos con datos vigentes, clasificación y disponibilidad.
● Alertas automáticas de stock bajo
● Notificaciones en el panel del sistema.
● Listas organizadas por categoría o temporada
● Historial actualizado de precios con fecha, valor anterior y justificación.
Requerimientos específicos no funcionales:
● Todos los cambios deben reflejarse en tiempo real en:
● Punto de venta
● Módulo de compras
● Módulo de ventas y pedidos
● Panel de reportes
RF: Actualización automática de Inventario de Productos
Descripción: Gestiona el inventario mediante un sistema de actualización automática que
refleja las existencias en tiempo real en todos los módulos operativos. El inventario se ajusta
automáticamente cuando ocurren ventas, cancelaciones, devoluciones o recepciones de
mercancía.
Entrada:
● Datos del producto
○ Nombre
○ Descripción
○ Código interno o SKU
○ Unidad de medida
○ Categoría y subcategoría
○ Precio de costo
○ Precio de venta
● Niveles de inventario actual
● Precios de costo y venta
● Categorías y clasificaciones
● Inventario actual
○ Existencias disponibles
○ Stock mínimo definido
○ Historial de movimientos
● Precios de costo y venta.
● Clasificaciones adicionales
○ Temporada
○ Etiquetas o atributos
○ Estado del producto (activo, descontinuado)
● Movimientos generados automáticamente por:
○ Ventas en punto de venta.
○ Pedidos a domicilio.
○ Consumo en cocina/bar.
○ Ajustes manuales autorizados.
○ Recepción de mercancía.
Procedimientos:
Administración del catálogo
1. Acceso del administrador al módulo de inventario.
2. Registro de nuevos productos con sus datos completos.
3. Actualización de nombres, descripciones, categorías y precios.

Actualización automática de existencias
1. Disminución automática por cada venta o consumo generado desde POS, pedidos,
cocina o bar.
2. Aumento automático por recepción de mercancía o devoluciones.
3. Registro inmediato del movimiento en historial.
Ajustes manuales supervisados
1. Correcciones de inventario por auditoría, merma o daño.
Gestión de alertas
1. Configuración de stock mínimo por producto.
2. Generación automática de alertas cuando el nivel llega al mínimo.
Reglas:
● El precio de venta debe ser mayor al precio de costo.
● Productos descontinuados se archivan sin ser eliminados.
● Productos descontinuados se archivan pero no eliminan
● Todo producto debe tener un stock mínimo definido.
● El inventario actualizado debe coincidir con los movimientos registrados en ventas,
devoluciones y ajustes.
Salida:
● Catálogo actualizado de productos
● Existencias reflejadas en tiempo real.
● Alertas automáticas por stock bajo.
● Listados organizados por categoría, temporada o disponibilidad.
Requerimientos específicos no funcionales:
● Todos los cambios de inventario deben reflejarse instantáneamente en:
● Punto de venta
● Cocina y bar
● Módulo de compras
● Pedidos a domicilio
● Reportes y dashboard
● Control de acceso estricto para:
● Modificaciones de precio
● Ajustes de inventario
● Altas y bajas de productos
● Registro obligatorio de usuario, fecha, hora y acción realizada.

RF: Gestiona la estructura de precios, descuentos y promociones del menú
Descripción: Gestiona la estructura de precios, descuentos y promociones del menú, con
capacidad de aplicar cambios masivos y programar ofertas temporales.
Entrada:
● ProductoID
● PrecioBase (precio base definido por producto)
● PrecioCostoUnitario
● PorcentajeIVA
● ListaPrecios
● PromocionID
○ TipoPromocion
○ PorcentajeDescuento
○ FechaInicio, FechaFin
○ HorarioInicio, HorarioFin
○ CondicionAplicacion
○ LimiteUsoPorCliente
● ReglaRedondeo (decimales a mostrar y a cobrar)
● Condiciones de aplicación
Datos calculados:
● PrecioAplicable
Datos utilizados:
● PrecioAplicable
● PrecioPromocion
● PrecioProgramado
● PrecioCanal
● PrecioBase
Operación:
● Si PromocionEspecialVálida:
PrecioAplicable = PrecioPromocion (si promocion fija)
 o
PrecioBase (si promocion es % sobre base)
● Si PrecioProgramadoActivo:
PrecioAplicable = PrecioProgramado
● Si ListaPreciosPorCanal (ej. canal: Exclusivo en línea):
PrecioAplicable = PrecioCanal
● Sino:
PrecioAplicable = PrecioBase
 Descuento
Datos utilizados:
● PrecioAplicable
Operación:
Si D.tipo = "porcentaje":
 MontoDescuento = PrecioAplicable * (D.porcentaje / 100)
 PrecioConDescuentosAplicados= PrecioAplicable - MontoDescuento
Si D.tipo = "precio especial":
 PrecioConDescuentosAplicados= D.precioEspecial
Actualizar PrecioAplicable = PrecioConDescuentosAplicados
● ValorIVA
Datos utilizados:
● PrecioConDescuentosAplicados
● PorcentajeIVA
Operación:
ValorIVA = PrecioConDescuentosAplicados * (PorcentajeIVA/100)
● PrecioUnitarioFinal
Datos utilizados:
● ValorIVA
● PrecioConDescuentosAplicados
Operación:
● PrecioUnitarioFinal = PrecioConDescuentosAplicados + ValorIVA
● SubtotalPorNCantidadDelMismoProducto
Datos utilizados:
● Cantidad
● PrecioUnitarioFinal
Operación:
● SubtotalPorNCantidadDelMismoProducto = PrecioUnitarioFinal * Cantidad
● TotalFinalDelPedido
Datos utilizados:
● Cantidad
● PrecioUnitarioFinal
Operación:
● Σ(SubtotalPorNCantidadDelMismoProducto)) + Envío (si aplica) -
CuponesAplicados (si aplica)
Procedimiento:
1. Configuración inicial
1. Administrador accede al módulo de administración de precios.
2. Consulta o modifica:
● PrecioBase del producto
● PrecioCostoUnitario
● IVA aplicable
● Lista de precios por canal
● Promociones asociadas
● Descuentos aplicables
● Reglas de redondeo
2. Determinación del precio aplicable (PrecioAplicable)
Sistema ejecuta automáticamente las reglas:
1. Verifica si existe Promoción especial vigente en fecha y horario:
● Si la promoción fija aplica:
i. PrecioAplicable = PrecioPromocion
● Si la promo es porcentaje:
i. PrecioAplicable = PrecioBase - (PrecioBase * %Promo)
2. Verifica si existe PrecioProgramado activo:
● Si es vigente:
i. PrecioAplicable = PrecioProgramado
3. Verifica si existe Precio por canal (ej. solo en línea):
● Si aplica:
i. PrecioAplicable = PrecioCanal
4. Si ninguna condición se cumple :
i. PrecioAplicable = PrecioBase
3. Aplicación de descuentos (Dato Calculado: Descuento)
Para cada descuento configurado:
1. Calcular descuento
2. Validación automática:
● No permitir precio < PrecioCostoUnitario
4. Cálculo de impuestos (Dato Calculado: ValorIVA)
5. Cálculo por cantidad (Dato Calculado: SubtotalPorNCantidadDelMismoProducto )
6. Cálculo del total del pedido (Dato Calculado: TotalFinalDelPedido)
7. Gestión operativa del administrador
1. Configura promociones por fecha y horario
2. Define descuentos por volumen, cliente o temporada.
3. Programa cambios masivos por categoría.
4. Activa o desactiva promociones.
5. Consulta históricos de precios.
6. Monitorea métricas de efectividad de promociones.
Reglas:
● Promociones no pueden generar precios por debajo del costo.
● Promociones deben incluir FechaInicio y FechaFin obligatorias.
● Las reglas de redondeo deben aplicarse antes de confirmar el precio final
Salida:
● Estructura de precios actualizada, lista para venta inmediata.
● PrecioAplicable, PrecioUnitarioFinal y desglose de cálculos (impuestos, descuentos).
● Calendario de promociones activas y programadas.
● Registro histórico de cambios de precios.
● Alertas:
○ Promociones por iniciar
○ Promociones por expirar
○ Inconsistencias en precios (ej. precio < costo)
Requerimientos específicos no funcionales:

● Toda actualización de precios debe reflejarse en tiempo real en:
○ Punto de venta
○ Pedidos en línea
○ Aplicación móvil
○ Módulo de cocina y bar
● El servicio de actualización debe estar disponible 24/7.
● Las promociones programadas deben activarse/desactivarse automáticamente según:
○ Fecha
○ Hora
○ Canal
○ Tipo de cliente
● Cambios de precios y descuentos requieren:
○ Roles con permisos especiales
○ Autenticación reforzada para descuentos extraordinarios
RF: Gestión de Proveedores y Órdenes de Compra (Reabastecimiento)
Descripción: Sistema para administrar proveedores, generar órdenes de compra, registrar
recepciones de mercancía y controlar el proceso completo de reabastecimiento. Permite crear,
modificar y dar seguimiento a órdenes de compra, vinculando cada movimiento con
inventario y costos.
Entrada:
● Datos del proveedor
○ ProveedorID
○ Nombre comercial
○ Razón social
○ RFC / identificación fiscal
○ Teléfono y correo
○ Dirección
○ Condiciones de pago
○ Productos que suministra
○ Estatus (activo / inactivo)
● Datos del proveedor de orden de compra (OC)
○ OCID
○ Proveedor asignado
○ Fecha de creación
○ Fecha de solicitud de entrega
○ Estado (borrador, enviada, aprobada, en tránsito, recibida, parcial, cancelada)
○ Productos solicitados (ProductoID, CantidadSolicitada,
PrecioUnitarioProveedor)
○ Observaciones
● Datos de recepción de mercancía
○ Cantidad recibida por producto
○ Fecha de recepción
○ Usuario receptor
○ Faltantes o daños
○ Folio de recepción
○ Número de lote (si aplica)
○ Fecha de caducidad (si aplica)
○ Documentos adjuntos (factura u otros)
Datos a calcularse
● CostoTotalEstimado = Σ (CantidadSolicitada × PrecioProveedor)
● CostoRealRecepcionado = Σ (CantidadRecibida × PrecioProveedor)
● FaltantesPorProducto = CantidadSolicitada – CantidadRecibida
● ExistenciasActualizadas = ExistenciaActual + CantidadRecibida
Procedimiento:
Administración de proveedores
1. Registrar un nuevo proveedor con datos fiscales y comerciales.
2. Asociar productos que puede suministrar.
3. Actualizar condiciones de pago, tiempos de entrega y precios.
4. Desactivar proveedor sin eliminar su historial.
Creación de orden de compra
1. Administrador accede al módulo de compras.
2. Selecciona proveedor.
3. Agrega productos solicitados (cantidad, precio proveedor, notas).
4. Sistema calcula costo total estimado.
5. OC se guarda en estado “borrador”.
6. Usuario con permisos especiales puede aprobar y cambiar estado a “enviada”.
Recepción de mercancía
1. Registrar cantidades recibidas por producto
2. Registrar faltantes o sobrantes.
3. Registrar lote y caducidad si aplica.
4. Confirmar recepción.
5. Sistema actualiza inventario automáticamente.

Actualización de inventario y costos
1. Incremento automático de existencias.
2. Actualización del precio de costo si así lo define la configuración
Reglas:
● Una OC solo puede ser aprobada por usuarios autorizados.
● No puede recibirse una OC sin seleccionar un proveedor válido
● Cada recepción debe registrar usuario y fecha obligatoriamente.
● Los productos no pueden agregarse a una OC si no están en el catálogo.
● El sistema no permite cerrar una OC si existen productos sin definir como: recibidos,
dañados o faltantes
● Inventario se actualiza únicamente cuando la recepción es confirmada.
● Los proveedores inactivos no pueden recibir nuevas órdenes de compra.
Salida:
● Catálogo actualizado de proveedores con estatus, productos suministrados y
condiciones de compra.
● Órdenes de compra
● Documentos y facturas adjuntas asociadas a cada OC.
● Historial detallado de compras por producto, proveedor, periodo o categoría.
● Entradas de inventario generadas automáticamente por recepciones confirmadas.
Requerimientos específicos no funcionales:
● Actualización en tiempo real de inventario y estados de OC
● Solo administradores pueden crear proveedores.
● Disponibilidad 24/7 del módulo de compras y proveedores.
● Seguridad: cifrado de datos sensibles y validaciones anti-manipulación.
RF: Registro y Justificación de Mermas (Desperdicios)
Descripción: Permite registrar mermas o desperdicios de productos o insumos, indicando
cantidades afectadas y la causa del desperdicio. El registro genera un ajuste de inventario y
mantiene un historial con justificación obligatoria para fines de control interno y auditoría.
Entrada:
● Datos del proveedor
○ ProductoID
○ Nombre del producto
○ Unidad de medida
○ Existencia actual
● Datos del registro de merma
○ CantidadMerma
○ Motivo de merma (daño, caducidad, error operativo, sobrante no utilizable,
preparación fallida, otros)
○ Justificación detallada
○ Usuario responsable
○ Fecha y hora del registro
● Datos de recepción de mercancía
○ Cantidad recibida por producto
○ Fecha de recepción
○ Usuario receptor
○ Faltantes o daños
○ Folio de recepción
○ Número de lote (si aplica)
○ Fecha de caducidad (si aplica)
○ Documentos adjuntos (factura u otros)
Datos a calcularse
● ExistenciaFinal = ExistenciaActual – CantidadMerma
● ValorMerma = CantidadMerma × PrecioCostoUnitario
Procedimiento:
Registro de merma
1. Usuario autorizado accede al módulo de mermas.
2. Selecciona el producto afectado.
3. Ingresa cantidad y motivo de merma.
4. Redacta justificación obligatoria.
5. Opcionalmente adjunta evidencia.
6. Guarda el registro.
Validación del sistema
7. Verifica que la cantidad no supere la existencia actual.
8. Exige una justificación con texto mínimo requerido.
Generación automática del movimiento
6. Sistema descuenta existencias.
7. Registra el movimiento en historial de inventario como “Merma”.
8. Asocia usuario, fecha, hora, motivo y justificación.
9. Actualiza valor contable del inventario si aplica
Reglas:
● Solo usuarios autorizados pueden registrar mermas.
● Toda merma debe incluir motivo y justificación obligatoria.
● Si el producto maneja lote o caducidad, estos datos deben indicarse.
Salida:
● Registro confirmado de merma con:
○ Producto
○ Cantidad
○ Motivo
○ Justificación
○ Usuario
○ Fecha y hora
● Inventario actualizado con existencias finales.
Requerimientos específicos no funcionales:
● Actualización de inventario en tiempo real.
8.2. Modulo de Finanzas y Caja
RF: Control de Ingresos y Egresos de caja chica (Gastos menores)
● Datos a calcularse:
○ SaldoActual = MontoInicialAsignado + ΣIngresos – ΣEgresos
○ DisponibleParaGastos = FondoMáximoPermitido – SaldoActual (si aplica
política de tope)
○ TotalIngresosPeriodo = ΣIngresos
○ TotalEgresosPeriodo = ΣEgresos
● Entradas:
Datos generales de caja chica
○ CajaChicaID
○ MontoInicialAsignado
○ ResponsableAsignado
○ LímiteMáximoPorGasto
○ FondoMáximoPermitido
Datos de ingreso (recarga o devolución)
○ TipoMovimiento: Ingreso
○ MontoIngreso
○ MotivoIngreso (recarga, devolución de cambio, ajuste positivo)
○ Usuario que registra
○ Fecha y hora Comprobante o referencia (opcional)
Datos de egreso (gastos menores)
○ TipoMovimiento: Egreso
○ MontoEgreso
○ Categoría del gasto (papelería, limpieza, imprevistos, combustible, otros)
○ Descripción o justificación
○ Usuario responsable del gasto
○ Fecha y hora
○ Comprobante adjunto (opcional)
● Procedimientos:
 Configuración de caja chica
○ Administrador define monto inicial, fondo máximo, límites por gasto y
responsable.
 Registro de ingresos
○ Usuario autorizado selecciona “Ingreso”.
○ Ingresa monto, motivo y comprobante (si aplica).
○ Sistema actualiza saldo en tiempo real
Registro de egresos (gastos menores)
○ Usuario selecciona categoría del gasto.
○ Ingresa monto y justificación obligatoria.
○ Adjunta comprobante si está disponible.
○ Sistema valida que:
■ El monto no exceda el límite por gasto.
■ El saldo actual sea suficiente.
○ Sistema descuenta el monto y actualiza saldo.
● Reglas:
○ Solo usuarios designados pueden registrar movimientos.
○ Todo egreso debe incluir categoría y justificación obligatoria.
○ Los ingresos deben tener motivo registrado.
○ Los movimientos no pueden modificarse sin autorización administrativa.
● Salidas:
○ Saldo actual de caja chica en tiempo real.
○ Movimientos registrados (ingresos y egresos) con detalles completos.
○ Alerta cuando el saldo esté por debajo del mínimo o al acercarse al límite por
gasto.
● Requisitos No Funcionales:
○ Actualización de saldos en tiempo real.
○ Validación de integridad de datos para evitar manipulación.
○ Cifrado de documentos adjuntos y comprobantes.


RF: Comprobación de Cierre de Caja
● Descripción:
Permite verificar y validar el cierre de caja al finalizar un turno o jornada. El sistema
compara el monto que debería existir según las ventas registradas contra el monto real
contado por el cajero.
● Datos a calcularse:
○ TotalEsperado = TotalVentasRegistradas + IngresosExternos –
EgresosPermitidos
○ Diferencia = MontoEfectivoContado – TotalEsperado
○ EstatusCierre
■ Cuadrado (Diferencia = 0)
■ Sobrante (Diferencia > 0)
■ Faltante (Diferencia < 0)
○ TotalGeneralCierre = MontoEfectivoContado + MontoTarjetasReportado +
Vales/Otros
● Entradas
Datos del turno / caja a cerrar
○ CajaID
○ UsuarioCajero
○ Turno o jornada
○ Fecha y hora de inicio
○ Fecha y hora de cierre
Datos calculados por el sistema
○ TotalVentasRegistradas
○ TotalIngresosExternos (anticipos, recargas, otros)
○ TotalEgresosPermitidos (retiros, devoluciones, caja chica)
○ TotalNotasDeCrédito
Datos ingresados por el cajero
○ MontoEfectivoContado
○ MontoTarjetasReportado
○ MontoVales/otros medios
○ Observaciones del cajero (opcional, obligatorio si hay diferencias)
Datos ingresados por el cajero
○ UsuarioSupervisor
○ Justificación de autorizaciones o diferencias grandes
○ Confirmación de cierre
● Procedimientos
1. Inicio del cierre de caja
○ El cajero selecciona “Cerrar Caja”
○ El sistema carga automáticamente los totales esperados según ventas y
movimientos
2. Registro de conteo físico
○ Cajero ingresa el efectivo contado.
○ Ingresa montos de tarjetas y otros medios recibidos.
○ El sistema calcula la diferencia automáticamente.
3. Validación del sistema
○ Si existe diferencia ≠ 0:
○ El sistema solicita justificación obligatoria.
○ Para diferencias mayores al límite definido, se requiere autorización
del supervisor.
3. Confirmación del cierre
○ Cajero confirma el cierre preliminar.
○ Supervisor revisa (si aplica) y acepta el cierre.
○ El sistema bloquea el turno para evitar nuevas ventas.
3. Confirmación del cierre
○ Cajero confirma el cierre preliminar.
○ El sistema bloquea el turno para evitar nuevas ventas.

3. Reglas
○ No puede iniciarse un cierre si existen ventas abiertas o pedidos pendientes de
cobro.
○ Toda diferencia debe ser justificada por el cajero obligatoriamente.
○ El cierre no puede modificarse una vez confirmado.
○ Cada cierre debe asociarse a un solo cajero y a una sola caja.
○
3. Salidas
○ Informe de cierre con:
○ TotalEsperado
○ Efectivo contado
○ Diferencia
○ Detalle de ventas
○ Ingresos y egresos
○ Observaciones y justificaciones
○ Usuario cajero y supervisor
○ Fecha y hora de cierre
○ Estatus final del cierre (Cuadrado, Sobrante, Faltante).
○ Registro permanente en historial de cierres.
4. Requisitos No funcionales:
● Cálculo en tiempo real de valores y diferencias
● Disponibilidad continua del módulo de cierre.
● Acceso restringido según rol (cajero, supervisor, auditor).
● Cifrado de datos de transacción.


RF: Emisión de facturas
Descripción:
El sistema genera facturas electrónicas CFDI conforme a normativa fiscal, tomando
los datos del cliente y el consumo registrado, aplicando impuestos, generando el
comprobante digital, enviándolo a un PAC para timbrado y entregándolo al cliente en
formatos XML y PDF.
Datos calculados:
● SubtotalFactura
Datos:
● PrecioUnitarioFinal
● IVA
● Cantidad
Operación
SubtotalFactura=∑(PrecioUnitarioFinal/(1+IVA%)×Cantid
ad)
● IVA_Factura
Datos:
● PrecioUnitarioFinal
● PrecioAntesIVA
● Cantidad
Operación
IVA_Factura=∑((PrecioUnitarioFinal−PrecioAntesIVA)×C
antidad)
● TotalFactura (Debe coincidir con el total de la venta registrada)
Datos:
● SubtotalFactura
● IVA_Factura
Operación
TotalFactura=SubtotalFactura+IVA_Factura
● Cadena Original
Cadena de datos estructurados requerida para sello digital.
● Sello Digital del Emisor
Datos:
● CadenaOriginal
● LlavePrivadaCSD
Operación
Sello=Firmar(CadenaOriginal, LlavePrivadaCSD)
● Folio Fiscal (UUID)
Asignado por el PAC durante el timbrado.
Entradas:
● Datos del cliente
○ Nombre o Razón Social
○ RFC (opcional si factura global)
○ Dirección fiscal
○ Correo electrónico
○ Uso de CFDI (G01, G03, etc.)
● Datos del consumo (Venta)
○ Productos/servicios consumidos
○ Cantidad por producto
○ PrecioBase del producto
○ PrecioUnitarioFinal (ya incluye IVA según cálculo del módulo de
precios)
○ Impuestos aplicables por producto (IVA, IEPS si aplica)
○ Descuentos aplicados

○ Total a pagar
○ Método de pago
○ Forma de pago
○ Cuenta de pago (si aplica)
● Datos del establecimiento (emisor)
○ Razón social del negocio
○ RFC del emisor
○ Régimen fiscal
○ Dirección fiscal
○ Certificado digital del sello (CSD)
○ Llave privada y contraseña para firma
Procedimientos:
● Captura o validación de datos del cliente
○ El sistema solicita o recupera:
● Nombre o Razón Social
● RFC
● Dirección fiscal
● Correo electrónico
● Uso de CFDI
○ Validar formato de RFC y campos obligatorios.
○ Si datos incompletos emitir alerta y bloquear generación.
● Registro y validación del consumo
○ Obtener desde punto de venta:
● Productos
● Cantidades
● Precios
● Impuestos incluidos
○ Validar integridad:
● No existen precios negativos
● No existen cantidades 0
● Impuestos configurados correctamente
● Preparación de la factura
○ Generar estructura base del CFDI:
● Datos del emisor
● Datos del receptor
● Conceptos (productos y servicios)
● Impuestos desglose
● Totales
○ Aplicar cálculos de:
● Subtotal
● IVA
● Total
○ Aplicar redondeo conforme a normativa SAT (2 decimales).
● Generación de la cadena original
○ Ordenar campos conforme al estándar fiscal vigente.
○ Construir CadenaOriginal para posterior timbrado.

● Generación del sello digital del emisor
○ Cargar certificado CSD del emisor.
○ Firmar cadena original usando llave privada.
○ Insertar sello en CFDI.
● Envío del CFDI al PAC
Enviar CFDI al Proveedor Autorizado de Certificación.
● Esperar respuesta:
○ Aprobada (Timbrada)
○ Rechazada
● Si aprobada:
○ Obtener UUID
○ Obtener sello del SAT
● Asociación y almacenamiento
○ Asociar CFDI timbrado a:
● Venta
● Cliente
○ Guardar en base de datos:
● Versión XML
● PDF generado
● Datos fiscales críticos
● Envío al cliente
○ Enviar factura por correo electrónico con:
● XML
● PDF
○ Registrar evidencia de envío y estatus.
Reglas:
● No se puede emitir CFDI sin RFC válido (excepto factura global).
● No se puede timbrar una factura cuyo total sea diferente del total de la venta.
● Una factura solo puede timbrarse una vez (evitar duplicados).
● El sistema debe validar la vigencia del CSD del emisor.
● Si el PAC rechaza el CFDI, no se registrará como venta facturada.
● Toda factura debe quedar almacenada por mínimo 5 años.
● No se permite modificar un CFDI ya timbrado (solo cancelación).
● Cancelaciones deben seguir reglas del SAT (aceptación si aplica)
Salidas:
● Factura electrónica timbrada (XML oficial con sello fiscal)
● Factura electrónica en PDF, con formato legible para el cliente.
● Registro fiscal:
■ UUID
■ Fecha de emisión
■ Importe
■ Cliente
■ Estado de timbrado
● Alertas automáticas:
■ Datos incompletos del cliente
■ Certificado CSD caducado
■ Error en conexión con PAC
■ CFDI rechazado por la autoridad
■ Intento de duplicación de factura
Requerimientos específicos no funcionales:
● reintentos automáticos en caso de falla de red con PAC
● Cifrado de llave privada CSD
● Acceso restringido a usuarios autorizados
● Almacén seguro para certificados y sellos
● Comunicación HTTPS obligatoria con PAC
● Conservación mínima de 5 años
● CFDI conforme a estándar vigente SAT (v3.3 o v4.0 según aplique).
● XML generado debe ser 100% válido para cualquier PAC autorizado.
● Totales e impuestos deben coincidir exactamente con el motor de precios
● Tipo y forma de pago deben alinearse con la venta original

RF: Gestión de propinas
Descripción:
Gestiona el cálculo, registro y aplicación de propinas durante el proceso de pago. Permite al
cliente elegir entre propinas sugeridas, personalizadas, o especificar si la propina será en
efectivo o añadida al cargo electrónico. Mejora la transparencia para el cliente y facilita el
control administrativo para el restaurante.
Entrada:
● Total de la cuenta
● Propinas sugeridas (porcentajes predefinidos)
● Propina personalizada ingresada por el cliente
● Método de pago seleccionado (tarjeta o efectivo)
● Configuraciones del restaurante (propina obligatoria en grupos grandes, sugerencias
activadas/desactivadas)
● Solicitudes del cliente o del mesero para ajustar propina
Procedimiento:
1. El cliente accede al proceso de pago desde la mesa, QR o terminal del mesero/caja.
2. El sistema muestra propinas sugeridas (ej.: 5%, 10%, 15%, 20%).
3. El cliente selecciona una opción o ingresa un monto personalizado.
4. El sistema recalcula el total final incluyendo la propina seleccionada.
5. El cliente elige si la propina es en:
○ Efectivo (no se suma al total cargado)
○ Tarjeta (se agrega al total electrónico)
6. El mesero confirma o el cliente aprueba el monto final.
7. El sistema registra la propina y la asocia al pedido.
8. La propina aparece en el cierre de caja y en los reportes del día.
Reglas:
● El cliente siempre debe tener la opción de ingresar propina personalizada.
● Las propinas sugeridas pueden configurarse según políticas del restaurante.
● Si el método de pago es tarjeta, la propina debe sumarse al total final.
● Si el método es efectivo, la propina no afecta el total cobrado electrónicamente.
● En cuentas de grupos grandes, la propina obligatoria puede calcularse
automáticamente si el restaurante así lo define.
● La propina debe aparecer separada del subtotal e impuestos en el ticket.
● No se pueden registrar propinas negativas o montos no numéricos.
● La propina queda asociada al mesero asignado a la mesa.
Salida:
● Total final incluyendo propina (si aplica)
● Monto de propina registrada
● Tipo de propina (sugerida, personalizada, obligatoria)
● Método aplicado (efectivo o tarjeta)
● Registro en reportes diarios de propinas
● Información para distribución interna del personal
8.2. -Modulo de Sistema
RF: Modo offline
● Descripción:
Permite que el sistema continúe funcionando ante pérdida de conexión a internet,
asegurando la continuidad operativa del punto de venta, pedidos en sala y registros de
inventario, mediante almacenamiento local temporal y posterior sincronización
automática.
● Entradas:
Estado de conectividad
○ Indicador del estado de red:
■ Online
■ Offline
○ Disponibilidad del servidor
Operaciones del personal
● Punto de Venta
○ Registro de ventas
○ Productos vendidos
○ Cantidad
○ Precios (PrecioUnitarioFinal)
○ Descuentos aplicados
○ Métodos de pago (solo pagos no electrónicos o diferidos)
● Pedidos en Sala
○ Capturas en mesas
○ Estados de pedido
○ Tiempo estimado
○ Modificadores y notas
● Inventario
○ Movimientos internos:
■ Bajas por venta
■ Ajustes por merma
■ Movimientos por preparación
● Flujo del sistema:
○ Detección de pérdida de conexión.
■ El sistema monitorea conectividad en intervalos de 30 segundos.
■ Si no hay respuesta del servidor → cambiar estado a Offline.
○ Activación de modo local.
■ Deshabilitar funciones dependientes de internet:
● Pagos en línea
● Facturación instantánea
● Validaciones externas
■ Cambiar a:
● Base de datos local
● Caché interna para reglas de negocio
■ Advertir al usuario que opera en modo offline.
○ Registro de operaciones en almacenamiento temporal
Cada operación se almacena con:
■ OperaciónID
■ SecuenciaLocal
■ TimestampLocal
■ Datos serializados
■ Tipo de operación
■ HashIntegridadLocal
■ Estado = “Pendiente de sincronizar”
Las operaciones posibles incluyen:
■ Ventas
■ Movimientos de inventario
■ Pedidos de sala
■ Cambios de estado (en preparación, listo, entregado)
■ Cancelaciones o anulaciones
○ Monitoreo de reconexión
■ Verificar conectividad periódicamente.
■ Cuando detecte disponibilidad → cambiar estado a “Reconectando”.
■ Antes de sincronizar, congelar operaciones nuevas por 1–2 segundos
para evitar colisiones.
○ Sincronización automática
■ Validación inicial
● Comparación de versiones de catálogos: productos, precios,
usuarios.
● Si existe discrepancia -> priorizar datos del servidor
■ Envío ordenado de operaciones
Las operaciones pendientes se envían en base a
Orden=SecuenciaLocalAscendente
● Confirmación por parte del servidor
Por cada operación:
● Si es válida → Estado = “Sincronizada”
● Si hay error → Estado = “Conflicto”
● Resolución de conflictos
○ Una venta duplicada se identifica por importes + timestamp
±1s.
○ Movimientos de inventario contradictorios se resuelven según
versión más reciente.
○ Pedidos de sala en diferente estado → prevalece el estado del
servidor salvo si el local tenga una secuencia mayor.
● Actualización de inventario
○ Recalcular existencias con movimientos guardados offline.
● Limpieza de almacenamiento local
○ Eliminar operaciones ya sincronizadas.
● Reglas:
○ Las operaciones offline deben quedar 100% registradas sin pérdida.
○ El sistema debe soportar al menos 24 horas continuas en modo offline.
○ Cualquier operación que requiera internet (pagos online, facturación SAT)
queda bloqueada.
○ Toda operación offline debe incluir un hash de integridad.
○ La sincronización debe ser automática y sin intervención del usuario.
○ En caso de conflicto, se aplican reglas de prioridad:
■ Precio → prevalece servidor
■ Inventario → prevalece versión más reciente
■ Estado de pedido → prevalece secuencia más alta
○ Si la sincronización falla, el sistema debe reintentar en intervalos crecientes
(2s, 5s, 15s, 30s…).
● Salidas:
○ Operaciones registradas sin pérdida.
○ Datos sincronizados correctamente con el servidor.
○ Alertas y mensajes
■ “Operación registrada localmente”
■ “Sistema en modo offline”
■ “Reconexión detectada”
■ “Sincronización completada”
■ “Conflicto detectado” (con detalle)
○ Reporte de sincronización con:
■ Cantidad de operaciones sincronizadas

■ Operaciones rechazadas
■ Tiempo total de sincronización
● Requerimientos específicos no funcionales:
○ Base de datos local siempre disponible
○ Sistema usable al 100% en salas y POS sin internet
○ Hash de integridad SHA256 por operación
○ DB local cifrada con AES-256
○ Acceso restringido por usuario/rol
○ Reintentos automáticos en reconexión
○ Guardado a prueba de fallos (operación nunca perdida)
○ Algoritmo de resolución de conflictos determinístico
○ Operaciones sincronizadas en orden de ejecución real
○ Compatible con todos los módulos involucrados:
■ Punto de Venta
■ Pedidos en Sala
■ Inventario
■ Sincronización
○ Datos offline deben integrarse sin afectar cálculos de otros módulos (precios,
inventario, facturación).
RF: Backups de datos
● Descripción:
El sistema debe generar copias de seguridad automáticas y manuales de todos
los datos críticos, garantizando integridad, cifrado, trazabilidad y la capacidad
de restaurar información en caso de fallos, corrupción de datos o pérdida de
información.
● Entradas:
○ Configuración de respaldo
■ Diario
■ Semanal
■ Mensual
■ Intervalo personalizado (en minutos/horas)
○ Tipo de respaldo:
■ Completo
■ Incremental
■ Diferencial
○ Destino:
■ Almacenamiento local
■ Servidor remoto
○ Retención
■ Días o semanas de permanencia de backups
■ Cantidad máxima de copias
● Datos del sistema a respaldar:
○ Base de datos completa del sistema:
■ Usuarios
■ Inventario
■ Ventas
■ Historial de pedidos
■ Configuraciones de sistema
○ Archivos generados:
■ Facturas
■ XML timbrados
■ PDFs
■ Reportes de ventas
● Procedimientos:
○ Programación de backups automáticos.
■ El sistema registra la configuración definida por el administrador.
■ Se genera un Job automático que se ejecuta según la periodicidad
indicada.
■ En el momento programado
● Se verifica espacio disponible
● Se validan permisos
● Se bloquea temporalmente la escritura en tablas críticas para
evitar corrupción
○ Extracción y preparación de datos
■ Se obtiene un snapshot consistente de la base de datos
■ Se comprime el snapshot (ZIP, GZIP, o formato propietario).
○ Cifrado del respaldo
■ Se aplica cifrado AES-256 o equivalente
La llave nunca se almacena en texto plano.
○ Almacenamiento en destino seguro
El sistema envía el backup cifrado a:
■ Disco local
■ Servidor remoto
■ Nube (con token seguro)
○ Registro de logs
■ Fecha y hora del backup
■ Tipo de backup
■ Tamaño resultante
■ Hash de integridad
■ Resultado: Exitoso / Fallido / Parcial
■ Tiempo de ejecución
○ Eliminación automática por retención
Cada ciclo de backup:
■ Se revisa la carpeta de destino.
■ Se eliminan respaldos cuya fecha supere la retención configurada.
Restauración en caso de fallo
■ Administrador solicita restauración.
■ Se valida que el backup seleccionado esté íntegro comparando
HashIntegridad.
■ Se descifra el backup:
■ Se descomprime.
■ Se reemplazan datos dañados o todo el sistema, según el tipo de
restauración:
● Restauración completa
● Restauración parcial (tablas o archivos específicos)
■ Se reinician servicios dependientes.
■ Se genera reporte de restauración.
● Reglas:
○ Todos los backups deben estar cifrados obligatoriamente.
○ No se permiten respaldos con datos incompletos o inconsistentes.
○ Los respaldos no pueden ejecutarse si el espacio disponible es insuficiente.
○ La restauración requiere autorización con nivel de administrador.
○ Los backups deben validarse mediante hash antes de almacenarse.
○ Debe generarse un log por cada intento de respaldo (éxito o fallo).
○ Si ocurre un fallo durante el respaldo, se debe abortar y dejar un registro.
○ La retención de backups debe ser estrictamente respetada.
● Salidas:
○ Copias de seguridad generadas, comprimidas, cifradas y validadas.
○ Bitácora de respaldo con detalles técnicos.
○ Alertas en caso de :
■ Respaldo fallido
■ Backup incompleto
■ Espacio insuficiente
■ Error de cifrado
■ Corrupción detectada mediante Hash
■ Error al enviar a almacenamiento remoto
● Requerimientos específicos no funcionales
○ Cifrado AES-256 obligatorio.
○ Credenciales y llaves guardadas en bóveda segura.
○ Transmisión mediante TLS 1.2 o superior.
○ El sistema debe permitir backups automáticos incluso si el administrador no
inicia sesión.
○ Tolerancia a fallos:
■ Reintentos automáticos de envío
■ Validación de integridad
○ Compatible con almacenamientos externos
■ Google
■ Azure
■ Amazon
■ FTP/SFTP seguros
○ Todos los respaldos y restauraciones deben quedar registrados en bitácora de
auditoría.
RF: Integración con Pasarelas de Pago para Cobros con Tarjeta
● Descripción:

Permite procesar pagos con tarjeta mediante conexión con pasarelas de pago
certificadas (Stripe, MercadoPago, Clip, Square, etc.). El sistema envía el monto a
cobrar, recibe la respuesta de aprobación o rechazo y registra la transacción en ventas.
● Datos a calcularse:
Estatus interno de pago (Pagado, Rechazado, Error, Cancelado).
Estatus interno de pago (Pagado, Rechazado, Error, Cancelado).
Comisión pasarela (si aplica).
MontoNeto = MontoACobrar – ComisiónPasarela.
Referencias internas para conciliación diaria.
● Entradas:
Datos enviados por el sistema a la pasarela
○ MontoACobrar
○ Moneda
○ Descripción (folio del pedido, cliente opcional)
○ Tipo de operación (venta, devolución)
○ Token de terminal o credencial de API
○ Identificador de comercio
○ Datos del dispositivo/terminal (si aplica)
Datos ingresados por el usuario
○ Selección del método de pago: Tarjeta Débito / Crédito
○ Confirmación del monto
○ Uso físico del lector de tarjetas, chip, banda, NFC o QR (según pasarela)
Datos recibidos desde la pasarela
○ TransactionID
○ Estatus (approved, declined, pending)
○ Código de autorización
○ Tipo de tarjeta (Visa, MasterCard, etc.)
○ Últimos 4 dígitos
○ Monto confirmado
○ Hash de seguridad
○ Mensajes de error (si aplica)
● Procedimientos
Inicio del pago
● Usuario selecciona “Pago con Tarjeta”.
● Sistema envía monto y referencia del pedido a la pasarela.
● Se habilita la terminal física o interfaz digital.
Procesamiento de la transacción
● Cliente inserta, desliza o acerca la tarjeta.
● Pasarela procesa la operación y devuelve el resultado.
● Sistema recibe el estatus y datos de la tarjeta
Validación del resultado
● Si aprobado:
● Se registra la transacción como “Pagada”.
● El pedido se marca como liquidado.
● Se emite el comprobante electrónico (ticket).
● Si rechazado:
● Se muestra el mensaje del banco/pasarela.
● El sistema mantiene el pedido pendiente de pago.
● Si error técnico:
● El sistema desactiva cobro para evitar doble cargo.
● Se recomienda reintentar o usar otro método.
Reembolsos y cancelaciones (si aplica)
● Usuario autorizado selecciona la venta.
● El sistema envía la solicitud de reverso o devolución a la pasarela.
● Se registra el nuevo estatus como “Devuelto” o “Cancelado”.
Conciliación automática
● El sistema genera un resumen diario de todas las transacciones con su
TransactionID.
● Se comparan con los reportes de la pasarela.
● Se marcan transacciones conciliadas o con discrepancias.
● Reglas
○ No se permite cobrar un monto diferente al registrado en el sistema.
○ Una venta no puede marcarse como pagada sin una aprobación válida de la
pasarela.
○ Las credenciales de API deben mantenerse encriptadas.
○ Cada transacción debe almacenar fecha/hora, responsable y folio.
○ Reembolsos solo por usuarios con permisos especiales.
○ No se permite reintentar una transacción si aún está “pendiente” en la pasarela.
○ Si la terminal está desconectada, el sistema debe bloquear pagos con tarjeta.
● Salidas
○ Confirmación de pago con TransactionID y código de autorización.
Ticket o comprobante del pago.
○ Registro histórico de transacciones (venta, devolución, error).
○ Alertas por pagos rechazados o inconsistentes.
○ Reporte de conciliación diaria con la pasarela.

RF: Filtrado de búsqueda por texto plano o filtros estáticos
Descripción:
Gestiona la búsqueda y filtrado del menú permitiendo a los clientes encontrar productos rápidamente
mediante texto libre o filtros predefinidos como precio, ingredientes, categoría o etiquetas. Mejora la
navegación del menú y reduce el tiempo para localizar un platillo específico.
Entrada:
● Texto ingresado por el usuario (palabras clave)
● Filtros seleccionados (precio, categoría, ingredientes, etiquetas)
● Base de datos de productos del menú
● Parámetros de ordenamiento (precio ascendente/descendente, popularidad, etc.)
Procedimiento:
1. El cliente accede al menú o barra de búsqueda.
2. Ingresa texto plano (ej.: “pollo”, “sin gluten”).
3. El sistema analiza coincidencias en:
○ Nombre del producto
○ Descripción
○ Ingredientes
○ Etiquetas asociadas
4. Opcionalmente, el cliente activa filtros estáticos:
○ Rango de precios
○ Lista de ingredientes incluidos/excluidos
○ Categorías (entradas, bebidas…)
○ Etiquetas (vegano, picante, sin lactosa)
5. El sistema combina la búsqueda y los filtros aplicados.
6. Se actualiza la lista de productos en tiempo real.
7. El cliente selecciona un producto o continúa ajustando filtros.
Reglas:
● La búsqueda debe ser tolerante a errores ortográficos menores.
● Los filtros deben poder combinarse entre sí.
● Si no hay coincidencias, se muestra mensaje claro (“No se encontraron productos”).
● El sistema debe permitir limpiar filtros con un solo clic.
● Los productos ocultos o fuera de inventario no deben aparecer en resultados.
● El texto plano tiene prioridad sobre filtros si ambos están activos.
Salida:
● Lista de productos coincidentes con el texto ingresado
● Lista filtrada según los parámetros seleccionados
Mensajes de estado (sin resultados, filtros aplicados, etc.)
● Actualización dinámica del menú
● Ordenación opcional según preferencias del usuario
Requerimientos específicos no funcionales:
Rendimiento:
● Las búsquedas deben ejecutarse en menos de 1 segundo.
● Los filtros deben actualizar los resultados de manera instantánea (UX sin recarga).
Usabilidad:
● Interfaz clara con filtros visibles y accesibles.
● Barra de búsqueda intuitiva con autocompletado opcional.
Compatibilidad:
● Funcionamiento fluido en dispositivos móviles.
Precisión:
● Sistema de búsqueda debe soportar coincidencias parciales y palabras clave múltiples.
Escalabilidad:
● Debe soportar catálogos amplios sin perder velocidad.