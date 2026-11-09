import { test, expect } from "@playwright/test";
import { crearStore } from "../../store/index";
import { estadoInicialAuth, sesionCerrada, setError, setUser } from "../../store/slices/authSlice";

// Cierre de sesión (PLAN 2.14): `sesionCerrada` deja todo el store en su estado inicial. Sin navegador.
test("sesionCerrada reinicia el store", () => {
	const store = crearStore();
	const inicial = store.getState();
	expect(inicial.auth).toEqual(estadoInicialAuth);
	store.dispatch(setUser({ id: "1", name: "Ana" } as never));
	store.dispatch(setError("algo"));
	expect(store.getState()).not.toEqual(inicial);
	store.dispatch(sesionCerrada());
	expect(store.getState()).toEqual(inicial);
});
