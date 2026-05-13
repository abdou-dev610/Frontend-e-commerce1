import { createContext, useContext, useState, useEffect } from "react";
import { getCartFromStorage, saveCartToStorage, clearCartFromStorage } from "@/lib/storage";

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const savedItems = getCartFromStorage();
    setItems(savedItems);
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(items);
    }
  }, [items, isLoading]);

  // Retourne l'id stable d'un produit (MongoDB _id ou id local)
  const pid = (p) => p?._id || p?.id;

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => pid(i.product) === pid(product));
      if (existing) {
        return prev.map((i) =>
          pid(i.product) === pid(product) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => pid(i.product) !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (pid(i.product) === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    clearCartFromStorage();
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};
