import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ProductsPage from './pages/ProductsPage';

// ── MUI Theme ──────────────────────────────────────────────────────────────
// Clean blue primary palette, good table contrast, responsive typography.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',       // slightly deeper blue — better contrast on white
      light: '#1976d2',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#e53935',       // clear red for destructive actions (delete)
    },
    background: {
      default: '#f5f5f5',    // light grey page background
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',   // no ALL-CAPS buttons
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#e3f2fd',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        },
      },
    },
  },
});

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline applies a consistent CSS reset across browsers */}
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          {/* Redirect any unknown paths back to the product list */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
