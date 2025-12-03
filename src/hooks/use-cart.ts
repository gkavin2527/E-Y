'use client';

import { useContext, useMemo } from 'react';
import { products } from '@/lib/data';
import type { CartItem, Product } from '@/lib/types';
import { CartContext, type CartContextType } from '@/context/cart-context';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  // Enhance items with full product details
  const detailedItems = useMemo(() => {
    return context.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null; // Or handle as an error

      return {
        ...item,
        name: product.name,
        price: product.price,
        image: product.images[0],
      } as CartItem;
    }).filter((item): item is CartItem => item !== null);
  }, [context.items]);


  const totalItems = detailedItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = detailedItems.reduce((total, item) => total + item.price * item.quantity, 0);


  return {
    items: detailedItems,
    addItem: context.addItem,
    removeItem: context.removeItem,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    totalItems,
    totalPrice,
  };
};
