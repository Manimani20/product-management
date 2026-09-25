// ── Core product model ─────────────────────────────────────────────────────
// Mirrors the backend Product interface exactly.
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

// ── API payload types ──────────────────────────────────────────────────────
// Used when sending data to the backend.

/** Body for POST /products — id is auto-generated, description optional */
export interface CreateProductPayload {
  name: string;
  price: number;
  category: string;
  description?: string;
}

/** Body for PUT /products/:id — all fields optional */
export type UpdateProductPayload = Partial<CreateProductPayload>;

// ── Form value type ────────────────────────────────────────────────────────
// Used inside React form state. price is a string so an empty
// input field doesn't default to 0 in controlled inputs.
export interface ProductFormValues {
  name: string;
  price: string;       // kept as string in the form; parsed to number on submit
  category: string;
  description: string;
}

export const EMPTY_FORM_VALUES: ProductFormValues = {
  name: '',
  price: '',
  category: '',
  description: '',
};

// ── Category options ───────────────────────────────────────────────────────
// Single source of truth for the category dropdown in the form.
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Footwear',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Toys',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// ── Notification helper type ───────────────────────────────────────────────
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}
