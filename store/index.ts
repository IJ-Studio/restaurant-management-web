/**
 * store/index.ts
 *
 * Redux store configuration.
 * Replaces the root-level store.ts — moved here to keep infrastructure
 * code organized within its own module.
 *
 * Usage:
 *   import { store, type RootState, type AppDispatch } from '@/store'
 */

import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import authReducer, { sesionCerrada } from "./slices/authSlice";

const reductorApp = combineReducers({
  auth: authReducer,
});

/** Con `sesionCerrada` cada slice vuelve a su estado inicial (PLAN 2.14). */
export function reductorRaiz(estado: ReturnType<typeof reductorApp> | undefined, accion: UnknownAction) {
  return reductorApp(sesionCerrada.match(accion) ? undefined : estado, accion);
}

export const crearStore = () => configureStore({ reducer: reductorRaiz });

export const store = crearStore();

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
