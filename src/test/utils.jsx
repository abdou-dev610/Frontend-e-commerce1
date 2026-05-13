import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

/**
 * Custom render function that wraps components with all necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Additional render options
 * @returns {Object} Render result from @testing-library/react
 */
export const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Create a mock user object for testing
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock user object
 */
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  name: 'Test User',
  phone: '+221771234567',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock product object for testing
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock product object
 */
export const createMockProduct = (overrides = {}) => ({
  id: 'prod-001',
  name: 'Test Product',
  price: 25000,
  description: 'A test product',
  category: 'Lacostes',
  image: 'https://example.com/image.jpg',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  ...overrides,
});

/**
 * Create a mock order object for testing
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock order object
 */
export const createMockOrder = (overrides = {}) => ({
  _id: 'order-001',
  userId: 'test-user-123',
  items: [
    {
      id: 'prod-001',
      name: 'Test Product',
      price: 25000,
      quantity: 2,
      productName: 'Test Product',
    }
  ],
  total: 50000,
  status: 'pending',
  createdAt: new Date().toISOString(),
  shippingAddress: {
    address: '123 Test Street',
    city: 'Dakar',
    postalCode: '10000',
    country: 'Sénégal',
  },
  ...overrides,
});

/**
 * Setup localStorage mock for testing
 * Call this in beforeEach if not using the global setup
 */
export const setupLocalStorageMock = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

/**
 * Mock API response helper
 */
export const mockApiCall = (data, options = {}) => ({
  ok: options.ok !== false,
  status: options.status || 200,
  json: async () => data,
  ...options,
});

export default {
  renderWithProviders,
  createMockUser,
  createMockProduct,
  createMockOrder,
  setupLocalStorageMock,
  mockApiCall,
};
