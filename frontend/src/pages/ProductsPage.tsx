import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';

import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import Notification from '../components/Notification';

import { useAppDispatch, useAppSelector } from '../store/store';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  clearError,
} from '../store/productSlice';

import type { Product, CreateProductPayload, AppNotification } from '../types/product';

// ── Local UI state types ───────────────────────────────────────────────────
interface FormDialogState {
  open: boolean;
  product: Product | null; // null = add mode, Product = edit mode
}

interface DeleteDialogState {
  open: boolean;
  product: Product | null;
}

const CLOSED_FORM: FormDialogState = { open: false, product: null };
const CLOSED_DELETE: DeleteDialogState = { open: false, product: null };
const CLOSED_NOTIFICATION: AppNotification = {
  open: false,
  message: '',
  severity: 'success',
};

/**
 * ProductsPage — main route component.
 *
 * Reads product list, loading state, and error from Redux store.
 * Dispatches fetchProducts on mount, and thunks for add / update / delete.
 * Shows a Snackbar notification after every operation (success or error).
 */
function ProductsPage() {
  const dispatch = useAppDispatch();

  // ── Redux state ────────────────────────────────────────────────────────
  const { products: rawProducts, loading, error } = useAppSelector((state) => state.products);
  // Always work with a guaranteed array — guards against any race condition
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  // ── Local UI state ─────────────────────────────────────────────────────
  const [formDialog, setFormDialog] = useState<FormDialogState>(CLOSED_FORM);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(CLOSED_DELETE);
  const [notification, setNotification] = useState<AppNotification>(CLOSED_NOTIFICATION);

  // ── Fetch products on mount ────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // ── Show Redux errors in the notification bar ──────────────────────────
  useEffect(() => {
    if (error) {
      setNotification({ open: true, message: error, severity: 'error' });
    }
  }, [error]);

  // ── Notification helpers ───────────────────────────────────────────────
  const showSuccess = (message: string) =>
    setNotification({ open: true, message, severity: 'success' });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
    // Clear the Redux error so it doesn't re-trigger the effect
    dispatch(clearError());
  };

  // ── Form dialog handlers ───────────────────────────────────────────────
  const handleOpenAdd = () => setFormDialog({ open: true, product: null });

  const handleOpenEdit = (product: Product) =>
    setFormDialog({ open: true, product });

  const handleCloseForm = () => setFormDialog(CLOSED_FORM);

  const handleFormSubmit = async (values: CreateProductPayload) => {
    const isEdit = formDialog.product !== null;

    if (isEdit && formDialog.product) {
      // ── Update existing product ──────────────────────────────────────
      const result = await dispatch(
        updateProduct({ id: formDialog.product.id, data: values }),
      );
      if (updateProduct.fulfilled.match(result)) {
        handleCloseForm();
        showSuccess(`"${result.payload.name}" updated successfully.`);
      }
      // On rejection, the Redux error effect shows the error Snackbar —
      // we keep the dialog open so the user can correct and retry.
    } else {
      // ── Create new product ───────────────────────────────────────────
      const result = await dispatch(addProduct(values));
      if (addProduct.fulfilled.match(result)) {
        handleCloseForm();
        showSuccess(`"${result.payload.name}" added successfully.`);
      }
    }
  };

  // ── Delete dialog handlers ─────────────────────────────────────────────
  const handleOpenDelete = (product: Product) =>
    setDeleteDialog({ open: true, product });

  const handleCloseDelete = () => setDeleteDialog(CLOSED_DELETE);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return;

    const { id, name } = deleteDialog.product;
    const result = await dispatch(deleteProduct(id));

    if (deleteProduct.fulfilled.match(result)) {
      handleCloseDelete();
      showSuccess(`"${name}" deleted successfully.`);
    }
    // On rejection, the dialog stays open; the error effect shows a Snackbar.
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── AppBar ───────────────────────────────────────────────────── */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <InventoryIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {products.length} product{products.length !== 1 ? 's' : ''}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ── Page body ─────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Products
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={loading}
            aria-label="Add new product"
          >
            Add Product
          </Button>
        </Box>

        {/* Product list table */}
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </Container>

      {/* ── Add / Edit dialog ─────────────────────────────────────────── */}
      <ProductForm
        open={formDialog.open}
        product={formDialog.product}
        loading={loading}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {/* ── Delete confirmation dialog ────────────────────────────────── */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        productName={deleteDialog.product?.name ?? ''}
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
      />

      {/* ── Global notification Snackbar ──────────────────────────────── */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
}

export default ProductsPage;
