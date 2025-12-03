
'use client';

import { useContext, useMemo } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { CartContext, type CartContextType } from '@/context/cart-context';

export const useCart = (): CartContextType & { totalItems: number; totalPrice: number } => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const { items, addItem, removeItem, updateQuantity, clearCart, isCartLoading } = context;

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  return {
    items,
    isCartLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
};
