"use client";

import { useEffect } from "react";

/**
 * Limpia los service workers de versiones anteriores (PLAN 2.7, D-11 rechazada: no hay service
 * worker). No es un service worker: en cada carga desregistra las instalaciones que queden y
 * borra las cachés de la aplicación, para que nadie siga viendo una versión vieja guardada.
 * Se mantiene un tiempo, hasta que no queden navegadores con el SW antiguo; su retirada es NP-34.
 */
export function RetirarServiceWorker() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.getRegistrations()
				.then((registros) => Promise.all(registros.map((r) => r.unregister())))
				.catch(() => undefined);
		}
		if ("caches" in window) {
			caches
				.keys()
				.then((nombres) => Promise.all(nombres.map((n) => caches.delete(n))))
				.catch(() => undefined);
		}
	}, []);
	return null;
}
