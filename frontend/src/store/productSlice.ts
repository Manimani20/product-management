import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../types/product';
import * as productApi from '../services/productApi';

// ── State shape ────────────────────────────────────────────────────────────
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// ── Async thunks ───────────────────────────────────────────────────────────
// Each thunk follows the same pattern:
//   pending   → set loading = true, clear error
//   fulfilled → update state with returned data
//   rejected  → set loading = false, store error message

/** Fetch all products from the backend */
export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await productApi.getAll();
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

/** Create a new product */
export const addProduct = createAsyncThunk<
  Product,
  CreateProductPayload,
  { rejectValue: string }
>('products/add', async (payload, { rejectWithValue }) => {
  try {
    return await productApi.create(payload);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

/** Update an existing product */
export const updateProduct = createAsyncThunk<
  Product,
  { id: number; data: UpdateProductPayload },
  { rejectValue: string }
>('products/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await productApi.update(id, data);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

/** Delete a product by id */
export const deleteProduct = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('products/delete', async (id, { rejectWithValue }) => {
  try {
    return await productApi.remove(id);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

// ── Slice ──────────────────────────────────────────────────────────────────
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /** Manually clear the error (e.g. when a Snackbar is dismissed) */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchProducts ──────────────────────────────────────────────────
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load products.';
      });

    // ── addProduct ─────────────────────────────────────────────────────
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to add product.';
      });

    // ── updateProduct ──────────────────────────────────────────────────
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update product.';
      });

    // ── deleteProduct ──────────────────────────────────────────────────
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to delete product.';
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
