import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';

interface DeleteConfirmDialogProps {
  open: boolean;
  productName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown before deleting a product.
 * Disables both buttons while the delete request is in flight.
 */
function DeleteConfirmDialog({
  open,
  productName,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Delete Product
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete{' '}
          <strong>&ldquo;{productName}&rdquo;</strong>? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          color="inherit"
          aria-label="Cancel delete"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          aria-label={`Confirm delete ${productName}`}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmDialog;
