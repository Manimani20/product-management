import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Centered loading indicator with an optional caption.
 * Used as a full-area overlay while data is being fetched.
 */
function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;
