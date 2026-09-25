import axios from 'axios';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../types/product';

// ── Axios instance ─────────────────────────────────────────────────────────
// Base URL is read from the .env file — never hardcoded.
// All API calls in the app must go through this instance, not raw axios.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000, // 10 s — fail fast on network issues
});

// ── Response interceptor — normalise error messages ────────────────────────
// Extracts a human-readable message from NestJS error responses so that
// components and Redux thunks receive a plain string, not an AxiosError.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;

    let message = 'An unexpected error occurred. Please try again.';

    if (data?.message) {
      // NestJS validation errors send an array of strings for 400s.
      message = Array.isArray(data.message)
        ? data.message.join(', ')
        : String(data.message);
    } else if (error?.message) {
      message = error.message;
    }

    // Re-throw a plain Error with the clean message so createAsyncThunk
    // can pick it up in its rejected handler via rejectWithValue.
    return Promise.reject(new Error(message));
  },
);

// ── API functions ──────────────────────────────────────────────────────────

/** GET /products — fetch all products */
export const getAll = async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/products');
  return data;
};

/** GET /products/:id — fetch one product */
export const getById = async (id: number): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

/** POST /products — create a new product */
export const create = async (payload: CreateProductPayload): Promise<Product> => {
  const { data } = await api.post<Product>('/products', payload);
  return data;
};

/** PUT /products/:id — update an existing product */
export const update = async (
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
};

/** DELETE /products/:id — remove a product */
export const remove = async (id: number): Promise<number> => {
  await api.delete(`/products/${id}`);
  return id; // return the id so the slice can filter it out of state
};
