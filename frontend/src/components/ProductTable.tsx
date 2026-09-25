import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { Product } from '../types/product';
import LoadingSpinner from './LoadingSpinner';

// ── Category chip colours ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  Electronics: 'primary',
  Footwear: 'secondary',
  Clothing: 'success',
  Books: 'warning',
  'Home & Kitchen': 'info',
  Sports: 'success',
  Toys: 'secondary',
  Other: 'default',
};

// ── Price formatter ────────────────────────────────────────────────────────
const formatPrice = (price: number): string =>
  `₹${price.toLocaleString('en-IN')}`;

// ── Props ──────────────────────────────────────────────────────────────────
interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

/**
 * Renders the full product list in a MUI Table.
 *
 * - Shows a LoadingSpinner while data is being fetched.
 * - Shows an empty-state panel when there are no products.
 * - Each row has Edit and Delete icon buttons.
 */
function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  if (loading) {
    return <LoadingSpinner message="Loading products…" />;
  }

  if (products.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <InventoryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No products yet
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Click &ldquo;Add Product&rdquo; to create your first product.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Table aria-label="products table">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              {/* ID */}
              <TableCell>
                <Typography variant="body2" color="text.disabled">
                  {product.id}
                </Typography>
              </TableCell>

              {/* Name */}
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {product.name}
                </Typography>
              </TableCell>

              {/* Price */}
              <TableCell>
                <Typography variant="body2" fontWeight={600} color="primary">
                  {formatPrice(product.price)}
                </Typography>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Chip
                  label={product.category}
                  size="small"
                  color={CATEGORY_COLORS[product.category] ?? 'default'}
                  variant="outlined"
                />
              </TableCell>

              {/* Description */}
              <TableCell sx={{ maxWidth: 260 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.description || '—'}
                </Typography>
              </TableCell>

              {/* Actions */}
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <Tooltip title="Edit product">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(product)}
                      aria-label={`Edit ${product.name}`}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete product">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(product)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ProductTable;
