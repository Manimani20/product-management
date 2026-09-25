import { useState } from 'react';
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
 * Phase 8: All components composed with local UI state stubs.
 *          Redux wiring + real API calls are added in Phase 9.
 */
function ProductsPage() {
  // ── Redux state placeholders (replaced in Phase 9) ─────────────────────
  const products: Product[] = [];
  const loading: boolean = false;

  // ── Local UI state ─────────────────────────────────────────────────────
  const [formDialog, setFormDialog] = useState<FormDialogState>(CLOSED_FORM);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(CLOSED_DELETE);
  const [notification, setNotification] = useState<AppNotification>(CLOSED_NOTIFICATION);

  // ── Notification helpers ───────────────────────────────────────────────
  const showNotification = (message: string, severity: AppNotification['severity']) => {
    setNotification({ open: true, message, severity });
  };
  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  // ── Form dialog handlers ───────────────────────────────────────────────
  const handleOpenAdd = () => setFormDialog({ open: true, product: null });
  const handleOpenEdit = (product: Product) =>
    setFormDialog({ open: true, product });
  const handleCloseForm = () => setFormDialog(CLOSED_FORM);

  const handleFormSubmit = (_values: CreateProductPayload) => {
    // Phase 9: dispatch addProduct / updateProduct thunk here.
    // For now, just close and show a placeholder notification.
    const isEdit = formDialog.product !== null;
    handleCloseForm();
    showNotification(
      isEdit ? 'Product updated successfully.' : 'Product added successfully.',
      'success',
    );
  };

  // ── Delete dialog handlers ─────────────────────────────────────────────
  const handleOpenDelete = (product: Product) =>
    setDeleteDialog({ open: true, product });
  const handleCloseDelete = () => setDeleteDialog(CLOSED_DELETE);

  const handleConfirmDelete = () => {
    // Phase 9: dispatch deleteProduct thunk here.
    // For now, just close and show a placeholder notification.
    handleCloseDelete();
    showNotification('Product deleted successfully.', 'success');
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
            aria-label="Add new product"
          >
            Add Product
          </Button>
        </Box>

        {/* Product list */}
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </Container>

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      <ProductForm
        open={formDialog.open}
        product={formDialog.product}
        loading={loading}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        productName={deleteDialog.product?.name ?? ''}
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
      />

      {/* ── Notification ──────────────────────────────────────────────── */}
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
