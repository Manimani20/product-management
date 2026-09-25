import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import type {
  Product,
  ProductFormValues,
  CreateProductPayload,
} from '../types/product';
import { EMPTY_FORM_VALUES, PRODUCT_CATEGORIES } from '../types/product';

interface ProductFormProps {
  open: boolean;
  /** Pass a product to pre-fill the form for editing; null/undefined = add mode */
  product: Product | null;
  loading: boolean;
  onSubmit: (values: CreateProductPayload) => void;
  onClose: () => void;
}

// ── Per-field validation ───────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
}

function validate(values: ProductFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Product name is required.';
  } else if (values.name.trim().length > 200) {
    errors.name = 'Name must be 200 characters or fewer.';
  }

  const priceNum = parseFloat(values.price);
  if (!values.price.trim()) {
    errors.price = 'Price is required.';
  } else if (isNaN(priceNum) || priceNum <= 0) {
    errors.price = 'Price must be a positive number.';
  }

  if (!values.category) {
    errors.category = 'Category is required.';
  }

  return errors;
}

/**
 * Add / Edit product dialog.
 *
 * - In add mode (product = null) the form starts blank.
 * - In edit mode (product != null) the form is pre-filled.
 * - Validates all required fields before calling onSubmit.
 * - Disables the submit button while loading.
 */
function ProductForm({ open, product, loading, onSubmit, onClose }: ProductFormProps) {
  const isEdit = product !== null;

  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Re-populate the form whenever the dialog opens or the target product changes.
  useEffect(() => {
    if (open) {
      if (product) {
        setValues({
          name: product.name,
          price: String(product.price),
          category: product.category,
          description: product.description ?? '',
        });
      } else {
        setValues(EMPTY_FORM_VALUES);
      }
      setErrors({});
      setTouched({});
    }
  }, [open, product]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTextField = (field: keyof ProductFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [field]: e.target.value };
      setValues(next);
      if (touched[field]) {
        setErrors(validate(next));
      }
    };

  const handleBlur = (field: keyof ProductFormValues) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleCategory = (e: SelectChangeEvent) => {
    const next = { ...values, category: e.target.value };
    setValues(next);
    if (touched.category) {
      setErrors(validate(next));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched so all errors surface at once.
    setTouched({ name: true, price: true, category: true, description: true });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      price: parseFloat(values.price),
      category: values.category,
      description: values.description.trim() || undefined,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="product-form-title"
    >
      <DialogTitle id="product-form-title">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Name */}
          <TextField
            label="Product Name"
            value={values.name}
            onChange={handleTextField('name')}
            onBlur={handleBlur('name')}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name ? errors.name : ' '}
            required
            fullWidth
            autoFocus
            disabled={loading}
            inputProps={{ 'aria-label': 'Product name' }}
          />

          {/* Price */}
          <TextField
            label="Price"
            value={values.price}
            onChange={handleTextField('price')}
            onBlur={handleBlur('price')}
            error={touched.price && Boolean(errors.price)}
            helperText={touched.price ? errors.price : ' '}
            required
            fullWidth
            disabled={loading}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            inputProps={{ 'aria-label': 'Product price', inputMode: 'decimal' }}
          />

          {/* Category */}
          <FormControl
            fullWidth
            required
            error={touched.category && Boolean(errors.category)}
            disabled={loading}
          >
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={values.category}
              label="Category"
              onChange={handleCategory}
              onBlur={handleBlur('category')}
              inputProps={{ 'aria-label': 'Product category' }}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {touched.category ? (errors.category ?? ' ') : ' '}
            </FormHelperText>
          </FormControl>

          {/* Description (optional) */}
          <TextField
            label="Description (optional)"
            value={values.description}
            onChange={handleTextField('description')}
            fullWidth
            multiline
            minRows={2}
            disabled={loading}
            inputProps={{ 'aria-label': 'Product description' }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
            aria-label={isEdit ? 'Save changes' : 'Add product'}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ProductForm;
