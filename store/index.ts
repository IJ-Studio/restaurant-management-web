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

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
