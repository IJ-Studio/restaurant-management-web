/**
 * hooks/useAppSelector.ts
 *
 * Typed version of useSelector for this app's Redux store.
 * Always use this instead of the raw useSelector from react-redux.
 *
 * Usage:
 *   const user = useAppSelector(state => state.auth.user);
 */
"use client";

import { useSelector, useDispatch } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store/index";

/** Typed selector hook — knows the shape of our Redux state */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Typed dispatch hook */
export const useAppDispatch = () => useDispatch<AppDispatch>();
