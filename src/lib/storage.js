// Storage utilities for cart persistence

const CART_STORAGE_KEY = 'cart_items';

/**
 * Get cart items from localStorage
 * @returns {Array} Array of cart items or empty array if none found
 */
export const getCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading cart from storage:', error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 * @param {Array} items - Array of cart items to save
 */
export const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

/**
 * Clear cart from localStorage
 */
export const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart from storage:', error);
  }
};

/**
 * Get cart total from items array
 * @param {Array} items - Array of cart items
 * @returns {Number} Total price
 */
export const calculateCartTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
};

/**
 * Get cart item count from items array
 * @param {Array} items - Array of cart items
 * @returns {Number} Total number of items
 */
export const calculateItemCount = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};
