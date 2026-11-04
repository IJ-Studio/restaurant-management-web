"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, UserPlus, Users } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { CREATABLE_ROLES, ROLE_LABELS } from "@/config/roles.config";
import { api } from "@/lib/api";
import { registrarError } from "@/lib/registro/registrar-error";
import { esquemaUsuarioEdicion, esquemaUsuarioNuevo } from "@/lib/validacion/formularios";
import { nombrePropio } from "@/lib/formato/caja";

/**
 * Usuarios y personal (PLAN 5.13). Mismas llamadas (`GET /users`, `POST /users`,
 * `PATCH /users/:id` con el formulario o con `{ isActive }`) y mismo payload: en la edición, la
 * contraseña vacía no se envía. Lo nuevo: validación con los esquemas del paso 3.1, confirmación
 * del sistema para activar o desactivar (antes `confirm()`), notificaciones (antes `alert()` con el
 * mensaje del API) y la tabla del catálogo.
 */

interface Usuario {
	id: number | string;
	name: string;
	lastname: string;
	email: string;
	phone?: string;
	roleId: number;
	isActive: boolean;
}
const entero = new Intl.NumberFormat("es-MX");
const nombreDe = (u: Usuario) => `${u.name} ${u.lastname}`.trim();
const rolDe = (id: number) => ROLE_LABELS[id] ?? "Sin rol";

function DialogoUsuario({ usuario, disparador, alGuardar }: { usuario?: Usuario; disparador: ReactNode; alGuardar: (datos: Record<string, unknown>, original?: Usuario) => Promise<boolean> }) {
	const inicial = () => ({
		name: usuario?.name ?? "",
		lastname: usuario?.lastname ?? "",
		email: usuario?.email ?? "",
		phone: usuario?.phone ?? "",
		password: "",
		roleId: String(usuario?.roleId ?? CREATABLE_ROLES[0]),
	});
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(inicial);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	const id = usuario ? `usuario-${usuario.id}` : "usuario-nuevo";
	// `PATCH /users/:id/role` solo admite los roles que se pueden crear; el de administrador no se cambia aquí.
	const esAdmin = usuario?.roleId === 1;
	const roles = esAdmin ? [1] : [...CREATABLE_ROLES];

	async function guardar() {
		const datos = { ...f, roleId: Number(f.roleId) };
		const r = usuario ? esquemaUsuarioEdicion.safeParse(datos) : esquemaUsuarioNuevo.safeParse(datos);
		const e: Record<string, string> = {};
		if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
		setErrores(e);
		if (!r.success) return;
		setGuardando(true);
		const ok = await alGuardar(r.data as Record<string, unknown>, usuario);
		setGuardando(false);
		if (ok) setAbierto(false);
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) setF(inicial());
				else setErrores({});
			}}
			cerrable={!guardando}
			disparador={disparador}
			titulo={usuario ? `Editar a ${nombreDe(usuario)}` : "Usuario nuevo"}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form={id} cargando={guardando} textoCargando="Guardando…">
						{usuario ? "Guardar cambios" : "Crear usuario"}
					</Boton>
				</>
			}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					void guardar();
				}}
			>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errores.name} autoComplete="off" maxLength={80} />
					<Campo etiqueta="Apellidos" value={f.lastname} onChange={(e) => setF({ ...f, lastname: e.target.value })} error={errores.lastname} autoComplete="off" maxLength={80} />
				</div>
				<Campo
					etiqueta="Correo"
					type="email"
					value={f.email}
					onChange={(e) => setF({ ...f, email: e.target.value })}
					error={errores.email}
					autoComplete="off"
					readOnly={!!usuario}
					ayuda={usuario ? "El correo no se cambia desde aquí: es con el que la persona entra." : undefined}
				/>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Teléfono" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={errores.phone} autoComplete="off" maxLength={20} />
					<Selector etiqueta="Rol" opciones={roles.map((r) => ({ valor: String(r), texto: rolDe(r) }))} value={f.roleId} onChange={(e) => setF({ ...f, roleId: e.target.value })} error={errores.roleId} disabled={esAdmin} />
				</div>
				{usuario ? (
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">La contraseña no se cambia desde aquí: cada persona la cambia desde su perfil.</p>
				) : (
					<Campo etiqueta="Contraseña" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errores.password} autoComplete="new-password" ayuda="Mínimo 8 caracteres." />
				)}
			</form>
		</Dialogo>
	);
}

export function UsuariosAdmin() {
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [busqueda, setBusqueda] = useState("");
	const [rol, setRol] = useState("todos");
	const [activo, setActivo] = useState("todos");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const datos = await api.get<Usuario[]>("/users");
			setUsuarios(Array.isArray(datos) ? datos.map((u) => ({ ...u, name: nombrePropio(u.name), lastname: nombrePropio(u.lastname) })) : []);
			setEstado("listo");
		} catch (e) {
			registrarError(e, "usuarios: cargar");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function guardar(datos: Record<string, unknown>, original?: Usuario) {
		try {
			if (original) {
				// Cada dato por su ruta: el perfil por `PATCH /users/:id` y el rol por `/role` (antes el
				// rol, el correo y la contraseña se descartaban en silencio y se mostraba «guardado»).
				await api.patch(`/users/${original.id}`, { name: datos.name, lastname: datos.lastname, phone: datos.phone });
				if (Number(datos.roleId) !== original.roleId) await api.patch(`/users/${original.id}/role`, { roleId: Number(datos.roleId) });
			} else await api.post("/users", datos);
			notificar({ tono: "exito", titulo: original ? "Cambios guardados" : "Usuario creado", descripcion: `${datos.name} ${datos.lastname}` });
			void cargar();
			return true;
		} catch (e) {
			registrarError(e, "usuarios: guardar");
			notificar({ tono: "error", titulo: "No se pudo guardar", descripcion: "Revisa que el correo no esté ya en uso y vuelve a intentarlo." });
			return false;
		}
	}

	async function alternar(u: Usuario) {
		const ok = await confirmar({
			titulo: u.isActive ? `¿Desactivar a ${nombreDe(u)}?` : `¿Activar a ${nombreDe(u)}?`,
			descripcion: u.isActive ? "No podrá entrar al sistema hasta que la vuelvas a activar." : "Podrá volver a entrar con su correo y su contraseña.",
			textoConfirmar: u.isActive ? "Desactivar" : "Activar",
			destructiva: u.isActive,
		});
		if (!ok) return;
		try {
			// Baja lógica con `DELETE /users/:id` y reactivación con `PATCH /users/:id/reactivar`.
			if (u.isActive) await api.delete(`/users/${u.id}`);
			else await api.patch(`/users/${u.id}/reactivar`);
			notificar({ tono: "exito", titulo: u.isActive ? "Usuario desactivado" : "Usuario activado", descripcion: nombreDe(u) });
			void cargar();
		} catch (e) {
			registrarError(e, "usuarios: activar");
			notificar({ tono: "error", titulo: "No se pudo cambiar el estado", descripcion: nombreDe(u) });
		}
	}

	const filtrados = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return usuarios.filter(
			(u) =>
				(!q || `${u.name} ${u.lastname} ${u.email}`.toLowerCase().includes(q)) &&
				(rol === "todos" || String(u.roleId) === rol) &&
				(activo === "todos" || (activo === "activos" ? u.isActive : !u.isActive)),
		);
	}, [usuarios, busqueda, rol, activo]);

	const columnas: ColumnaTabla<Usuario>[] = [
		{
			clave: "nombre",
			titulo: "Nombre",
			principal: true,
			celda: (u) => (
				<span className="flex flex-col gap-0.5">
					<span>{nombreDe(u)}</span>
					<span className="text-(length:--texto-pequeno) font-normal text-texto-secundario [overflow-wrap:anywhere]">{u.email}</span>
				</span>
			),
		},
		{ clave: "telefono", titulo: "Teléfono", celda: (u) => u.phone || "—" },
		{ clave: "rol", titulo: "Rol", celda: (u) => rolDe(u.roleId) },
		{ clave: "estado", titulo: "Estado", celda: (u) => (u.isActive ? <Insignia tono="exito" className="whitespace-nowrap">Activo</Insignia> : <Insignia tono="neutro" className="whitespace-nowrap">Inactivo</Insignia>) },
	];

	const indicador = { estado, alReintentar: cargar } as const;
	return (
		<PlantillaPanel
				titulo="Usuarios"
				descripcion="Quién entra al sistema y con qué rol."
				acciones={<DialogoUsuario alGuardar={guardar} disparador={<Boton icono={<UserPlus />}>Usuario nuevo</Boton>} />}
		>

			<div className={REJILLA_INDICADORES}>
				<Indicador {...indicador} rotulo="Personal activo" valor={entero.format(usuarios.filter((u) => u.isActive && u.roleId !== 5).length)} detalle="Administración, caja, sala y cocina" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...indicador} rotulo="Usuarios" valor={entero.format(usuarios.length)} />
				<Indicador {...indicador} rotulo="Clientes" valor={entero.format(usuarios.filter((u) => u.roleId === 5).length)} />
				<Indicador {...indicador} rotulo="Inactivos" valor={entero.format(usuarios.filter((u) => !u.isActive).length)} />
			</div>

			<BloquePanel
				titulo="Todos los usuarios"
				acciones={
					<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
						<Buscador etiqueta="Buscar por nombre o correo" valor={busqueda} alCambiar={setBusqueda} marcador="Nombre o correo" />
						<Selector etiqueta="Rol" opciones={[{ valor: "todos", texto: "Todos" }, ...Object.entries(ROLE_LABELS).map(([valor, texto]) => ({ valor, texto }))]} value={rol} onChange={(e) => setRol(e.target.value)} />
						<Selector
							etiqueta="Estado"
							opciones={[
								{ valor: "todos", texto: "Todos" },
								{ valor: "activos", texto: "Activos" },
								{ valor: "inactivos", texto: "Inactivos" },
							]}
							value={activo}
							onChange={(e) => setActivo(e.target.value)}
						/>
					</div>
				}
			>
				<Tabla
					leyenda="Usuarios"
					columnas={columnas}
					filas={filtrados}
					claveFila={(u) => u.id}
					estado={estado === "cargando" ? "cargando" : "listo"}
					error={estado === "error" ? <EstadoError titulo="No pudimos traer los usuarios" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					tituloAcciones="Acciones"
					acciones={(u) => (
						<>
							<Boton variante="fantasma" tamano="compacto" aria-label={u.isActive ? `Desactivar a ${nombreDe(u)}` : `Activar a ${nombreDe(u)}`} onClick={() => alternar(u)}>
								{u.isActive ? "Desactivar" : "Activar"}
							</Boton>
							<DialogoUsuario
								usuario={u}
								alGuardar={guardar}
								disparador={
									<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
										{`Editar a ${nombreDe(u)}`}
									</Boton>
								}
							/>
						</>
					)}
					vacio={<EstadoVacio icono={<Users />} titulo="Nadie coincide" descripcion="Prueba con otra búsqueda o quita los filtros." />}
				/>
			</BloquePanel>
			{dialogo}
		</PlantillaPanel>
	);
}
