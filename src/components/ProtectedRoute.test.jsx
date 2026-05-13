import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import * as authApi from '@/integrations/api/client';

// Mock the API client
vi.mock('@/integrations/api/client', async () => {
  const actual = await vi.importActual('@/integrations/api/client');
  return {
    ...actual,
    authApi: {
      verifyToken: vi.fn(),
    },
    setToken: vi.fn((token) => {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }),
    setRefreshToken: vi.fn((token) => {
      if (token) {
        localStorage.setItem('refreshToken', token);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }),
    getToken: () => localStorage.getItem('authToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
  };
});

const TestRoutes = ({ withAdmin = false }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div data-testid="dashboard">Dashboard</div>
          </ProtectedRoute>
        }
      />
      {withAdmin && (
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <div data-testid="admin-panel">Admin Panel</div>
            </ProtectedRoute>
          }
        />
      )}
    </Routes>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.history.pushState({}, 'Test', '/');
  });

  it('should redirect unauthenticated users to login', async () => {
    vi.mocked(authApi.authApi.verifyToken).mockResolvedValueOnce({
      user: null,
    });

    render(
      <AuthProvider>
        <TestRoutes />
      </AuthProvider>
    );

    // Navigate to protected route
    window.history.pushState({}, 'Test', '/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should render protected content for authenticated users', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User', isAdmin: false };
    localStorage.setItem('authToken', 'test-token');

    vi.mocked(authApi.authApi.verifyToken).mockResolvedValueOnce({
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestRoutes />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('should show loading spinner while verifying token', async () => {
    localStorage.setItem('authToken', 'test-token');

    vi.mocked(authApi.authApi.verifyToken).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ user: { email: 'test@example.com' } }), 100))
    );

    const { container } = render(
      <AuthProvider>
        <TestRoutes />
      </AuthProvider>
    );

    // Should show loading spinner initially
    const spinnerContainer = container.querySelector('.animate-spin');
    expect(spinnerContainer).toBeInTheDocument();
  });

  it('should redirect non-admin users from admin routes', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User', isAdmin: false };
    localStorage.setItem('authToken', 'test-token');

    vi.mocked(authApi.authApi.verifyToken).mockResolvedValueOnce({
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestRoutes withAdmin={true} />
      </AuthProvider>
    );

    // Navigate to admin route
    window.history.pushState({}, 'Test', '/admin');

    await waitFor(() => {
      // Should redirect to home (not admin panel)
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
    });
  });

  it('should allow admin users to access admin routes', async () => {
    const mockAdminUser = { email: 'admin@example.com', name: 'Admin User', isAdmin: true };
    localStorage.setItem('authToken', 'admin-token');

    vi.mocked(authApi.authApi.verifyToken).mockResolvedValueOnce({
      user: mockAdminUser,
    });

    render(
      <AuthProvider>
        <TestRoutes withAdmin={true} />
      </AuthProvider>
    );

    // Navigate to admin route
    window.history.pushState({}, 'Test', '/admin');

    await waitFor(() => {
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
    });
  });
});
