import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem, EntityId, Product } from '../types';

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: EntityId, size: string) => void;
  updateQuantity: (productId: EntityId, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'asc_camberene_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CartItem[];
    } catch {}
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);

  const addToCart = useCallback((product: Product, size: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map(i => i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, size, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: EntityId, size: string) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: EntityId, size: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId, size); return; }
    setCart(prev => prev.map(i => (i.product.id === productId && i.size === size ? { ...i, quantity } : i)));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);
  const getCartTotal = useCallback(() => cart.reduce((t, i) => t + i.product.price * i.quantity, 0), [cart]);
  const getCartItemsCount = useCallback(() => cart.reduce((c, i) => c + i.quantity, 0), [cart]);

  const value: CartContextValue = { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemsCount };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>.');
  return ctx;
};
