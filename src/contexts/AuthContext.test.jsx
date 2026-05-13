import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { setToken, setRefreshToken } from '@/integrations/api/client';
import * as authApi from '@/integrations/api/client';

// Mock the API client
vi.mock('@/integrations/api/client', async () => {
  const actual = await vi.importActual('@/integrations/api/client');
  return {
    ...actual,
    authApi: {
      signup: vi.fn(),
      signin: vi.fn(),
      adminSignin: vi.fn(),
      verifyToken: vi.fn(),
      refresh: vi.fn(),
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

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, isAdmin, loading, signIn, signUp, signOut } = useAuth();

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {user ? (
        <>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-admin">{isAdmin ? 'Admin' : 'User'}</div>
          <button onClick={signOut} data-testid="logout-btn">
            Logout
          </button>
        </>
      ) : (
        <div data-testid="no-user">Not authenticated</div>
      )}
      <button
        onClick={() => signIn('test@example.com', 'password')}
        data-testid="login-btn"
      >
        Login
      </button>
      <button
        onClick={() => signUp('test@example.com', 'password', 'Test User', '221771234567')}
        data-testid="signup-btn"
      >
        Signup
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render with no user initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  it('should sign in user and set token', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User', isAdmin: false };
    vi.mocked(authApi.authApi.signin).mockResolvedValueOnce({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const loginBtn = screen.getByTestId('login-btn');
    await userEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
  });

  it('should sign up user', async () => {
    const mockUser = { email: 'new@example.com', name: 'New User', isAdmin: false };
    vi.mocked(authApi.authApi.signup).mockResolvedValueOnce({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const signupBtn = screen.getByTestId('signup-btn');
    await userEvent.click(signupBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    });
  });

  it('should sign out user and clear tokens', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User', isAdmin: false };
    vi.mocked(authApi.authApi.signin).mockResolvedValueOnce({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Sign in
    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    // Sign out
    await userEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should verify token on mount', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User', isAdmin: false };
    localStorage.setItem('authToken', 'existing-token');

    vi.mocked(authApi.authApi.verifyToken).mockResolvedValueOnce({
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(authApi.authApi.verifyToken).toHaveBeenCalled();
  });

  it('should clear tokens if verification fails', async () => {
    localStorage.setItem('authToken', 'invalid-token');

    vi.mocked(authApi.authApi.verifyToken).mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should set admin flag for admin users', async () => {
    const mockAdminUser = { email: 'admin@example.com', name: 'Admin User', isAdmin: true };
    vi.mocked(authApi.authApi.signin).mockResolvedValueOnce({
      token: 'admin-token',
      refreshToken: 'admin-refresh-token',
      user: mockAdminUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-admin')).toHaveTextContent('Admin');
    });
  });
});
