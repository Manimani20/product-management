import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { NotificationSeverity } from '../types/product';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  onClose: () => void;
}

/**
 * Global notification banner — wraps MUI Snackbar + Alert.
 * Shown after successful CRUD operations and on errors.
 */
function Notification({ open, message, severity, onClose }: NotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {/* Alert must always be rendered even when closed so MUI can animate it out */}
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', minWidth: 300 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;
