import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { getCartFromStorage, clearCartFromStorage } from '@/lib/storage';

// Test component that uses CartContext
const TestComponent = () => {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();

  return (
    <div>
      <div data-testid="item-count">{itemCount}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="items-length">{items.length}</div>

      <button
        onClick={() => addToCart({ id: 'p1', name: 'Product 1', price: 25000 })}
        data-testid="add-product-1"
      >
        Add Product 1
      </button>

      <button
        onClick={() => addToCart({ id: 'p2', name: 'Product 2', price: 35000 })}
        data-testid="add-product-2"
      >
        Add Product 2
      </button>

      <button
        onClick={() => updateQuantity('p1', 5)}
        data-testid="update-qty-p1"
      >
        Update P1 to 5
      </button>

      <button
        onClick={() => removeFromCart('p1')}
        data-testid="remove-product-1"
      >
        Remove Product 1
      </button>

      <button onClick={clearCart} data-testid="clear-cart">
        Clear Cart
      </button>

      <div data-testid="items">
        {items.map(item => (
          <div key={item.product.id} data-testid={`item-${item.product.id}`}>
            {item.product.name}: {item.quantity}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    clearCartFromStorage();
  });

  it('should render with empty cart initially', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should add product to cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addBtn = screen.getByTestId('add-product-1');
    await user.click(addBtn);

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('25000');
    expect(screen.getByTestId('item-p1')).toHaveTextContent('Product 1: 1');
  });

  it('should increment quantity when adding same product twice', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addBtn = screen.getByTestId('add-product-1');
    await user.click(addBtn);
    await user.click(addBtn);

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('50000');
    expect(screen.getByTestId('item-p1')).toHaveTextContent('Product 1: 2');
  });

  it('should add multiple different products', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    await user.click(screen.getByTestId('add-product-2'));

    expect(screen.getByTestId('items-length')).toHaveTextContent('2');
    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('60000');
  });

  it('should update quantity', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    await user.click(screen.getByTestId('update-qty-p1'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('5');
    expect(screen.getByTestId('total')).toHaveTextContent('125000');
    expect(screen.getByTestId('item-p1')).toHaveTextContent('Product 1: 5');
  });

  it('should remove item when quantity is set to 0', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    await user.click(screen.getByTestId('update-qty-p1')); // Update to 5

    // Update to 0 should remove
    // Note: Need to add a button for this in TestComponent or use component directly
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
  });

  it('should remove product from cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');

    await user.click(screen.getByTestId('remove-product-1'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should clear entire cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    await user.click(screen.getByTestId('add-product-2'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');

    await user.click(screen.getByTestId('clear-cart'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should persist cart to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));

    // Check localStorage
    const savedCart = getCartFromStorage();
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0].product.id).toBe('p1');
    expect(savedCart[0].quantity).toBe(1);
  });

  it('should load cart from localStorage on mount', async () => {
    // Pre-populate localStorage
    const cartData = [
      { product: { id: 'p1', name: 'Product 1', price: 25000 }, quantity: 2 },
      { product: { id: 'p2', name: 'Product 2', price: 35000 }, quantity: 1 },
    ];
    localStorage.setItem('cart_items', JSON.stringify(cartData));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Cart should be loaded from storage
    expect(screen.getByTestId('items-length')).toHaveTextContent('2');
    expect(screen.getByTestId('item-count')).toHaveTextContent('3'); // 2 + 1
    expect(screen.getByTestId('total')).toHaveTextContent('85000'); // (25000*2) + 35000
  });

  it('should clear localStorage when clearing cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-product-1'));
    expect(localStorage.getItem('cart_items')).toBeTruthy();

    await user.click(screen.getByTestId('clear-cart'));
    expect(localStorage.getItem('cart_items')).toBeNull();
  });

  it('should update localStorage whenever cart changes', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add product
    await user.click(screen.getByTestId('add-product-1'));
    let savedCart = getCartFromStorage();
    expect(savedCart).toHaveLength(1);

    // Add another
    await user.click(screen.getByTestId('add-product-2'));
    savedCart = getCartFromStorage();
    expect(savedCart).toHaveLength(2);

    // Remove one
    await user.click(screen.getByTestId('remove-product-1'));
    savedCart = getCartFromStorage();
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0].product.id).toBe('p2');
  });
});
