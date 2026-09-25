import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import productReducer from './productSlice';

// ── Redux store ────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    products: productReducer,
  },
});

// ── Inferred types ─────────────────────────────────────────────────────────
// Derive RootState and AppDispatch from the store itself so they always
// stay in sync with the reducer shape — no manual type maintenance.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Typed hooks ────────────────────────────────────────────────────────────
// Use these everywhere instead of plain useDispatch / useSelector to get
// full TypeScript inference and avoid casting.

/** Typed useDispatch — aware of thunk middleware */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed useSelector — scoped to RootState */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
