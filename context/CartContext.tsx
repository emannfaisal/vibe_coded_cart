'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types/database';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, customFieldValues: Record<string, string>, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  toastMessage: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'petal_ink_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved cart:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on updates
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items, isLoaded]);

  const generateCartItemId = (productId: string, customFieldValues: Record<string, string>) => {
    const serializedCustoms = Object.keys(customFieldValues)
      .sort()
      .map((k) => `${k}:${customFieldValues[k]}`)
      .join('|');
    return `${productId}-${serializedCustoms}`;
  };

  const addItem = (product: Product, customFieldValues: Record<string, string>, quantity: number = 1) => {
    const cartItemId = generateCartItemId(product.id, customFieldValues);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: cartItemId,
            product,
            quantity,
            customFieldValues,
          },
        ];
      }
    });

    setToastMessage(`Added "${product.name}" to cart`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
